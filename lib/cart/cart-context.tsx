"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  quantity: number;
  weightOption: string | null;
};

type CartContextValue = {
  items: CartItem[];
  totalCount: number;
  addItem: (productId: string, quantity: number, weightOption: string | null) => void;
  updateQuantity: (productId: string, weightOption: string | null, quantity: number) => void;
  removeItem: (productId: string, weightOption: string | null) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "sb_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded
  }
}

function itemKey(productId: string, weightOption: string | null): string {
  return `${productId}::${weightOption ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  const addItem = useCallback((productId: string, quantity: number, weightOption: string | null) => {
    setItems((prev) => {
      const key = itemKey(productId, weightOption);
      const idx = prev.findIndex((i) => itemKey(i.productId, i.weightOption) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { productId, quantity, weightOption }];
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, weightOption: string | null, quantity: number) => {
      setItems((prev) => {
        const key = itemKey(productId, weightOption);
        if (quantity <= 0) return prev.filter((i) => itemKey(i.productId, i.weightOption) !== key);
        return prev.map((i) => (itemKey(i.productId, i.weightOption) === key ? { ...i, quantity } : i));
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string, weightOption: string | null) => {
    setItems((prev) => {
      const key = itemKey(productId, weightOption);
      return prev.filter((i) => itemKey(i.productId, i.weightOption) !== key);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, totalCount, addItem, updateQuantity, removeItem, clearCart }),
    [items, totalCount, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
