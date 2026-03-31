"use client";

import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct, updateProduct } from "./actions";

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  quantity: number | null;
  unit_label: string;
  unit_price_krw: number;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
  updated_at: string;
};

function formatKrw(n: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(n)}원`;
}

export function ProductRow({ row }: { row: ProductRow }) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await updateProduct(fd);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({
        variant: "error",
        title: "저장 실패",
        description: r.error,
      });
      return;
    }
    showToast({ variant: "success", title: "상품 정보를 저장했습니다" });
    router.refresh();
  }

  async function runDelete() {
    setPending(true);
    setMsg(null);
    const r = await deleteProduct(row.id);
    setPending(false);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({
        variant: "error",
        title: "삭제 실패",
        description: r.error,
      });
      return;
    }
    showToast({ variant: "success", title: "상품이 삭제되었습니다" });
    setDelOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <ConfirmDialog
        open={delOpen}
        onClose={() => !pending && setDelOpen(false)}
        title="상품 삭제"
        description={`「${row.name}」을(를) 삭제할까요? 연결된 픽업 재고도 함께 삭제됩니다.`}
        confirmLabel="삭제"
        pending={pending}
        onConfirm={() => void runDelete()}
      />
      <form onSubmit={(e) => void onSubmit(e)} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={row.id} />
        <div className="sm:col-span-2 flex flex-wrap items-start justify-between gap-2">
          <span className="text-xs text-zinc-400">
            수정:{" "}
            {new Date(row.updated_at).toLocaleString("ko-KR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
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
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            상품명 *
          </label>
          <input
            name="name"
            required
            defaultValue={row.name}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            설명
          </label>
          <textarea
            name="description"
            rows={2}
            defaultValue={row.description ?? ""}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            수량
          </label>
          <input
            name="quantity"
            type="number"
            min={0}
            defaultValue={row.quantity ?? ""}
            placeholder="선택"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            단위
          </label>
          <input
            name="unit_label"
            defaultValue={row.unit_label}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            단가(원)
          </label>
          <input
            name="unit_price_krw"
            type="number"
            min={0}
            defaultValue={row.unit_price_krw}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <p className="mt-0.5 text-xs text-zinc-400">{formatKrw(row.unit_price_krw)}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            정렬 순서
          </label>
          <input
            name="sort_order"
            type="number"
            defaultValue={row.sort_order}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            이미지 URL
          </label>
          <input
            name="image_url"
            type="url"
            defaultValue={row.image_url ?? ""}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="sm:col-span-2 flex items-end gap-2 pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={row.is_active}
              className="rounded border-zinc-300"
            />
            판매 중
          </label>
        </div>
        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            변경 저장
          </button>
          {msg ? (
            <span className="text-xs text-red-600 dark:text-red-400">{msg}</span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
