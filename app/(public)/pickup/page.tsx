import Link from "next/link";
import { isStaffOrAdmin } from "@/lib/auth/profile-role";
import { PickupOrderClient } from "@/components/public/pickup-order-client";
import { createClient } from "@/lib/supabase/server";
import { getPublicSession } from "@/lib/supabase/public-session";

export const metadata = {
  title: "픽업 주문 · 새벽과일",
  description: "매장·지정 장소에서 픽업하는 주문 안내",
};

export default async function PickupPage() {
  const { user, profileRole } = await getPublicSession();
  const canManageStock =
    profileRole != null && isStaffOrAdmin(profileRole);
  const supabase = await createClient();

  const [locRes, prodRes, stockRes] = await Promise.all([
    supabase
      .from("pickup_locations")
      .select("id, name, address, detail_note, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, unit_label, unit_price_krw, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("pickup_product_stock").select("pickup_location_id, product_id, quantity_available"),
  ]);

  const locations = locRes.data ?? [];
  const products = prodRes.data ?? [];
  const stockRows = stockRes.data ?? [];

  const stockMap = new Map<string, number>();
  for (const s of stockRows) {
    stockMap.set(
      `${s.pickup_location_id}:${s.product_id}`,
      s.quantity_available,
    );
  }

  const catalogError = prodRes.error || stockRes.error;
  const stockMapObj = Object.fromEntries(stockMap);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <p className="text-sm font-medium text-[#166534]">픽업 주문</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14532d] md:text-3xl">
        매장·지정 장소에서 픽업
      </h1>
      <p className="mt-4 text-[#5c6b63] leading-relaxed">
        비회원은 이름·휴대폰만 입력하면 주문할 수 있고, 회원은 로그인 후 주문하면
        계정에 연결됩니다. 결제·픽업 안내는 순차적으로 연락드릴 예정입니다.
      </p>

      <div
        className="mt-6 rounded-xl border border-[#c5d4cc] bg-white px-4 py-3 text-sm leading-relaxed text-[#374151] shadow-sm"
        role="note"
      >
        <p className="font-medium text-[#14532d]">안내</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[#5c6b63]">
          <li>
            장소별 <strong className="text-[#374151]">픽업 가능 수량</strong>을 넘기면
            주문되지 않습니다.
          </li>
          {canManageStock ? (
            <li>
              재고는{" "}
              <Link
                href="/dashboard/stock"
                className="font-medium text-[#166534] underline underline-offset-2"
              >
                관리자 · 픽업 재고
              </Link>
              에서 조정할 수 있습니다.
            </li>
          ) : null}
        </ul>
      </div>

      {catalogError ? (
        <p className="mt-8 text-sm text-amber-800 dark:text-amber-200">
          상품·재고 정보를 불러오지 못했습니다. 마이그레이션과 RLS를 확인해 주세요.
        </p>
      ) : (
        <PickupOrderClient
          locations={locations}
          products={products}
          stockMap={stockMapObj}
          user={user}
        />
      )}

      <ol className="mt-10 space-y-4 text-sm text-[#374151]">
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            1
          </span>
          <span>
            <strong className="text-[#14532d]">장소·수량</strong> — 픽업 장소를 고르고 담을
            수량을 입력합니다.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            2
          </span>
          <span>
            <strong className="text-[#14532d]">주문 접수</strong> — 주문번호로 접수 내역을
            확인할 수 있습니다.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            3
          </span>
          <span>
            <strong className="text-[#14532d]">결제·픽업</strong> — 결제 및 픽업 일정은 별도
            안내 예정입니다.
          </span>
        </li>
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
        <Link
          href="/"
          className="inline-flex rounded-lg border border-[#d1ddd6] px-4 py-2 font-medium text-[#374151] hover:bg-[#fafdfb]"
        >
          쇼핑 홈
        </Link>
        <Link
          href="/delivery"
          className="inline-flex rounded-lg border border-[#d1ddd6] px-4 py-2 font-medium text-[#374151] hover:bg-[#fafdfb]"
        >
          배송 안내
        </Link>
      </div>
    </main>
  );
}
