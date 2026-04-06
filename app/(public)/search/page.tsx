import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/public/product-card";
import type { ProductCard as ProductCardType } from "@/lib/types/product";
import { SearchInput } from "./search-input";

export const metadata = {
  title: "검색 · 새벽과일",
};

type SearchParams = Promise<{ q?: string }>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  let products: ProductCardType[] = [];
  if (q.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(
        "id, name, unit_price_krw, sale_price_krw, discount_percent, delivery_type, badge, image_url, review_count, unit_label",
      )
      .eq("is_active", true)
      .ilike("name", `%${q}%`)
      .order("sort_order", { ascending: true })
      .limit(40);
    products = (data ?? []) as ProductCardType[];
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <h1 className="text-xl font-bold text-[#1a1f1c]">검색</h1>

      <SearchInput defaultValue={q} />

      {q ? (
        <>
          <p className="mt-6 text-sm text-[#5c6b63]">
            <strong className="text-[#1a1f1c]">&quot;{q}&quot;</strong> 검색 결과{" "}
            <strong className="text-[#1a1f1c]">{products.length}</strong>개
          </p>
          {products.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-[#c5d4cc] bg-[#fafdfb] py-16 text-center text-sm text-[#5c6b63]">
              검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 text-center text-sm text-[#5c6b63]">
          상품명을 입력하여 검색하세요.
        </div>
      )}
    </main>
  );
}
