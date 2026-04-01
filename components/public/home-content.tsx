import Link from "next/link";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";
import { HomeHeroCarousel } from "@/components/public/home-hero-carousel";
import { HomeScrollFab } from "@/components/public/home-scroll-fab";

export type ProductRow = {
  id: string;
  name: string;
  unit_label: string;
  unit_price_krw: number;
  image_url: string | null;
};

type Props = {
  profileRole: ProfileRole | null;
  products: ProductRow[];
  listedAtLabel: string;
};

function formatWonFigure(krw: number): string {
  return new Intl.NumberFormat("ko-KR").format(krw);
}

export function HomeContent({ profileRole, products, listedAtLabel }: Props) {
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  return (
    <div className="relative bg-white">
      <HomeHeroCarousel />

      <section id="today" className="scroll-mt-36 border-t border-[#eef2ee] bg-white pb-10 pt-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-[#1a1f1c] sm:text-xl">
              오늘의 당도
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-[#7a8a82] sm:text-xs">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0 opacity-70"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>{listedAtLabel}</span>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#c5d4cc] bg-[#fafdfb] py-14 text-center text-sm text-[#5c6b63]">
              등록된 상품이 없습니다.
            </div>
          ) : (
            <div className="mt-5 -mx-4 flex overflow-x-auto pb-2 pl-4 pr-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              <ul className="flex min-w-min gap-0">
                {products.map((p, idx) => (
                  <li
                    key={p.id}
                    className={`flex w-[42vw] max-w-[168px] shrink-0 flex-col sm:w-40 ${
                      idx > 0 ? "border-l border-[#e8ece9]" : ""
                    }`}
                  >
                    <Link
                      href="/pickup"
                      className="flex flex-col px-3 pb-2 pt-1 transition-opacity hover:opacity-90"
                    >
                      <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-xl bg-[#f4f6f5]">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f0eb] to-[#d1ddd6] text-3xl font-bold text-[#166534]/35">
                            {p.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <p className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-center text-[13px] font-medium leading-snug text-[#1a1f1c]">
                        {p.name}
                      </p>
                      <p className="mt-1 text-center text-2xl font-bold tabular-nums tracking-tight text-[#1a1f1c]">
                        {formatWonFigure(p.unit_price_krw)}
                      </p>
                      <p className="mt-0.5 text-center text-[11px] text-[#9ca3a0]">
                        기준 {p.unit_label}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/pickup"
              className="inline-flex rounded-full border border-[#1a1f1c] px-5 py-2 text-sm font-medium text-[#1a1f1c] hover:bg-[#fafdfb]"
            >
              전체 상품 보기
            </Link>
          </div>
        </div>
      </section>

      {canAdmin ? (
        <p className="pb-8 text-center text-xs text-[#9ca3a0]">
          <Link href="/dashboard" className="underline-offset-2 hover:underline">
            관리자
          </Link>
        </p>
      ) : null}

      <HomeScrollFab />
    </div>
  );
}
