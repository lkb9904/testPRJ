import Link from "next/link";

export const metadata = {
  title: "주문 완료 · 새벽과일",
};

type SearchParams = Promise<{ order?: string }>;

export default async function OrderCompletePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const orderNumber = params.order ?? "";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#166534]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-bold text-[#1a1f1c]">주문이 완료되었습니다</h1>

      {orderNumber ? (
        <p className="mt-3 text-sm text-[#5c6b63]">
          주문번호: <strong className="font-mono text-[#1a1f1c]">{orderNumber}</strong>
        </p>
      ) : null}

      <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#5c6b63]">
        주문이 접수되었습니다. 결제 및 배송(픽업) 안내는 별도로 연락드릴 예정입니다.
        감사합니다.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/mypage/orders"
          className="inline-flex rounded-full border border-[#1a1f1c] px-6 py-2.5 text-sm font-medium text-[#1a1f1c] hover:bg-[#fafdfb]"
        >
          주문 내역 보기
        </Link>
        <Link
          href="/"
          className="inline-flex rounded-full bg-[#166534] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]"
        >
          쇼핑 계속하기
        </Link>
      </div>
    </main>
  );
}
