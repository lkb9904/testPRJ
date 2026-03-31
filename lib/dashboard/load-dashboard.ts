import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export type DashboardOrderRow = {
  order_number: string;
  product_name: string;
  status: string;
  amount_krw: number;
  created_at: string;
};

export type DashboardStats = {
  todayOrders: number;
  pendingOrders: number;
  weekRevenueKrw: number;
  inventoryAlertCount: number;
  yesterdayOrders: number;
};

function kstDateLabel(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function kstTodayLabel(): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function kstYesterdayLabel(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** 최근 7일(롤링) — 매출 집계 */
function withinLast7Days(iso: string): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return new Date(iso) >= cutoff;
}

export async function loadDashboardData(): Promise<{
  stats: DashboardStats;
  recentOrders: DashboardOrderRow[];
  error: string | null;
}> {
  const requestId = (await headers()).get("x-request-id") ?? undefined;
  const supabase = await createClient();

  const { data: ordersAll, error: ordersErr } = await supabase
    .from("v_dashboard_orders")
    .select("order_number, product_name, status, amount_krw, created_at");

  if (ordersErr) {
    logger.error("dashboard.v_dashboard_orders", ordersErr, { requestId });
    return {
      stats: {
        todayOrders: 0,
        pendingOrders: 0,
        weekRevenueKrw: 0,
        inventoryAlertCount: 0,
        yesterdayOrders: 0,
      },
      recentOrders: [],
      error:
        "데이터를 불러오지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해 주세요.",
    };
  }

  const orders = (ordersAll ?? []) as DashboardOrderRow[];
  const today = kstTodayLabel();
  const yesterday = kstYesterdayLabel();

  const todayOrders = orders.filter(
    (o) => kstDateLabel(o.created_at) === today,
  ).length;

  const yesterdayOrders = orders.filter(
    (o) => kstDateLabel(o.created_at) === yesterday,
  ).length;

  const pendingOrders = orders.filter((o) =>
    ["픽업대기", "결제완료"].includes(o.status),
  ).length;

  const weekRevenueKrw = orders
    .filter((o) => withinLast7Days(o.created_at))
    .reduce((sum, o) => sum + (o.amount_krw ?? 0), 0);

  const { count: inventoryAlertCount, error: invErr } = await supabase
    .from("inventory_alerts")
    .select("*", { count: "exact", head: true })
    .is("resolved_at", null);

  if (invErr) {
    logger.error("dashboard.inventory_alerts_count", invErr, { requestId });
  }

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 10);

  return {
    stats: {
      todayOrders,
      pendingOrders,
      weekRevenueKrw,
      inventoryAlertCount: invErr ? 0 : (inventoryAlertCount ?? 0),
      yesterdayOrders,
    },
    recentOrders,
    error: null,
  };
}

export function formatKrw(n: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(n)}원`;
}
