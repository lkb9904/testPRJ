import { CheckoutClient } from "./checkout-client";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";

export const metadata = {
  title: "주문하기 · 새벽과일",
};

export default async function CheckoutPage() {
  const { user } = await getPublicSession();
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("pickup_locations")
    .select("id, name, address")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return <CheckoutClient user={user} locations={locations ?? []} />;
}
