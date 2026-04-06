import { HomeContent } from "@/components/public/home-content";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";
import type { BrixWithProduct } from "@/lib/types/brix";

export default async function HomePage() {
  const { profileRole } = await getPublicSession();
  const supabase = await createClient();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [bannersRes, productsRes, categoriesRes, brixRes] = await Promise.all([
    supabase
      .from("banners")
      .select("id, title, subtitle, image_url, link_href, bg_color, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(6),
    supabase
      .from("products")
      .select(
        "id, name, unit_price_krw, sale_price_krw, discount_percent, delivery_type, badge, image_url, review_count, unit_label, category_id, sort_order",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("review_count", { ascending: false })
      .limit(24),
    supabase
      .from("product_categories")
      .select("id, name, slug, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("brix_measurements")
      .select("id, product_id, measured_brix, baseline_brix, photo_url, description, curator_name, measured_at, is_active, products(name, image_url)")
      .eq("is_active", true)
      .gte("measured_at", `${todayStr}T00:00:00`)
      .order("measured_at", { ascending: false })
      .limit(10),
  ]);

  const brixMeasurements: BrixWithProduct[] = (brixRes.data ?? []).map((r) => {
    const prod = r.products as unknown as { name: string; image_url: string | null } | null;
    return {
      id: r.id,
      product_id: r.product_id,
      measured_brix: Number(r.measured_brix),
      baseline_brix: Number(r.baseline_brix),
      photo_url: r.photo_url,
      description: r.description,
      curator_name: r.curator_name,
      measured_at: r.measured_at,
      is_active: r.is_active,
      created_at: r.measured_at,
      product_name: prod?.name ?? "",
      product_image_url: prod?.image_url ?? null,
    };
  });

  return (
    <HomeContent
      profileRole={profileRole}
      banners={bannersRes.data ?? []}
      products={(productsRes.data ?? []) as never[]}
      categories={categoriesRes.data ?? []}
      brixMeasurements={brixMeasurements}
    />
  );
}
