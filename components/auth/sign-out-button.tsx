"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = {
  className?: string;
  /** 로그아웃 후 이동 경로 (기본 `/`) */
  redirectTo?: string;
};

export function SignOutButton({
  className,
  redirectTo = "/",
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    /** RSC·쿠키 반영: 클라이언트 라우팅만으로는 로그인 상태가 남는 경우가 있어 전체 로드 */
    window.location.assign(redirectTo);
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
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
