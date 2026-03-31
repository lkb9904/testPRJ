import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";

type Props = {
  user: User | null;
  profileRole: ProfileRole | null;
};

export function HomeContent({ user, profileRole }: Props) {
  const loggedIn = Boolean(user);
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-[#166534]">
          Dawn Fresh
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#14532d] md:text-4xl">
          신선한 과일을 새벽에
        </h1>
        <div className="mx-auto mt-4 max-w-xl space-y-2 text-base leading-relaxed text-[#5c6b63] break-keep text-pretty">
          <p>
            새벽과일은 당도 좋은 제철 과일을 엄선해 전합니다.
          </p>
          <p>
            <span className="inline-block">픽업·배송 주문 메뉴에서</span>{" "}
            <span className="inline-block">이용 방법을 확인하세요.</span>
          </p>
        </div>
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
        ) : !canAdmin ? (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="max-w-md space-y-2 text-sm leading-relaxed text-[#5c6b63] break-keep text-pretty">
              <p>회원으로 로그인되어 있습니다.</p>
              <p>
                픽업·배송 주문은{" "}
                <span className="inline-block">각 메뉴에서</span>{" "}
                <span className="inline-block">이어서 진행할 수 있어요.</span>
              </p>
            </div>
            <Link
              href="/pickup"
              className="inline-flex rounded-xl border border-[#166534] bg-[#f0fdf4] px-6 py-3 text-sm font-semibold text-[#14532d] hover:bg-[#dcfce7]"
            >
              픽업 주문 보러가기
            </Link>
          </div>
        ) : null}
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

      <p className="mt-16 text-center text-xs leading-relaxed text-[#7a8a82] break-keep text-pretty">
        사업자·고객센터 안내는{" "}
        <span className="inline-block">고객센터 메뉴에서</span> 확인할 수 있어요.
      </p>
    </main>
  );
}
