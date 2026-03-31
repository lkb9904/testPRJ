import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";

const navLink =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-[#374151] transition hover:bg-[#e8f0eb]";

/** 회원 뱃지와 동일 높이·타이포 (text-[10px] · px-2 py-1 · leading-none) */
const compactControl =
  "inline-flex h-6 items-center justify-center rounded-md border border-[#d1ddd6] bg-white px-2 text-[10px] font-medium leading-none text-[#5c6b63] transition hover:bg-[#f4faf7] disabled:opacity-60";

const roleBadge =
  "inline-flex h-6 items-center rounded-md bg-[#e8f0eb] px-2 text-[10px] font-medium leading-none text-[#3d5248]";

type Props = {
  user: User | null;
  profileRole: ProfileRole | null;
};

export function PublicHeader({ user, profileRole }: Props) {
  const loggedIn = Boolean(user);
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  return (
    <header className="relative z-10 border-b border-[#dfe8e2]/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-8">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-[#14532d]"
          >
            새벽과일
          </Link>
          <nav className="flex flex-wrap items-center gap-0.5 sm:gap-1">
            <Link href="/" className={navLink}>
              홈
            </Link>
            <Link href="/pickup" className={navLink}>
              픽업 주문
            </Link>
            <Link href="/delivery" className={navLink}>
              배송 주문
            </Link>
            <Link href="/support" className={navLink}>
              고객센터
            </Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {!loggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#e8f0eb]"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-[#166534] px-2.5 py-1.5 text-sm font-medium text-[#166534] hover:bg-[#f0fdf4]"
              >
                회원가입
              </Link>
            </>
          ) : (
            <>
              {canAdmin ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#166534] px-2.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[#14532d]"
                >
                  관리자 사이트
                </Link>
              ) : null}
              <span className="hidden max-w-[9rem] truncate text-[10px] text-[#5c6b63] sm:inline">
                {user?.email}
              </span>
              <span className={roleBadge}>
                {canAdmin ? "관리자" : "회원"}
              </span>
              <SignOutButton className={compactControl} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
