"use server";

import { assertStaff } from "@/lib/dashboard/staff-guard";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInventoryAlert(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const product_label = formData.get("product_label")?.toString().trim();
  if (!product_label) return { error: "표시 이름을 입력해 주세요." };

  const message = formData.get("message")?.toString().trim() || null;
  const severity = formData.get("severity")?.toString() || "warning";
  if (!["info", "warning", "critical"].includes(severity)) {
    return { error: "심각도 값이 올바르지 않습니다." };
  }

  const product_id = formData.get("product_id")?.toString().trim() || null;
  const pickup_location_id =
    formData.get("pickup_location_id")?.toString().trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("inventory_alerts").insert({
    product_label,
    message,
    severity,
    product_id: product_id || null,
    pickup_location_id: pickup_location_id || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function resolveInventoryAlert(id: string) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const supabase = await createClient();
  const { error } = await supabase
    .from("inventory_alerts")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/alerts");
  revalidatePath("/dashboard");
  return { ok: true };
}
