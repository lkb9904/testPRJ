import Link from "next/link";

export const metadata = {
  title: "고객센터 · 새벽과일",
  description: "문의·이용 안내",
};

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <p className="text-sm font-medium text-[#166534]">고객센터</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#14532d] md:text-3xl">
        문의·이용 안내
      </h1>
      <p className="mt-4 text-[#5c6b63] leading-relaxed">
        운영 시간·전화·카카오 채널 등은 정해지는 대로 이곳에 표기하면 됩니다.
      </p>
      <ul className="mt-10 space-y-3 text-sm text-[#374151]">
        <li className="rounded-xl border border-[#dfe8e2] bg-white/90 px-4 py-3">
          <span className="font-medium text-[#14532d]">운영 시간</span>
          <span className="ml-2 text-[#5c6b63]">준비 중</span>
        </li>
        <li className="rounded-xl border border-[#dfe8e2] bg-white/90 px-4 py-3">
          <span className="font-medium text-[#14532d]">전화</span>
          <span className="ml-2 text-[#5c6b63]">추후 등록</span>
        </li>
        <li className="rounded-xl border border-[#dfe8e2] bg-white/90 px-4 py-3">
          <span className="font-medium text-[#14532d]">자주 묻는 질문</span>
          <span className="ml-2 text-[#5c6b63]">추가 예정</span>
        </li>
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/" className="font-medium text-[#166534] hover:underline">
          ← 홈으로
        </Link>
      </p>
    </main>
  );
}
