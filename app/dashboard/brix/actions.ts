"use server";

import { assertStaff } from "@/lib/dashboard/staff-guard";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBrix(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const product_id = formData.get("product_id")?.toString();
  if (!product_id) return { error: "상품을 선택해 주세요." };

  const measured_brix = Number(formData.get("measured_brix"));
  const baseline_brix = Number(formData.get("baseline_brix"));
  if (!Number.isFinite(measured_brix) || measured_brix <= 0)
    return { error: "실측 당도를 올바르게 입력해 주세요." };
  if (!Number.isFinite(baseline_brix) || baseline_brix <= 0)
    return { error: "기준 당도를 올바르게 입력해 주세요." };

  const photo_url = formData.get("photo_url")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  const curator_name = formData.get("curator_name")?.toString().trim() || "관리자";
  const measured_at_raw = formData.get("measured_at")?.toString();
  const measured_at = measured_at_raw ? new Date(measured_at_raw).toISOString() : new Date().toISOString();
  const is_active = formData.get("is_active") === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("brix_measurements").insert({
    product_id,
    measured_brix,
    baseline_brix,
    photo_url,
    description,
    curator_name,
    measured_at,
    is_active,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/brix");
  revalidatePath("/");
  revalidatePath("/brix");
  return { ok: true };
}

export async function updateBrix(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const id = formData.get("id")?.toString();
  if (!id) return { error: "잘못된 요청입니다." };

  const product_id = formData.get("product_id")?.toString();
  if (!product_id) return { error: "상품을 선택해 주세요." };

  const measured_brix = Number(formData.get("measured_brix"));
  const baseline_brix = Number(formData.get("baseline_brix"));
  if (!Number.isFinite(measured_brix) || measured_brix <= 0)
    return { error: "실측 당도를 올바르게 입력해 주세요." };
  if (!Number.isFinite(baseline_brix) || baseline_brix <= 0)
    return { error: "기준 당도를 올바르게 입력해 주세요." };

  const photo_url = formData.get("photo_url")?.toString().trim() || null;
  const description = formData.get("description")?.toString().trim() || null;
  const curator_name = formData.get("curator_name")?.toString().trim() || "관리자";
  const measured_at_raw = formData.get("measured_at")?.toString();
  const measured_at = measured_at_raw ? new Date(measured_at_raw).toISOString() : undefined;
  const is_active = formData.get("is_active") === "on";

  const supabase = await createClient();
  const { error } = await supabase
    .from("brix_measurements")
    .update({
      product_id,
      measured_brix,
      baseline_brix,
      photo_url,
      description,
      curator_name,
      ...(measured_at ? { measured_at } : {}),
      is_active,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/brix");
  revalidatePath("/");
  revalidatePath("/brix");
  return { ok: true };
}

export async function deleteBrix(id: string) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const supabase = await createClient();
  const { error } = await supabase.from("brix_measurements").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/brix");
  revalidatePath("/");
  revalidatePath("/brix");
  return { ok: true };
}
