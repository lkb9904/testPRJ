import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";

type Props = {
  user: User | null;
  /** 비로그인 시 null */
  profileRole: ProfileRole | null;
};

/** 일반 방문자용 첫 화면 — 로그인 없이 열람 가능. 관리 권한 시에만 관리자 진입 노출 */
export function PublicLanding({ user, profileRole }: Props) {
  const loggedIn = Boolean(user);
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f2f7f4] text-[#1a1f1c]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(22, 101, 52, 0.12), transparent 55%)",
        }}
      />
      <header className="relative z-10 border-b border-[#dfe8e2]/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#14532d]"
          >
            새벽과일
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-sm md:gap-3">
            {!loggedIn ? (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 font-medium text-[#374151] hover:bg-[#e8f0eb]"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg border border-[#166534] px-3 py-2 font-medium text-[#166534] hover:bg-[#f0fdf4]"
                >
                  회원가입
                </Link>
              </>
            ) : (
              <>
                {canAdmin ? (
                  <Link
                    href="/dashboard"
                    className="rounded-lg bg-[#166534] px-3 py-2 font-medium text-white shadow-sm hover:bg-[#14532d]"
                  >
                    관리자 사이트
                  </Link>
                ) : null}
                <span className="hidden max-w-[11rem] truncate text-xs text-[#5c6b63] sm:inline">
                  {user?.email}
                </span>
                <span className="rounded-md bg-[#e8f0eb] px-2 py-1 text-[10px] font-medium text-[#3d5248]">
                  {canAdmin ? "관리자" : "회원"}
                </span>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <section className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[#166534]">
            Dawn Fresh
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#14532d] md:text-4xl">
            신선한 과일을 새벽에
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#5c6b63]">
            새벽과일은 당도 좋은 제철 과일을 엄선해 전합니다. 온라인 주문·매장
            안내는 순차적으로 열릴 예정입니다.
          </p>
          {!loggedIn ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#14532d]"
              >
                무료 회원가입
              </Link>
              <Link
                href="/login"
                className="inline-flex rounded-xl border border-[#d1ddd6] bg-white px-6 py-3 text-sm font-medium text-[#374151] hover:bg-[#fafdfb]"
              >
                이미 계정이 있어요
              </Link>
            </div>
          ) : canAdmin ? (
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#14532d]"
              >
                관리자 사이트 바로가기
              </Link>
              <p className="text-xs text-[#5c6b63]">
                주문·재고·알림은 관리 화면에서 확인할 수 있어요.
              </p>
            </div>
          ) : (
            <p className="mt-10 text-sm text-[#5c6b63]">
              회원으로 로그인되어 있습니다. 쇼핑·주문 기능은 오픈 시 안내드릴
              예정이에요.
            </p>
          )}
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "새벽 배송",
              desc: "주문 마감 후 새벽 도착을 목표로 준비 중입니다.",
            },
            {
              title: "당도 케어",
              desc: "시즌별로 맛있는 품목을 골라 소개할 예정입니다.",
            },
            {
              title: "매장·픽업",
              desc: "픽업 장소와 공동구매 일정은 공지로 안내합니다.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#dfe8e2] bg-white/90 p-6 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-[#14532d]">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5c6b63]">
                {item.desc}
              </p>
            </div>
          ))}
        </section>

        <p className="mt-16 text-center text-xs text-[#7a8a82]">
          사업자·고객센터 안내는 추후 페이지에 정리할 예정입니다.
        </p>
      </main>

      <footer className="relative z-10 border-t border-[#dfe8e2]/80 bg-white/60 py-4 text-center text-xs text-[#7a8a82]">
        © {new Date().getFullYear()} 새벽과일 · 신선한 과일을 새벽에
      </footer>
    </div>
  );
}
