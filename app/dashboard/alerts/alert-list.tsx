"use client";

import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resolveInventoryAlert } from "./actions";

export type AlertRow = {
  id: string;
  product_label: string;
  message: string | null;
  severity: string;
  created_at: string;
  resolved_at: string | null;
};

const severityClass: Record<string, string> = {
  info: "bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
  warning:
    "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  critical: "bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100",
};

export function AlertList({ rows }: { rows: AlertRow[] }) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [msg, setMsg] = useState<string | null>(null);

  async function resolve(id: string) {
    setMsg(null);
    const r = await resolveInventoryAlert(id);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({
        variant: "error",
        title: "처리 실패",
        description: r.error,
      });
      return;
    }
    showToast({ variant: "success", title: "처리 완료로 표시했습니다" });
    router.refresh();
  }

  const open = rows.filter((r) => !r.resolved_at);
  const done = rows.filter((r) => r.resolved_at);

  return (
    <div className="space-y-8">
      {msg ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {msg}
        </p>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          미처리 ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
            미처리 알림이 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityClass[row.severity] ?? severityClass.warning}`}
                    >
                      {row.severity}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {row.product_label}
                    </span>
                  </div>
                  {row.message ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {row.message}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(row.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void resolve(row.id)}
                  className="shrink-0 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  처리 완료
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          처리 완료 ({done.length})
        </h2>
        {done.length === 0 ? (
          <p className="text-sm text-zinc-500">이력이 없습니다.</p>
        ) : (
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            {done.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap justify-between gap-2 border-b border-zinc-100 py-2 last:border-0 dark:border-zinc-800"
              >
                <span>
                  {row.product_label}
                  {row.message ? ` — ${row.message}` : ""}
                </span>
                <span className="text-xs text-zinc-400">
                  처리:{" "}
                  {row.resolved_at
                    ? new Date(row.resolved_at).toLocaleString("ko-KR")
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
