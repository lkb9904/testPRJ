import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "./alert-form";
import { AlertList } from "./alert-list";

export const metadata = {
  title: "재고 알림 · 새벽과일",
};

export default async function AlertsAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [alertsRes, productsRes, locationsRes] = await Promise.all([
    supabase
      .from("inventory_alerts")
      .select("id, product_label, message, severity, created_at, resolved_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("products").select("id, name").order("name", { ascending: true }),
    supabase
      .from("pickup_locations")
      .select("id, name")
      .order("sort_order", { ascending: true }),
  ]);

  if (alertsRes.error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          알림을 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          재고 알림
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          대시보드 카드 수치와 연동됩니다. 처리 완료 시 해결 시각이 기록됩니다.
        </p>
      </div>

      <section className="mb-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          새 알림
        </h2>
        <AlertForm
          products={productsRes.data ?? []}
          locations={locationsRes.data ?? []}
        />
      </section>

      <section>
        <AlertList rows={alertsRes.data ?? []} />
      </section>
    </div>
  );
}
