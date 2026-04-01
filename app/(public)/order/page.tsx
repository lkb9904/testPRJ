import Link from "next/link";

export const metadata = {
  title: "주문하기 · 새벽과일",
  description: "픽업·배송 주문 안내",
};

export default function OrderHubPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5 py-12 md:py-16">
      <h1 className="text-xl font-bold text-[#1a1f1c]">주문하기</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[#5c6b63]">
        원하시는 수령 방식을 선택해 주세요.
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        <li>
          <Link
            href="/pickup"
            className="flex items-center justify-between rounded-2xl border border-[#dfe8e2] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#166534]/40"
          >
            <span>
              <span className="block font-semibold text-[#14532d]">픽업</span>
              <span className="mt-1 block text-sm text-[#5c6b63]">
                매장·지정 장소에서 수령
              </span>
            </span>
            <span className="text-[#166534]" aria-hidden>
              →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/delivery"
            className="flex items-center justify-between rounded-2xl border border-[#dfe8e2] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#166534]/40"
          >
            <span>
              <span className="block font-semibold text-[#14532d]">배송</span>
              <span className="mt-1 block text-sm text-[#5c6b63]">
                새벽·택배 배송 안내
              </span>
            </span>
            <span className="text-[#166534]" aria-hidden>
              →
            </span>
          </Link>
        </li>
      </ul>
    </main>
  );
}
