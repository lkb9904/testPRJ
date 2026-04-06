import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import type { ProductCard as ProductCardType } from "@/lib/types/product";

export const metadata = {
  title: "전체 상품 · 새벽과일",
  description: "새벽과일 전체 상품 목록",
};

const PRODUCT_FIELDS =
  "id, name, unit_price_krw, sale_price_krw, discount_percent, delivery_type, badge, image_url, review_count, unit_label, category_id, sort_order";

type SearchParams = Promise<{ category?: string; sort?: string }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort ?? "popular";

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });

  let categoryId: string | null = null;
  if (categorySlug) {
    const cat = (categories ?? []).find((c) => c.slug === categorySlug);
    if (cat) categoryId = cat.id;
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (sort === "price_asc") {
    query = query.order("unit_price_krw", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("unit_price_krw", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query.order("sort_order", { ascending: true }).order("review_count", { ascending: false });
  }

  const { data: products } = await query.limit(60);

  const cats = categories ?? [];
  const items: ProductCardType[] = (products ?? []) as ProductCardType[];

  const sortOptions = [
    { value: "popular", label: "인기순" },
    { value: "price_asc", label: "낮은가격순" },
    { value: "price_desc", label: "높은가격순" },
    { value: "newest", label: "최신순" },
  ];

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const cat = overrides.category ?? categorySlug;
    const s = overrides.sort ?? sort;
    if (cat) p.set("category", cat);
    if (s && s !== "popular") p.set("sort", s);
    const qs = p.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-xl font-bold text-[#1a1f1c] md:text-2xl">전체 상품</h1>

      {/* Category tabs */}
      <nav className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link
          href={buildHref({ category: undefined })}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !categorySlug
              ? "border-[#1a1f1c] bg-[#1a1f1c] text-white"
              : "border-[#dfe8e2] bg-white text-[#374151] hover:bg-[#fafdfb]"
          }`}
        >
          전체
        </Link>
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={buildHref({ category: c.slug })}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              categorySlug === c.slug
                ? "border-[#1a1f1c] bg-[#1a1f1c] text-white"
                : "border-[#dfe8e2] bg-white text-[#374151] hover:bg-[#fafdfb]"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {/* Sort */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-[#5c6b63]">
          총 <strong className="font-semibold text-[#1a1f1c]">{items.length}</strong>개
        </p>
        <div className="flex gap-1">
          {sortOptions.map((o) => (
            <Link
              key={o.value}
              href={buildHref({ sort: o.value })}
              className={`rounded px-2 py-1 text-xs font-medium transition ${
                sort === o.value
                  ? "bg-[#1a1f1c] text-white"
                  : "text-[#5c6b63] hover:text-[#1a1f1c]"
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Product grid */}
      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-[#c5d4cc] bg-[#fafdfb] py-16 text-center text-sm text-[#5c6b63]">
          해당 카테고리에 상품이 없습니다.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
