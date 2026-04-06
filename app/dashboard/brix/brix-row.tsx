"use client";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBrix, updateBrix } from "./actions";
import { formatBrix } from "@/lib/types/brix";

type Product = { id: string; name: string };

export type BrixRowData = {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  measured_brix: number;
  baseline_brix: number;
  photo_url: string | null;
  description: string | null;
  curator_name: string;
  measured_at: string;
  is_active: boolean;
};

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BrixRow({ row, products }: { row: BrixRowData; products: Product[] }) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await updateBrix(fd);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({ variant: "error", title: "저장 실패", description: r.error });
      return;
    }
    showToast({ variant: "success", title: "당도 측정을 저장했습니다" });
    router.refresh();
  }

  async function runDelete() {
    setPending(true);
    setMsg(null);
    const r = await deleteBrix(row.id);
    setPending(false);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({ variant: "error", title: "삭제 실패", description: r.error });
      return;
    }
    showToast({ variant: "success", title: "당도 측정이 삭제되었습니다" });
    setDelOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <ConfirmDialog
        open={delOpen}
        onClose={() => !pending && setDelOpen(false)}
        title="당도 측정 삭제"
        description={`「${row.product_name}」 ${formatBrix(row.measured_brix)}brix 기록을 삭제할까요?`}
        confirmLabel="삭제"
        pending={pending}
        onConfirm={() => void runDelete()}
      />

      <div className="mb-3 flex items-center gap-3">
        {row.product_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.product_image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-lg font-bold text-zinc-400 dark:bg-zinc-800">
            {row.product_name.slice(0, 1)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {row.product_name}
          </p>
          <p className="text-xs text-zinc-400">
            {formatBrix(row.measured_brix)}brix / 기준 {formatBrix(row.baseline_brix)}brix
            &middot; {row.curator_name}
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={row.id} />

        <div className="sm:col-span-2 flex flex-wrap items-start justify-between gap-2">
          <span className="text-xs text-zinc-400">
            측정:{" "}
            {new Date(row.measured_at).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => setDelOpen(true)}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            삭제
          </button>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>상품</label>
          <select name="product_id" defaultValue={row.product_id} className={inputCls}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>실측 당도</label>
          <input name="measured_brix" type="number" step="0.1" min="0" defaultValue={row.measured_brix} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>기준 당도</label>
          <input name="baseline_brix" type="number" step="0.1" min="0" defaultValue={row.baseline_brix} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>실측 사진 URL</label>
          <input name="photo_url" type="url" defaultValue={row.photo_url ?? ""} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>상세 설명</label>
          <textarea name="description" rows={3} defaultValue={row.description ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>큐레이터</label>
          <input name="curator_name" defaultValue={row.curator_name} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>측정 일시</label>
          <input name="measured_at" type="datetime-local" defaultValue={toLocalDatetime(row.measured_at)} className={inputCls} />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input name="is_active" type="checkbox" defaultChecked={row.is_active} className="rounded border-zinc-300" />
            공개
          </label>
        </div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            변경 저장
          </button>
          {msg ? <span className="text-xs text-red-600 dark:text-red-400">{msg}</span> : null}
        </div>
      </form>
    </div>
  );
}
