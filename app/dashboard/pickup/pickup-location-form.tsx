"use client";

import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPickupLocation } from "./actions";

export function PickupLocationForm({ mode }: { mode: "create" }) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [error, setError] = useState<string | null>(null);

  if (mode !== "create") return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const r = await createPickupLocation(fd);
    if (r && "error" in r && r.error) {
      setError(r.error);
      showToast({
        variant: "error",
        title: "등록 실패",
        description: r.error,
      });
      return;
    }
    showToast({ variant: "success", title: "픽업 장소가 등록되었습니다" });
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          장소 이름 *
        </label>
        <input
          name="name"
          required
          placeholder="예: 본점"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          주소
        </label>
        <input
          name="address"
          placeholder="도로명 주소"
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
          placeholder="픽업 시간·층수 등"
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
          defaultValue={0}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex items-end gap-2 pb-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked
            className="rounded border-zinc-300"
          />
          사용 중
        </label>
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          등록
        </button>
        {error ? (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        ) : null}
      </div>
    </form>
  );
}
