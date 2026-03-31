import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { StockEditor } from "./stock-editor";

export const metadata = {
  title: "픽업 재고 · 새벽과일",
};

export default async function StockAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const [locRes, prodRes, stockRes] = await Promise.all([
    supabase
      .from("pickup_locations")
      .select("id, name, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, unit_label, unit_price_krw, sort_order")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("pickup_product_stock")
      .select("pickup_location_id, product_id, quantity_available"),
  ]);

  if (locRes.error || prodRes.error || stockRes.error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          데이터를 불러오지 못했습니다. `pickup_product_stock` 마이그레이션을 적용했는지 확인하세요.
        </p>
      </div>
    );
  }

  const locations = locRes.data ?? [];
  const products = prodRes.data ?? [];
  const stockRows = stockRes.data ?? [];
  const initialLocationId = locations[0]?.id ?? null;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            픽업 장소별 재고
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            장소를 선택한 뒤 상품별 픽업 가능 수량을 입력합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/dashboard/pickup"
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            픽업 장소
          </Link>
          <Link
            href="/dashboard/products"
            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            상품
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <StockEditor
          locations={locations}
          products={products}
          stockRows={stockRows}
          initialLocationId={initialLocationId}
        />
      </section>
    </div>
  );
}
