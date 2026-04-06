import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";
import { AddressesClient } from "./addresses-client";

export const metadata = { title: "배송지 관리 · 새벽과일" };

export default async function AddressesPage() {
  const { user } = await getPublicSession();
  if (!user) return null;

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!customer) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-[#1a1f1c]">배송지 관리</h2>
        <p className="mt-4 text-sm text-[#5c6b63]">배송지를 등록하려면 먼저 주문을 진행해 주세요.</p>
      </div>
    );
  }

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customer.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return <AddressesClient customerId={customer.id} addresses={addresses ?? []} />;
}
