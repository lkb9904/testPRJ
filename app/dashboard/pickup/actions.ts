"use server";

import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertStaff(): Promise<{ ok: true } | { error: string }> {
  const s = await getSessionRole();
  if (!s || (s.role !== "admin" && s.role !== "staff")) {
    return { error: "픽업 장소를 관리할 권한이 없습니다." };
  }
  return { ok: true };
}

export async function createPickupLocation(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "이름을 입력해 주세요." };

  const address = formData.get("address")?.toString().trim() || null;
  const detail_note = formData.get("detail_note")?.toString().trim() || null;
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("pickup_locations").insert({
    name,
    address,
    detail_note,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_active,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/pickup");
  return { ok: true };
}

export async function updatePickupLocation(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const id = formData.get("id")?.toString();
  if (!id) return { error: "잘못된 요청입니다." };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "이름을 입력해 주세요." };

  const address = formData.get("address")?.toString().trim() || null;
  const detail_note = formData.get("detail_note")?.toString().trim() || null;
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("pickup_locations")
    .update({
      name,
      address,
      detail_note,
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/pickup");
  return { ok: true };
}

export async function deletePickupLocation(id: string) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const supabase = await createClient();
  const { error } = await supabase
    .from("pickup_locations")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/pickup");
  return { ok: true };
}
