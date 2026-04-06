import { Suspense } from "react";
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

  return (
    <Suspense fallback={
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <h1 className="text-xl font-bold text-[#1a1f1c]">주문하기</h1>
        <p className="mt-4 text-sm text-[#9ca3a0]">불러오는 중...</p>
      </main>
    }>
      <CheckoutClient user={user} locations={locations ?? []} />
    </Suspense>
  );
}
