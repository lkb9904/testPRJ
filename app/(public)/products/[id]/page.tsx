import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import type { Product, WeightOption } from "@/lib/types/product";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description")
    .eq("id", id)
    .single();
  if (!data) return { title: "상품을 찾을 수 없습니다" };
  return {
    title: `${data.name} · 새벽과일`,
    description: data.description ?? `${data.name} 상세 정보`,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  const product: Product = {
    ...data,
    weight_options: (data.weight_options ?? []) as WeightOption[],
  };

  const { data: related } = await supabase
    .from("products")
    .select("id, name, unit_price_krw, sale_price_krw, discount_percent, delivery_type, badge, image_url, review_count, unit_label")
    .eq("is_active", true)
    .neq("id", id)
    .order("sort_order", { ascending: true })
    .limit(4);

  return <ProductDetailClient product={product} related={related ?? []} />;
}
