"use client";

import { useDashboardToast } from "@/components/dashboard/dashboard-toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { upsertPickupStock } from "./actions";

export type LocationOpt = { id: string; name: string; sort_order: number };
export type ProductOpt = {
  id: string;
  name: string;
  unit_label: string;
  unit_price_krw: number;
  sort_order: number;
};
export type StockRow = {
  pickup_location_id: string;
  product_id: string;
  quantity_available: number;
};

function formatKrw(n: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(n)}원`;
}

export function StockEditor({
  locations,
  products,
  stockRows,
  initialLocationId,
}: {
  locations: LocationOpt[];
  products: ProductOpt[];
  stockRows: StockRow[];
  initialLocationId: string | null;
}) {
  const router = useRouter();
  const { showToast } = useDashboardToast();
  const [locationId, setLocationId] = useState(
    initialLocationId ?? locations[0]?.id ?? "",
  );
  const [msg, setMsg] = useState<string | null>(null);

  const qtyByProduct = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stockRows) {
      if (s.pickup_location_id === locationId) {
        m.set(s.product_id, s.quantity_available);
      }
    }
    return m;
  }, [stockRows, locationId]);

  async function save(productId: string, quantity: number) {
    setMsg(null);
    const fd = new FormData();
    fd.set("pickup_location_id", locationId);
    fd.set("product_id", productId);
    fd.set("quantity_available", String(quantity));
    const r = await upsertPickupStock(fd);
    if (r && "error" in r && r.error) {
      setMsg(r.error);
      showToast({
        variant: "error",
        title: "저장 실패",
        description: r.error,
      });
      return;
    }
    showToast({ variant: "success", title: "픽업 재고를 저장했습니다" });
    router.refresh();
  }

  if (locations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        픽업 장소가 없습니다. 먼저{' '}
        <a href="/dashboard/pickup" className="font-medium text-emerald-700 underline dark:text-emerald-400">
          픽업 장소
        </a>
        를 등록해 주세요.
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        등록된 상품이 없습니다.{' '}
        <a href="/dashboard/products" className="font-medium text-emerald-700 underline dark:text-emerald-400">
          상품 관리
        </a>
        에서 추가해 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          픽업 장소
        </label>
        <select
          value={locationId}
          onChange={(e) => {
            setLocationId(e.target.value);
            setMsg(null);
          }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {msg ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {msg}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">단가</th>
              <th className="px-4 py-3 font-medium">픽업 가능 수량</th>
              <th className="px-4 py-3 font-medium text-right">저장</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <StockRowInput
                key={`${locationId}-${p.id}`}
                product={p}
                defaultQty={qtyByProduct.get(p.id) ?? 0}
                onSave={(q) => void save(p.id, q)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockRowInput({
  product,
  defaultQty,
  onSave,
}: {
  product: ProductOpt;
  defaultQty: number;
  onSave: (q: number) => void;
}) {
  const [value, setValue] = useState(String(defaultQty));
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setValue(String(defaultQty));
  }, [defaultQty]);

  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">{product.name}</p>
        <p className="text-xs text-zinc-500">
          {product.unit_label} · {formatKrw(product.unit_price_krw)}
        </p>
      </td>
      <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-300">
        {formatKrw(product.unit_price_krw)}
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            const q = Math.max(0, Math.floor(Number(value) || 0));
            await onSave(q);
            setPending(false);
          }}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        >
          저장
        </button>
      </td>
    </tr>
  );
}
