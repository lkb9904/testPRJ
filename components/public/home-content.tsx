import Link from "next/link";
import { isStaffOrAdmin, type ProfileRole } from "@/lib/auth/profile-role";
import type { ProductCard as ProductCardType } from "@/lib/types/product";
import type { BrixWithProduct } from "@/lib/types/brix";
import { ProductCard } from "@/components/public/product-card";
import { HomeHeroCarousel } from "@/components/public/home-hero-carousel";
import { HomeBrixSection } from "@/components/public/home-brix-section";
import { HomeScrollFab } from "@/components/public/home-scroll-fab";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_href: string;
  bg_color: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  profileRole: ProfileRole | null;
  banners: Banner[];
  products: ProductCardType[];
  categories: Category[];
  brixMeasurements: BrixWithProduct[];
};

export function HomeContent({ profileRole, banners, products, categories, brixMeasurements }: Props) {
  const canAdmin = profileRole != null && isStaffOrAdmin(profileRole);

  const bestProducts = products.slice(0, 8);
  const restProducts = products.slice(8, 16);

  return (
    <div className="relative bg-white">
      {/* Hero banners */}
      <HomeHeroCarousel banners={banners} />

      {/* Brix section */}
      <HomeBrixSection measurements={brixMeasurements} />

      {/* Best ranking */}
      <section className="border-t border-[#eef2ee] bg-white py-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold tracking-tight text-[#1a1f1c] sm:text-xl">
              실시간 과일 랭킹
            </h2>
            <Link href="/products" className="text-sm font-medium text-[#166534] hover:underline">
              전체보기
            </Link>
          </div>
          <p className="mt-1 text-sm text-[#9ca3a0]">지금 가장 인기있어요!</p>

          {bestProducts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#c5d4cc] bg-[#fafdfb] py-14 text-center text-sm text-[#5c6b63]">
              등록된 상품이 없습니다.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {bestProducts.map((p, idx) => (
                <div key={p.id} className="relative">
                  {idx < 3 ? (
                    <span className="absolute left-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a1f1c] text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                  ) : null}
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category section */}
      {categories.length > 0 ? (
        <section className="border-t border-[#eef2ee] bg-[#fafdfb] py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-lg font-bold tracking-tight text-[#1a1f1c] sm:text-xl">
              카테고리별 상품 추천
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  className="rounded-full border border-[#dfe8e2] bg-white px-5 py-2 text-sm font-medium text-[#374151] transition hover:border-[#166534] hover:text-[#14532d]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* More products */}
      {restProducts.length > 0 ? (
        <section className="border-t border-[#eef2ee] bg-white py-10">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-lg font-bold tracking-tight text-[#1a1f1c] sm:text-xl">
              새벽에 온 신선한 과일
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {restProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/products"
                className="inline-flex rounded-full border border-[#1a1f1c] px-6 py-2.5 text-sm font-medium text-[#1a1f1c] hover:bg-[#fafdfb]"
              >
                전체 상품 보기
              </Link>
            </div>
          </div>
        </section>
      ) : null}

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
