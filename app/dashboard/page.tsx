import {
  formatKrw,
  loadDashboardData,
} from "@/lib/dashboard/load-dashboard";

export default async function DashboardPage() {
  const { stats, recentOrders, error } = await loadDashboardData();

  const diffHint =
    stats.yesterdayOrders > 0
      ? `전일 ${stats.yesterdayOrders}건`
      : "전일 데이터 없음";

  const statCards = [
    {
      label: "오늘 주문",
      value: String(stats.todayOrders),
      unit: "건",
      hint: diffHint,
    },
    {
      label: "처리 대기",
      value: String(stats.pendingOrders),
      unit: "건",
      hint: "픽업·결제완료",
    },
    {
      label: "최근 7일 매출",
      value: String(Math.round(stats.weekRevenueKrw / 10000)),
      unit: "만원",
      hint: `${formatKrw(stats.weekRevenueKrw)} 합계`,
    },
    {
      label: "재고 알림",
      value: String(stats.inventoryAlertCount),
      unit: "건",
      hint: "품목 확인",
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          대시보드
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          주문·매출·재고 알림 요약을 불러옵니다.
        </p>
        {error ? (
          <div
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            role="alert"
          >
            <p className="font-medium">DB를 불러오지 못했습니다</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              {error}
            </p>
            {process.env.NODE_ENV === "development" ? (
              <p className="mt-2 text-xs">
                개발 모드: DB 연결·마이그레이션 적용 여부를 확인하세요.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {s.label}
            </p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold tabular-nums">{s.value}</span>
              <span className="text-sm text-zinc-500">{s.unit}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">최근 주문</h2>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length === 0 && !error ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              주문이 없습니다. 마이그레이션 시드가 들어갔는지 확인하세요.
            </p>
          ) : (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                  <th className="px-4 py-3 font-medium">주문번호</th>
                  <th className="px-4 py-3 font-medium">상품</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium text-right">금액</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => (
                  <tr
                    key={row.order_number}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                      {row.order_number}
                    </td>
                    <td className="px-4 py-3">{row.product_name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                      {formatKrw(row.amount_krw)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
