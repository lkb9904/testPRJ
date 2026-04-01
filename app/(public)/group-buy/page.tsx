import Link from "next/link";

export const metadata = {
  title: "공구 · 새벽과일",
  description: "공동 구매 안내",
};

export default function GroupBuyPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-5 py-12 md:py-16">
      <h1 className="text-xl font-bold text-[#1a1f1c]">공구</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[#5c6b63]">
        공동 구매 상품은 준비 중입니다. 오픈 시 이 페이지에 안내드릴 예정이에요.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex rounded-full border border-[#1a1f1c] px-5 py-2.5 text-sm font-medium text-[#1a1f1c] hover:bg-[#fafdfb]"
        >
          홈으로
        </Link>
        <Link
          href="/pickup"
          className="inline-flex rounded-full bg-[#166534] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]"
        >
          픽업 주문
        </Link>
      </div>
    </main>
  );
}
