"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";

/** 헤더의 「메인페이지」 링크와 동일한 높이·패딩 */
const headerBtnClass =
  "inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700";

export default function LogoutButton() {
  return <SignOutButton className={headerBtnClass} />;
}
