import Link from "next/link";

export const metadata = {
  title: "배송 주문 · 새벽과일",
  description: "새벽·택배 배송 주문 안내",
};

export default function DeliveryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <p className="text-sm font-medium text-[#166534]">배송 주문</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14532d] md:text-3xl">
        새벽·택배 배송
      </h1>
      <p className="mt-4 text-[#5c6b63] leading-relaxed">
        배송 가능 지역·배송비·도착 시간대는 준비 중입니다. 오픈 시 이 페이지에 안내를
        올릴 예정입니다. 비회원도 픽업 주문은 지금 이용하실 수 있어요.
      </p>
      <div className="mt-10 rounded-2xl border border-[#dfe8e2] bg-white/90 p-6 text-sm text-[#5c6b63]">
        배송 주문이 열리면 픽업과 같은 장바구니 흐름으로 연결할 수 있습니다.
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/pickup"
          className="inline-flex rounded-xl bg-[#166534] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]"
        >
          픽업으로 먼저 주문하기
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-xl border border-[#d1ddd6] px-5 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#fafdfb]"
        >
          쇼핑 홈
        </Link>
      </div>
    </main>
  );
}
