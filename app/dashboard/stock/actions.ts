"use server";

import { assertStaff } from "@/lib/dashboard/staff-guard";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertPickupStock(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const pickup_location_id = formData.get("pickup_location_id")?.toString();
  const product_id = formData.get("product_id")?.toString();
  const raw = formData.get("quantity_available")?.toString() ?? "0";
  const quantity_available = Math.max(0, Math.floor(Number(raw)));

  if (!pickup_location_id || !product_id) {
    return { error: "장소·상품 정보가 없습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pickup_product_stock").upsert(
    {
      pickup_location_id,
      product_id,
      quantity_available,
    },
    { onConflict: "pickup_location_id,product_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/stock");
  revalidatePath("/pickup");
  return { ok: true };
}
