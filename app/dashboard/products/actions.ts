"use server";

import { assertStaff } from "@/lib/dashboard/staff-guard";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "상품명을 입력해 주세요." };

  const description = formData.get("description")?.toString().trim() || null;
  const sku = formData.get("sku")?.toString().trim() || null;
  const unit_label = formData.get("unit_label")?.toString().trim() || "박스";
  const unit_price_krw = Math.max(
    0,
    Math.floor(Number(formData.get("unit_price_krw") || 0)),
  );
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";
  const image_url = formData.get("image_url")?.toString().trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name,
    description,
    sku: sku || null,
    unit_label,
    unit_price_krw,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_active,
    image_url,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  revalidatePath("/pickup");
  return { ok: true };
}

export async function updateProduct(formData: FormData) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const id = formData.get("id")?.toString();
  if (!id) return { error: "잘못된 요청입니다." };

  const name = formData.get("name")?.toString().trim();
  if (!name) return { error: "상품명을 입력해 주세요." };

  const description = formData.get("description")?.toString().trim() || null;
  const sku = formData.get("sku")?.toString().trim() || null;
  const unit_label = formData.get("unit_label")?.toString().trim() || "박스";
  const unit_price_krw = Math.max(
    0,
    Math.floor(Number(formData.get("unit_price_krw") || 0)),
  );
  const sort_order = Number(formData.get("sort_order") || 0);
  const is_active = formData.get("is_active") === "on";
  const image_url = formData.get("image_url")?.toString().trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      sku: sku || null,
      unit_label,
      unit_price_krw,
      sort_order: Number.isFinite(sort_order) ? sort_order : 0,
      is_active,
      image_url,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  revalidatePath("/pickup");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const gate = await assertStaff();
  if ("error" in gate) return gate;

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  revalidatePath("/pickup");
  return { ok: true };
}
