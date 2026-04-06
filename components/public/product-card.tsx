"use client";

import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/lib/types/product";
import { effectivePrice, formatKrw } from "@/lib/types/product";

type Props = {
  product: ProductCardType;
  onAddToCart?: (productId: string) => void;
};

export function ProductCard({ product: p, onAddToCart }: Props) {
  const price = effectivePrice(p);
  const hasDiscount = p.sale_price_krw != null && p.sale_price_krw < p.unit_price_krw;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-[#eef2ee] bg-white transition hover:shadow-md">
      <Link
        href={`/products/${p.id}`}
        className="relative block aspect-square overflow-hidden bg-[#f4f6f5]"
      >
        {p.badge ? (
          <span className="absolute left-2 top-2 z-10 rounded bg-[#dc2626] px-1.5 py-0.5 text-[11px] font-bold text-white">
            {p.badge}
          </span>
        ) : null}
        {p.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f0eb] to-[#d1ddd6] text-4xl font-bold text-[#166534]/30">
            {p.name.slice(0, 1)}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        {p.delivery_type && p.delivery_type !== "pickup" ? (
          <span className="mb-1 w-fit rounded-sm bg-[#166534]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#166534]">
            {p.delivery_type}
          </span>
        ) : null}

        <Link href={`/products/${p.id}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-[#1a1f1c]">
            {p.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2">
          {hasDiscount ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#dc2626]">
                  {p.discount_percent ?? Math.round((1 - p.sale_price_krw! / p.unit_price_krw) * 100)}%
                </span>
                <span className="text-xs text-[#9ca3a0] line-through">
                  {formatKrw(p.unit_price_krw)}
                </span>
              </div>
              <p className="text-[15px] font-bold text-[#1a1f1c]">{formatKrw(price)}</p>
            </>
          ) : (
            <p className="text-[15px] font-bold text-[#1a1f1c]">{formatKrw(price)}</p>
          )}
        </div>

        {p.review_count > 0 ? (
          <p className="mt-1 text-[11px] text-[#9ca3a0]">{p.review_count.toLocaleString()}+</p>
        ) : null}
      </div>

      {onAddToCart ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart(p.id);
          }}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#dfe8e2] bg-white text-[#374151] shadow-sm transition hover:bg-[#f4faf7]"
          aria-label={`${p.name} 장바구니 담기`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
