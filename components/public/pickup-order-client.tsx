"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { placePickupOrder } from "@/lib/pickup/place-order";

type Loc = { id: string; name: string; address: string | null };
type Prod = {
  id: string;
  name: string;
  unit_label: string;
  unit_price_krw: number;
};

function formatKrw(n: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(n)}원`;
}

export function PickupOrderClient({
  locations,
  products,
  stockMap,
  user,
}: {
  locations: Loc[];
  products: Prod[];
  stockMap: Record<string, number>;
  user: User | null;
}) {
  const router = useRouter();
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  const available = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      const key = `${locationId}:${p.id}`;
      m.set(p.id, stockMap[key] ?? 0);
    }
    return m;
  }, [locationId, products, stockMap]);

  const cartLines = useMemo(() => {
    const lines: { product: Prod; q: number; line: number }[] = [];
    let total = 0;
    for (const p of products) {
      const q = Math.floor(qty[p.id] ?? 0);
      if (q <= 0) continue;
      const line = q * p.unit_price_krw;
      total += line;
      lines.push({ product: p, q, line });
    }
    return { lines, total };
  }, [products, qty]);

  async function submit() {
    setMsg(null);
    setSuccessOrder(null);
    if (!user) {
      setMsg("로그인이 필요합니다.");
      return;
    }
    if (!locationId) {
      setMsg("픽업 장소를 선택해 주세요.");
      return;
    }
    const items = cartLines.lines.map((row) => ({
      productId: row.product.id,
      quantity: row.q,
    }));
    if (items.length === 0) {
      setMsg("담을 상품 수량을 입력해 주세요.");
      return;
    }
    for (const row of cartLines.lines) {
      const max = available.get(row.product.id) ?? 0;
      if (row.q > max) {
        setMsg(`「${row.product.name}」은(는) 최대 ${max}${row.product.unit_label}까지 주문할 수 있습니다.`);
        return;
      }
    }

    setPending(true);
    const r = await placePickupOrder({ pickupLocationId: locationId, items });
    setPending(false);

    if ("error" in r && r.error) {
      setMsg(r.error);
      return;
    }
    if ("ok" in r && r.ok) {
      setSuccessOrder(r.orderNumber);
      setQty({});
      router.refresh();
      return;
    }
    setMsg("주문 처리에 실패했습니다.");
  }

  if (locations.length === 0 || products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-[#14532d]">픽업 장소 선택 · 수량 담기</h2>
      <p className="mt-2 text-sm text-[#5c6b63]">
        장소를 고른 뒤 상품별 수량을 입력하고 주문하기를 누르면 주문이 접수됩니다.
      </p>

      {!user ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          픽업 주문은 <strong>로그인 후</strong> 이용할 수 있습니다.{" "}
          <Link href="/login" className="font-medium text-[#166534] underline">
            로그인
          </Link>
          {" · "}
          <Link href="/signup" className="font-medium text-[#166534] underline">
            회원가입
          </Link>
        </div>
      ) : null}

      <div className="mt-4 space-y-4 rounded-xl border border-[#dfe8e2] bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#374151]">
            픽업 장소
          </label>
          <select
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value);
              setQty({});
              setMsg(null);
            }}
            className="w-full max-w-md rounded-lg border border-[#d1ddd6] bg-white px-3 py-2 text-sm text-[#374151]"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eef4f0] text-xs text-[#7a8a82]">
                <th className="py-2 pr-2 font-medium">상품</th>
                <th className="py-2 pr-2 font-medium">단가</th>
                <th className="py-2 pr-2 font-medium">픽업 가능</th>
                <th className="py-2 font-medium">담기</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const max = available.get(p.id) ?? 0;
                const v = qty[p.id] ?? 0;
                return (
                  <tr key={p.id} className="border-b border-[#f4faf7] last:border-0">
                    <td className="py-2 pr-2 font-medium text-[#374151]">{p.name}</td>
                    <td className="py-2 pr-2 tabular-nums text-[#5c6b63]">
                      {formatKrw(p.unit_price_krw)}
                    </td>
                    <td className="py-2 pr-2 tabular-nums text-[#166534]">
                      {max}
                      {p.unit_label}
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        max={max}
                        disabled={max <= 0 || !user}
                        value={v || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const n = Math.floor(Number(e.target.value));
                          const next = Number.isFinite(n)
                            ? Math.min(Math.max(0, n), max)
                            : 0;
                          setQty((prev) => ({ ...prev, [p.id]: next }));
                        }}
                        className="w-20 rounded-lg border border-[#d1ddd6] px-2 py-1 text-sm tabular-nums disabled:opacity-50"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#eef4f0] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#374151]">
            합계{" "}
            <span className="font-semibold tabular-nums text-[#14532d]">
              {formatKrw(cartLines.total)}
            </span>
          </p>
          <button
            type="button"
            disabled={pending || !user || cartLines.lines.length === 0}
            onClick={() => void submit()}
            className="inline-flex items-center justify-center rounded-lg bg-[#166534] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
          >
            {pending ? "주문 처리 중…" : "주문하기"}
          </button>
        </div>

        {msg ? (
          <p className="text-sm text-red-700" role="alert">
            {msg}
          </p>
        ) : null}
        {successOrder ? (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950"
            role="status"
          >
            주문이 접수되었습니다. 주문번호{" "}
            <strong className="font-mono">{successOrder}</strong>
          </div>
        ) : null}
      </div>
    </section>
  );
}
