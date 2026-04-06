"use client";

import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrix } from "./actions";

type Product = { id: string; name: string };

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const labelCls = "mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400";

export function BrixForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const r = await createBrix(fd);
    if (r && "error" in r && r.error) {
      setError(r.error);
      showToast({ variant: "error", title: "등록 실패", description: r.error });
      return;
    }
    showToast({ variant: "success", title: "당도 측정이 등록되었습니다" });
    form.reset();
    router.refresh();
  }

  const now = new Date();
  const localIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={labelCls}>상품 선택 *</label>
        <select name="product_id" required className={inputCls}>
          <option value="">-- 상품 선택 --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>실측 당도 (Brix) *</label>
        <input name="measured_brix" type="number" step="0.1" min="0" required placeholder="17.8" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>기준 당도 (Brix) *</label>
        <input name="baseline_brix" type="number" step="0.1" min="0" required placeholder="16.0" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>실측 사진 URL</label>
        <input name="photo_url" type="url" placeholder="https://" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>상세 설명</label>
        <textarea name="description" rows={3} placeholder="큐레이터 코멘트를 입력하세요" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>큐레이터 이름 *</label>
        <input name="curator_name" required defaultValue="관리자" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>측정 일시</label>
        <input name="measured_at" type="datetime-local" defaultValue={localIso} className={inputCls} />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input name="is_active" type="checkbox" defaultChecked className="rounded border-zinc-300" />
          공개
        </label>
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          당도 측정 등록
        </button>
        {error ? <span className="text-xs text-red-600 dark:text-red-400">{error}</span> : null}
      </div>
    </form>
  );
}
