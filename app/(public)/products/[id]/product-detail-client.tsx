"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product, ProductCard as ProductCardType, WeightOption } from "@/lib/types/product";
import { formatKrw, effectivePrice } from "@/lib/types/product";
import { ProductCard } from "@/components/public/product-card";
import { useCart } from "@/lib/cart/cart-context";

export function ProductDetailClient({
  product: p,
  related,
}: {
  product: Product;
  related: ProductCardType[];
}) {
  const { addItem } = useCart();
  const hasWeightOptions = Array.isArray(p.weight_options) && p.weight_options.length > 0;
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(
    hasWeightOptions ? p.weight_options[0] : null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const currentPrice = selectedWeight ? selectedWeight.price : effectivePrice(p);
  const originalPrice = selectedWeight ? selectedWeight.price : p.unit_price_krw;
  const hasDiscount = !selectedWeight && p.sale_price_krw != null && p.sale_price_krw < p.unit_price_krw;
  const totalPrice = currentPrice * quantity;

  function handleAddToCart() {
    addItem(p.id, quantity, selectedWeight?.label ?? null);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#9ca3a0]">
        <Link href="/" className="hover:text-[#374151]">홈</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#374151]">전체 상품</Link>
        <span>/</span>
        <span className="text-[#374151]">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f4f6f5]">
          {p.badge ? (
            <span className="absolute left-3 top-3 z-10 rounded bg-[#dc2626] px-2 py-1 text-xs font-bold text-white">
              {p.badge}
            </span>
          ) : null}
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f0eb] to-[#d1ddd6] text-7xl font-bold text-[#166534]/25">
              {p.name.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {p.delivery_type && p.delivery_type !== "pickup" ? (
            <span className="mb-2 w-fit rounded bg-[#166534]/10 px-2 py-0.5 text-xs font-medium text-[#166534]">
              {p.delivery_type}
            </span>
          ) : null}

          <h1 className="text-xl font-bold text-[#1a1f1c] md:text-2xl">{p.name}</h1>

          {p.review_count > 0 ? (
            <p className="mt-1 text-sm text-[#9ca3a0]">
              리뷰 {p.review_count.toLocaleString()}개
            </p>
          ) : null}

          {/* Price */}
          <div className="mt-4">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#dc2626]">
                  {p.discount_percent ?? Math.round((1 - p.sale_price_krw! / p.unit_price_krw) * 100)}%
                </span>
                <span className="text-base text-[#9ca3a0] line-through">{formatKrw(originalPrice)}</span>
              </div>
            ) : null}
            <p className="text-2xl font-bold text-[#1a1f1c]">{formatKrw(currentPrice)}</p>
          </div>

          {/* Weight options */}
          {hasWeightOptions ? (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-[#374151]">중량 선택</p>
              <div className="flex flex-wrap gap-2">
                {p.weight_options.map((w) => (
                  <button
                    key={w.label}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedWeight?.label === w.label
                        ? "border-[#166534] bg-[#f0fdf4] text-[#14532d]"
                        : "border-[#dfe8e2] text-[#374151] hover:border-[#166534]/40"
                    }`}
                  >
                    {w.label}
                    <span className="ml-1.5 text-xs text-[#5c6b63]">{formatKrw(w.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quantity */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-[#374151]">수량</p>
            <div className="inline-flex items-center rounded-lg border border-[#dfe8e2]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center text-lg text-[#374151] hover:bg-[#fafdfb]"
              >
                −
              </button>
              <span className="flex h-10 w-12 items-center justify-center border-x border-[#dfe8e2] text-sm font-medium tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center text-lg text-[#374151] hover:bg-[#fafdfb]"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-sm text-[#5c6b63]">총 상품금액</span>
            <span className="text-xl font-bold text-[#1a1f1c]">{formatKrw(totalPrice)}</span>
          </div>

          {/* Info */}
          {p.origin ? (
            <p className="mt-4 text-sm text-[#5c6b63]">
              원산지: <span className="text-[#374151]">{p.origin}</span>
            </p>
          ) : null}

          {p.description ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#5c6b63]">
              {p.description}
            </p>
          ) : null}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 rounded-xl border border-[#1a1f1c] py-3 text-sm font-semibold text-[#1a1f1c] transition hover:bg-[#fafdfb]"
            >
              {added ? "담았습니다!" : "장바구니 담기"}
            </button>
            <Link
              href={`/checkout?product=${p.id}&qty=${quantity}${selectedWeight ? `&weight=${encodeURIComponent(selectedWeight.label)}` : ""}`}
              className="flex flex-1 items-center justify-center rounded-xl bg-[#166534] py-3 text-sm font-semibold text-white transition hover:bg-[#14532d]"
            >
              바로 주문
            </Link>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-lg font-bold text-[#1a1f1c]">함께 보면 좋은 상품</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
