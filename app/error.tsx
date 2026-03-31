"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "app/error",
        digest: error.digest,
        message: error.message,
      }),
    );
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-[#14532d]">
        일시적인 오류가 발생했습니다
      </h2>
      <p className="mt-2 max-w-md text-sm text-[#5c6b63]">
        요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-4 max-w-full overflow-auto rounded bg-zinc-100 p-3 text-left text-xs text-zinc-800">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-xl bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d]"
      >
        다시 시도
      </button>
    </div>
  );
}
