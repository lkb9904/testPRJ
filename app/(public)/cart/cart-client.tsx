"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { formatKrw } from "@/lib/types/product";

type ProductInfo = {
  id: string;
  name: string;
  unit_price_krw: number;
  sale_price_krw: number | null;
  image_url: string | null;
  unit_label: string;
  weight_options: { label: string; price: number }[];
};

export function CartPageClient() {
  const { items, updateQuantity, removeItem, clearCart, totalCount } = useCart();
  const [products, setProducts] = useState<Map<string, ProductInfo>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts(new Map());
      setLoading(false);
      return;
    }
    const ids = [...new Set(items.map((i) => i.productId))];
    const supabase = createBrowserClient();
    supabase
      .from("products")
      .select("id, name, unit_price_krw, sale_price_krw, image_url, unit_label, weight_options")
      .in("id", ids)
      .then(({ data }) => {
        const map = new Map<string, ProductInfo>();
        for (const p of data ?? []) {
          map.set(p.id, { ...p, weight_options: (p.weight_options ?? []) as { label: string; price: number }[] });
        }
        setProducts(map);
        setLoading(false);
      });
  }, [items]);

  function getPrice(item: { productId: string; weightOption: string | null }): number {
    const p = products.get(item.productId);
    if (!p) return 0;
    if (item.weightOption) {
      const wo = p.weight_options.find((w) => w.label === item.weightOption);
      if (wo) return wo.price;
    }
    return p.sale_price_krw ?? p.unit_price_krw;
  }

  const totalPrice = items.reduce((sum, item) => sum + getPrice(item) * item.quantity, 0);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-xl font-bold text-[#1a1f1c]">장바구니</h1>
        <div className="mt-8 text-center text-sm text-[#9ca3a0]">불러오는 중...</div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-xl font-bold text-[#1a1f1c]">장바구니</h1>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5d4cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <p className="text-[#5c6b63]">장바구니가 비어있습니다</p>
          <Link
            href="/products"
            className="rounded-full bg-[#166534] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]"
          >
            쇼핑하러 가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1a1f1c]">
          장바구니 <span className="text-[#166534]">{totalCount}</span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#9ca3a0] hover:text-[#dc2626]"
        >
          전체 삭제
        </button>
      </div>

      <ul className="mt-6 divide-y divide-[#eef2ee]">
        {items.map((item) => {
          const p = products.get(item.productId);
          if (!p) return null;
          const price = getPrice(item);
          return (
            <li key={`${item.productId}::${item.weightOption}`} className="flex gap-4 py-4">
              <Link
                href={`/products/${item.productId}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f4f6f5]"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f0eb] to-[#d1ddd6] text-xl font-bold text-[#166534]/30">
                    {p.name.slice(0, 1)}
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={`/products/${item.productId}`} className="text-sm font-medium text-[#1a1f1c]">
                  {p.name}
                </Link>
                {item.weightOption ? (
                  <span className="mt-0.5 text-xs text-[#9ca3a0]">{item.weightOption}</span>
                ) : null}
                <p className="mt-1 text-sm font-bold text-[#1a1f1c]">{formatKrw(price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="inline-flex items-center rounded border border-[#dfe8e2]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.weightOption, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center text-sm hover:bg-[#fafdfb]"
                    >
                      −
                    </button>
                    <span className="flex h-7 w-8 items-center justify-center border-x border-[#dfe8e2] text-xs tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.weightOption, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center text-sm hover:bg-[#fafdfb]"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.weightOption)}
                    className="text-xs text-[#9ca3a0] hover:text-[#dc2626]"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold tabular-nums text-[#1a1f1c]">
                {formatKrw(price * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-xl border border-[#dfe8e2] bg-[#fafdfb] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5c6b63]">총 상품금액</span>
          <span className="text-xl font-bold text-[#1a1f1c]">{formatKrw(totalPrice)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#166534] py-3.5 text-sm font-semibold text-white hover:bg-[#14532d]"
        >
          주문하기
        </Link>
      </div>
    </main>
  );
}
