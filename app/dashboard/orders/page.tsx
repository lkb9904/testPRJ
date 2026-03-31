import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { formatKrw } from "@/lib/dashboard/load-dashboard";

export const metadata = {
  title: "주문 목록 · 새벽과일",
};

export default async function OrdersAdminPage() {
  const session = await getSessionRole();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("orders")
    .select(
      "order_number, status, total_amount, created_at, order_type, customers(display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">
          주문을 불러오지 못했습니다. ({error.message})
        </p>
      </div>
    );
  }

  type CustomerEmbed = { display_name: string | null } | null;

  function customerName(
    c: CustomerEmbed | { display_name: string | null }[] | null | undefined,
  ): string {
    if (!c) return "—";
    if (Array.isArray(c)) return c[0]?.display_name ?? "—";
    return c.display_name ?? "—";
  }

  const list = rows ?? [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          주문 목록
        </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            최근 200건까지 표시합니다.
          </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">주문번호</th>
              <th className="px-4 py-3 font-medium">고객</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium text-right">금액</th>
              <th className="px-4 py-3 font-medium">일시</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  주문이 없습니다.
                </td>
              </tr>
            ) : (
              list.map((row) => (
                <tr
                  key={row.order_number}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    {row.order_number}
                  </td>
                  <td className="px-4 py-3">
                    {customerName(
                      row.customers as
                        | CustomerEmbed
                        | { display_name: string | null }[]
                        | null
                        | undefined,
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {row.order_type}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                    {formatKrw(row.total_amount ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(row.created_at).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
