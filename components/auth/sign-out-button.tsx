"use client";

import { useState } from "react";

type Props = {
  className?: string;
  /** 로그아웃 후 이동 경로 (기본 `/`) */
  redirectTo?: string;
};

/**
 * 서버 라우트 `/auth/sign-out`으로 이동해 httpOnly 세션 쿠키까지 정리합니다.
 * (클라이언트만 signOut 하면 로그인 상태가 남는 경우 방지)
 */
export function SignOutButton({
  className,
  redirectTo = "/",
}: Props) {
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    setLoading(true);
    const next = `/auth/sign-out?next=${encodeURIComponent(redirectTo)}`;
    window.location.assign(next);
  }

  return (
    <button
      type="button"
      onClick={() => handleLogout()}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }
    >
      {loading ? "로그아웃…" : "로그아웃"}
    </button>
  );
}
