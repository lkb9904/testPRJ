"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PlacePickupInput = {
  pickupLocationId: string;
  items: { productId: string; quantity: number }[];
};

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
  const { data, error } = await supabase.rpc("place_pickup_order", {
    p_pickup_location_id: input.pickupLocationId,
    p_items: items,
  });

  if (error) {
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
