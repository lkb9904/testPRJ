import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";
import { CartBadge } from "@/components/public/cart-badge";

const navLink =
  "rounded-md px-2.5 py-1.5 text-sm font-medium text-[#374151] transition hover:bg-[#e8f0eb]";

const iconWrap =
  "relative flex h-9 w-9 items-center justify-center rounded-md text-[#374151] transition hover:bg-[#e8f0eb]";

const compactControl =
  "inline-flex h-6 items-center justify-center rounded-md border border-[#d1ddd6] bg-white px-2 text-[10px] font-medium leading-none text-[#5c6b63] transition hover:bg-[#f4faf7] disabled:opacity-60";

const roleBadge =
  "inline-flex h-6 items-center rounded-md bg-[#e8f0eb] px-2 text-[10px] font-medium leading-none text-[#3d5248]";

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 18V6H2v12h12zm0 0h3.5l2.5 3H22v-5l-3-3H14" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

type Props = {
  user: User | null;
  profileRole: ProfileRole | null;
};

export function PublicHeader({ user, profileRole }: Props) {
  const loggedIn = Boolean(user);
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe8e2]/80 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-2">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-8">
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-[#14532d]">
            새벽과일
          </Link>
          <nav className="flex flex-wrap items-center gap-0.5 sm:gap-1" aria-label="메인 메뉴">
            <Link href="/products" className={navLink}>전체 상품</Link>
            <Link href="/group-buy" className={navLink}>공구</Link>
            <Link href="/order" className={navLink}>주문</Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          <Link href="/search" className={iconWrap} aria-label="검색" title="검색">
            <SearchIcon />
          </Link>
          <Link href="/mypage/orders" className={iconWrap} aria-label="배송 조회" title="배송 조회">
            <TruckIcon />
          </Link>
          <Link href="/cart" className={iconWrap} aria-label="장바구니" title="장바구니">
            <CartIcon />
            <CartBadge />
          </Link>
          <Link href="/support" className={iconWrap} aria-label="알림" title="알림">
            <BellIcon />
          </Link>
          {!loggedIn ? (
            <>
              <Link
                href="/login"
                className="ml-0.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#e8f0eb]"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-[#d1ddd6] bg-white px-2.5 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#f4faf7]"
              >
                회원가입
              </Link>
            </>
          ) : (
            <>
              <Link href="/mypage" className={iconWrap} aria-label="마이페이지" title="마이페이지">
                <UserIcon />
              </Link>
              <span className={roleBadge}>{canAdmin ? "관리자" : "회원"}</span>
              <SignOutButton className={compactControl} />
              {canAdmin ? (
                <Link
                  href="/dashboard"
                  className={`${compactControl} border-[#166534] text-[#166534] hover:bg-[#f0fdf4]`}
                >
                  관리자 사이트
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
