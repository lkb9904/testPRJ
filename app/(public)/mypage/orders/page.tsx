import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";
import { formatKrw } from "@/lib/types/product";

export const metadata = { title: "주문 내역 · 새벽과일" };

const statusColors: Record<string, string> = {
  주문접수: "bg-blue-100 text-blue-800",
  결제완료: "bg-emerald-100 text-emerald-800",
  픽업대기: "bg-amber-100 text-amber-800",
  배송준비: "bg-amber-100 text-amber-800",
  배송중: "bg-indigo-100 text-indigo-800",
  완료: "bg-gray-100 text-gray-800",
  취소: "bg-red-100 text-red-800",
};

export default async function MyOrdersPage() {
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
        <h2 className="text-lg font-semibold text-[#1a1f1c]">주문 내역</h2>
        <p className="mt-4 text-sm text-[#5c6b63]">아직 주문 내역이 없습니다.</p>
        <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#166534] px-5 py-2 text-sm font-medium text-white hover:bg-[#14532d]">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, order_type, status, total_amount, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const list = orders ?? [];

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1a1f1c]">주문 내역</h2>
      {list.length === 0 ? (
        <>
          <p className="mt-4 text-sm text-[#5c6b63]">아직 주문 내역이 없습니다.</p>
          <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#166534] px-5 py-2 text-sm font-medium text-white hover:bg-[#14532d]">
            쇼핑하러 가기
          </Link>
        </>
      ) : (
        <ul className="mt-4 divide-y divide-[#eef2ee]">
          {list.map((o) => (
            <li key={o.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-[#1a1f1c]">
                    주문번호 <span className="font-mono">{o.order_number}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-[#9ca3a0]">
                    {new Date(o.created_at).toLocaleDateString("ko-KR")} ·{" "}
                    {o.order_type === "pickup" ? "픽업" : o.order_type === "delivery" ? "배송" : "공구"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[o.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {o.status}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#1a1f1c]">
                    {formatKrw(o.total_amount)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
