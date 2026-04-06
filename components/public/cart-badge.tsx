"use client";

import { useCart } from "@/lib/cart/cart-context";

export function CartBadge() {
  const { totalCount } = useCart();
  if (totalCount === 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold leading-none text-white">
      {totalCount > 99 ? "99+" : totalCount}
    </span>
  );
}
