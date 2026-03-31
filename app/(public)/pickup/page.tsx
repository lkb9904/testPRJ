import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "픽업 주문 · 새벽과일",
  description: "매장·지정 장소에서 픽업하는 주문 안내",
};

export default async function PickupPage() {
  const supabase = await createClient();
  const { data: locations, error } = await supabase
    .from("pickup_locations")
    .select("id, name, address, detail_note, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <p className="text-sm font-medium text-[#166534]">픽업 주문</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14532d] md:text-3xl">
        매장·지정 장소에서 픽업
      </h1>
      <p className="mt-4 text-[#5c6b63] leading-relaxed">
        원하시는 과일·수량을 담은 뒤 픽업 일시와 장소를 선택합니다. 결제 및
        픽업 가능 시간은 오픈 시 순차적으로 안내드릴 예정입니다.
      </p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-[#14532d]">픽업 가능 장소</h2>
        {error ? (
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
            장소 목록을 불러오지 못했습니다. Supabase에 마이그레이션
            `20260331180000_pickup_locations_anon_select.sql` 적용 여부를
            확인해 주세요.
          </p>
        ) : (locations?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-[#5c6b63]">
            아직 등록된 픽업 장소가 없습니다. 관리자 화면에서 추가할 수 있어요.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {locations!.map((loc) => (
              <li
                key={loc.id}
                className="rounded-xl border border-[#dfe8e2] bg-white/90 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/40"
              >
                <p className="font-medium text-[#14532d]">{loc.name}</p>
                {loc.address ? (
                  <p className="mt-1 text-[#5c6b63]">{loc.address}</p>
                ) : null}
                {loc.detail_note ? (
                  <p className="mt-1 text-xs text-[#7a8a82]">{loc.detail_note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ol className="mt-10 space-y-4 text-sm text-[#374151]">
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            1
          </span>
          <span>
            <strong className="text-[#14532d]">상품 담기</strong> — 원하는
            품목·박스 수량을 선택합니다.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            2
          </span>
          <span>
            <strong className="text-[#14532d]">픽업 장소·시간</strong> — 가까운
            픽업 장소와 방문 가능 시간대를 고릅니다.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-semibold text-white">
            3
          </span>
          <span>
            <strong className="text-[#14532d]">결제·알림</strong> — 결제 완료 후
            픽업 당일 알림을 받습니다.
          </span>
        </li>
      </ol>

      <div className="mt-12 rounded-2xl border border-dashed border-[#c5d4cc] bg-white/80 p-6 text-center text-sm text-[#5c6b63]">
        실제 주문·결제 연동은 상품·재고 데이터와 함께 연결할 수 있습니다.
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d]"
          >
            로그인하고 진행하기
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-lg border border-[#d1ddd6] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#fafdfb]"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
