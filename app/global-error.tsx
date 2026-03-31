"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#f2f7f4] p-6 text-center">
        <h1 className="text-xl font-semibold text-[#14532d]">
          시스템 오류
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#5c6b63]">
          페이지를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-[#166534] px-4 py-2 text-sm font-medium text-white"
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
