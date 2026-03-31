import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { PickupLocationForm } from "./pickup-location-form";
import { PickupLocationRow } from "./pickup-location-row";

export const metadata = {
  title: "픽업 장소 · 새벽과일",
};

export default async function PickupAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("pickup_locations")
    .select("id, name, address, detail_note, sort_order, is_active, updated_at")
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          픽업 장소를 불러오지 못했습니다. (권한·마이그레이션 확인)
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            픽업 장소 관리
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            고객 픽업·주문에 쓰이는 수령 장소를 등록·수정합니다.
          </p>
        </div>
        <Link
          href="/pickup"
          className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          고객 화면(픽업 주문) 보기 →
        </Link>
      </div>

      <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          새 장소 등록
        </h2>
        <PickupLocationForm mode="create" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          등록된 장소 ({rows?.length ?? 0})
        </h2>
        <div className="space-y-4">
          {(rows ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              등록된 픽업 장소가 없습니다. 위 양식으로 추가해 주세요.
            </p>
          ) : (
            (rows ?? []).map((row) => (
              <PickupLocationRow key={row.id} row={row} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
