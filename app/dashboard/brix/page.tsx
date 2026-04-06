import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { BrixForm } from "./brix-form";
import { BrixRow, type BrixRowData } from "./brix-row";

export const metadata = { title: "당도 측정 · 새벽과일" };

export default async function BrixAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const [{ data: products }, { data: rows }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("brix_measurements")
      .select("id, product_id, measured_brix, baseline_brix, photo_url, description, curator_name, measured_at, is_active, products(name, image_url)")
      .order("measured_at", { ascending: false })
      .limit(50),
  ]);

  const brixRows: BrixRowData[] = (rows ?? []).map((r) => {
    const prod = r.products as unknown as { name: string; image_url: string | null } | null;
    return {
      id: r.id,
      product_id: r.product_id,
      product_name: prod?.name ?? "삭제된 상품",
      product_image_url: prod?.image_url ?? null,
      measured_brix: Number(r.measured_brix),
      baseline_brix: Number(r.baseline_brix),
      photo_url: r.photo_url,
      description: r.description,
      curator_name: r.curator_name,
      measured_at: r.measured_at,
      is_active: r.is_active,
    };
  });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">당도 측정 관리</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          과일별 당도(Brix) 실측 결과를 등록하고 관리합니다. 등록된 데이터는 홈 &quot;오늘의 당도&quot; 섹션과 당도 전체보기 페이지에 노출됩니다.
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">새 당도 측정 등록</h2>
        <BrixForm products={products ?? []} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          측정 기록 ({brixRows.length})
        </h2>
        <div className="space-y-4">
          {brixRows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              등록된 당도 측정이 없습니다. 위 양식으로 추가해 주세요.
            </p>
          ) : (
            brixRows.map((row) => (
              <BrixRow key={row.id} row={row} products={products ?? []} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
