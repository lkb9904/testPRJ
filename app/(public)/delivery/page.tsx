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
        배송 가능 지역·배송비·도착 시간대는 준비 중입니다. 오픈 시 이 페이지에
        안내를 올릴 예정입니다.
      </p>
      <div className="mt-10 rounded-2xl border border-[#dfe8e2] bg-white/90 p-6 text-sm text-[#5c6b63]">
        지금은 픽업 주문 플로우를 먼저 구성하실 수 있습니다. 배송은 추후 같은
        장바구니에 옵션으로 붙이기 좋습니다.
      </div>
      <p className="mt-8">
        <Link href="/pickup" className="text-sm font-medium text-[#166534] hover:underline">
          픽업 주문 안내 보기 →
        </Link>
      </p>
    </main>
  );
}
