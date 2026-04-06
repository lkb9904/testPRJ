import { HomeContent } from "@/components/public/home-content";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";

export default async function HomePage() {
  const { profileRole } = await getPublicSession();
  const supabase = await createClient();

  const [bannersRes, productsRes, categoriesRes] = await Promise.all([
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
  ]);

  return (
    <HomeContent
      profileRole={profileRole}
      banners={bannersRes.data ?? []}
      products={(productsRes.data ?? []) as never[]}
      categories={categoriesRes.data ?? []}
    />
  );
}
