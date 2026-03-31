"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createInventoryAlert } from "./actions";

export function AlertForm({
  products,
  locations,
}: {
  products: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const r = await createInventoryAlert(fd);
    if (r && "error" in r && r.error) {
      setError(r.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          표시 이름 *
        </label>
        <input
          name="product_label"
          required
          placeholder="예: 사과 박스"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          메시지
        </label>
        <textarea
          name="message"
          rows={2}
          placeholder="재고 확인·발주 필요 등"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          심각도
        </label>
        <select
          name="severity"
          defaultValue="warning"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>
      </div>
      <div className="flex items-end">
        <p className="text-xs text-zinc-500">
          선택: 상품·장소 연결
        </p>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          상품 (선택)
        </label>
        <select
          name="product_id"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          defaultValue=""
        >
          <option value="">—</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          픽업 장소 (선택)
        </label>
        <select
          name="pickup_location_id"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          defaultValue=""
        >
          <option value="">—</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          알림 등록
        </button>
        {error ? (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        ) : null}
      </div>
    </form>
  );
}
