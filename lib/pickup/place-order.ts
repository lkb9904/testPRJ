"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PlacePickupInput = {
  pickupLocationId: string;
  items: { productId: string; quantity: number }[];
  /** 비회원 주문 시 필수 (이름·휴대폰) */
  guestName?: string;
  guestPhone?: string;
};

function normalizePhone(s: string): string {
  return s.replace(/\s/g, "").replace(/-/g, "");
}

export async function placePickupOrder(input: PlacePickupInput) {
  const merged = new Map<string, number>();
  for (const row of input.items) {
    const q = Math.floor(Number(row.quantity));
    if (!row.productId || !Number.isFinite(q) || q <= 0) continue;
    merged.set(row.productId, (merged.get(row.productId) ?? 0) + q);
  }

  const items = [...merged.entries()].map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }));

  if (items.length === 0) {
    return { error: "담은 상품이 없습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const guestName = input.guestName?.trim() ?? "";
  const guestPhone = normalizePhone(input.guestPhone ?? "");

  if (!user) {
    if (guestName.length < 2) {
      return { error: "이름을 2자 이상 입력해 주세요." };
    }
    if (guestPhone.length < 9 || !/^[0-9+]+$/.test(guestPhone)) {
      return { error: "연락처(휴대폰)를 올바르게 입력해 주세요." };
    }
  }

  const rpcPayload: Record<string, unknown> = {
    p_pickup_location_id: input.pickupLocationId,
    p_items: items,
  };

  if (!user && guestName && guestPhone) {
    rpcPayload.p_guest_name = guestName;
    rpcPayload.p_guest_phone = guestPhone;
  }

  const { data, error } = await supabase.rpc("place_pickup_order", rpcPayload);

  if (error) {
    if (
      error.message.includes("Could not find the function") ||
      error.message.includes("does not exist") ||
      error.code === "PGRST202"
    ) {
      return {
        error:
          "비회원 주문을 쓰려면 Supabase의 place_pickup_order 함수에 p_guest_name, p_guest_phone 인자를 추가해야 합니다. 저장소의 supabase/migrations 안내를 참고하세요.",
      };
    }
    return { error: error.message };
  }

  const d = data as {
    ok?: boolean;
    error?: string;
    order_number?: string;
  } | null;

  if (!d || typeof d !== "object") {
    return { error: "주문 응답을 해석할 수 없습니다." };
  }

  if (d.ok === false) {
    return { error: d.error ?? "주문에 실패했습니다." };
  }

  if (d.ok === true && d.order_number) {
    revalidatePath("/pickup");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    return { ok: true as const, orderNumber: d.order_number };
  }

  return { error: "주문에 실패했습니다." };
}
