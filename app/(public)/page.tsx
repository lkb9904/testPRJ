import { HomeContent } from "@/components/public/home-content";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";

function buildListedAtLabel(d: Date): string {
  const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()] ?? "";
  const day = d.getDate();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${day}일(${w})${h}:${m} 기준`;
}

export default async function HomePage() {
  const { profileRole } = await getPublicSession();
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, unit_label, unit_price_krw, sort_order, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(12);

  return (
    <HomeContent
      profileRole={profileRole}
      products={products ?? []}
      listedAtLabel={buildListedAtLabel(new Date())}
    />
  );
}
