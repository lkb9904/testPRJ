import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "./product-form";
import { ProductRow } from "./product-row";

export const metadata = {
  title: "상품 · 새벽과일",
};

export default async function ProductsAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id, name, description, quantity, unit_label, unit_price_krw, sort_order, is_active, image_url, updated_at",
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          상품을 불러오지 못했습니다. `products` 마이그레이션 적용 여부를 확인하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          상품 관리
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          판매 단가·단위·노출 여부를 설정합니다. 픽업 장소별 수량은{' '}
          <Link href="/dashboard/stock" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            픽업 재고
          </Link>
          에서 입력합니다.
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          새 상품 등록
        </h2>
        <ProductForm />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          등록된 상품 ({rows?.length ?? 0})
        </h2>
        <div className="space-y-4">
          {(rows ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              등록된 상품이 없습니다. 위 양식으로 추가해 주세요.
            </p>
          ) : (
            (rows ?? []).map((row) => (
              <ProductRow key={row.id} row={row} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
