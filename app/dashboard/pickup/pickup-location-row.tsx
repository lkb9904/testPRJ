"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePickupLocation, updatePickupLocation } from "./actions";

export type PickupRow = {
  id: string;
  name: string;
  address: string | null;
  detail_note: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export function PickupLocationRow({ row }: { row: PickupRow }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const r = await updatePickupLocation(fd);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      return;
    }
    router.refresh();
  }

  async function onDelete() {
    if (!confirm(`「${row.name}」을(를) 삭제할까요?`)) return;
    setPending(true);
    setMsg(null);
    const r = await deletePickupLocation(row.id);
    setPending(false);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
            onClick={() => void onDelete()}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            삭제
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            장소 이름 *
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
            주소
          </label>
          <input
            name="address"
            defaultValue={row.address ?? ""}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            안내 메모
          </label>
          <textarea
            name="detail_note"
            rows={2}
            defaultValue={row.detail_note ?? ""}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
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
        <div className="flex items-end gap-2 pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={row.is_active}
              className="rounded border-zinc-300"
            />
            사용 중
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
