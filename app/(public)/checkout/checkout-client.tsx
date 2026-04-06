"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useCart, type CartItem } from "@/lib/cart/cart-context";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { placeOrder } from "@/lib/order/place-order";
import { formatKrw } from "@/lib/types/product";

type Loc = { id: string; name: string; address: string | null };
type ProductInfo = {
  id: string;
  name: string;
  unit_price_krw: number;
  sale_price_krw: number | null;
  image_url: string | null;
  weight_options: { label: string; price: number }[];
};

export function CheckoutClient({ user, locations }: { user: User | null; locations: Loc[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, clearCart } = useCart();
  const [products, setProducts] = useState<Map<string, ProductInfo>>(new Map());
  const [loading, setLoading] = useState(true);

  // "바로 주문" URL params: ?product=ID&qty=N&weight=LABEL
  const buyNowProductId = searchParams.get("product");
  const buyNowQty = Math.max(1, Number(searchParams.get("qty") ?? 1));
  const buyNowWeight = searchParams.get("weight") || null;

  const isBuyNow = Boolean(buyNowProductId);

  const items: CartItem[] = useMemo(() => {
    if (isBuyNow && buyNowProductId) {
      return [{ productId: buyNowProductId, quantity: buyNowQty, weightOption: buyNowWeight }];
    }
    return cartItems;
  }, [isBuyNow, buyNowProductId, buyNowQty, buyNowWeight, cartItems]);

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("delivery");
  const [pickupLocationId, setPickupLocationId] = useState(locations[0]?.id ?? "");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) { setLoading(false); return; }
    const ids = [...new Set(items.map((i) => i.productId))];
    const supabase = createBrowserClient();
    supabase
      .from("products")
      .select("id, name, unit_price_krw, sale_price_krw, image_url, weight_options")
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

  function getPrice(productId: string, weightOption: string | null): number {
    const p = products.get(productId);
    if (!p) return 0;
    if (weightOption) {
      const wo = p.weight_options.find((w) => w.label === weightOption);
      if (wo) return wo.price;
    }
    return p.sale_price_krw ?? p.unit_price_krw;
  }

  const totalPrice = items.reduce((s, i) => s + getPrice(i.productId, i.weightOption) * i.quantity, 0);

  async function handleSubmit() {
    setError(null);
    setPending(true);

    const result = await placeOrder({
      orderType,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        weightOption: i.weightOption,
      })),
      pickupLocationId: orderType === "pickup" ? pickupLocationId : undefined,
      addressLine1: orderType === "delivery" ? addressLine1 : undefined,
      addressLine2: orderType === "delivery" ? addressLine2 : undefined,
      postalCode: orderType === "delivery" ? postalCode : undefined,
      recipientName: orderType === "delivery" ? recipientName : undefined,
      recipientPhone: orderType === "delivery" ? recipientPhone : undefined,
      notes,
      ...(!user ? { guestName, guestPhone } : {}),
    });

    setPending(false);

    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }

    if ("ok" in result && result.ok) {
      if (!isBuyNow) clearCart();
      router.push(`/order-complete?order=${result.orderNumber}`);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <h1 className="text-xl font-bold text-[#1a1f1c]">주문하기</h1>
        <p className="mt-4 text-sm text-[#9ca3a0]">불러오는 중...</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-[#1a1f1c]">주문하기</h1>
        <p className="mt-4 text-[#5c6b63]">장바구니가 비어있습니다.</p>
        <Link href="/products" className="mt-4 inline-flex rounded-full bg-[#166534] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]">
          쇼핑하러 가기
        </Link>
      </main>
    );
  }

  const inputCls = "w-full rounded-lg border border-[#dfe8e2] px-3 py-2.5 text-sm text-[#1a1f1c] focus:border-[#166534] focus:outline-none";
  const labelCls = "mb-1 block text-xs font-medium text-[#374151]";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12">
      <h1 className="text-xl font-bold text-[#1a1f1c]">주문하기</h1>

      {/* Guest info */}
      {!user ? (
        <section className="mt-6 rounded-xl border border-[#dfe8e2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1a1f1c]">주문자 정보</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>이름 *</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="홍길동" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>연락처 *</label>
              <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="01012345678" className={inputCls} />
            </div>
          </div>
          <p className="mt-2 text-xs text-[#9ca3a0]">
            이미 회원이시면 <Link href="/login" className="text-[#166534] underline">로그인</Link>해 주세요.
          </p>
        </section>
      ) : null}

      {/* Order type */}
      <section className="mt-6 rounded-xl border border-[#dfe8e2] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1a1f1c]">수령 방식</h2>
        <div className="mt-3 flex gap-3">
          {(["delivery", "pickup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium transition ${
                orderType === t
                  ? "border-[#166534] bg-[#f0fdf4] text-[#14532d]"
                  : "border-[#dfe8e2] text-[#5c6b63] hover:border-[#166534]/40"
              }`}
            >
              {t === "delivery" ? "배송" : "픽업"}
            </button>
          ))}
        </div>

        {orderType === "pickup" ? (
          <div className="mt-4">
            <label className={labelCls}>픽업 장소</label>
            <select
              value={pickupLocationId}
              onChange={(e) => setPickupLocationId(e.target.value)}
              className={inputCls}
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}{l.address ? ` (${l.address})` : ""}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>수령인 *</label>
                <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>수령인 연락처 *</label>
                <input type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="01012345678" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>주소 *</label>
              <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="도로명 주소" className={inputCls} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>상세주소</label>
                <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="동/호수" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>우편번호</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Order items summary */}
      <section className="mt-6 rounded-xl border border-[#dfe8e2] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#1a1f1c]">주문 상품</h2>
        <ul className="mt-3 divide-y divide-[#eef2ee]">
          {items.map((item) => {
            const p = products.get(item.productId);
            const price = getPrice(item.productId, item.weightOption);
            return (
              <li key={`${item.productId}::${item.weightOption}`} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f4f6f5]">
                  {p?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#e8f0eb] to-[#d1ddd6] text-sm font-bold text-[#166534]/30">
                      {p?.name?.slice(0, 1) ?? "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-[#1a1f1c]">{p?.name ?? "상품"}</p>
                  {item.weightOption ? (
                    <p className="text-xs text-[#9ca3a0]">{item.weightOption}</p>
                  ) : null}
                  <p className="text-xs text-[#5c6b63]">{formatKrw(price)} x {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums text-[#1a1f1c]">
                  {formatKrw(price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Notes */}
      <section className="mt-6 rounded-xl border border-[#dfe8e2] bg-white p-5">
        <label className="text-sm font-semibold text-[#1a1f1c]">배송 메모</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="요청사항을 입력하세요"
          className={`${inputCls} mt-2`}
        />
      </section>

      {/* Total & submit */}
      <div className="mt-6 rounded-xl border border-[#dfe8e2] bg-[#fafdfb] p-5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#374151]">총 결제금액</span>
          <span className="text-xl font-bold text-[#1a1f1c]">{formatKrw(totalPrice)}</span>
        </div>
        {error ? <p className="mt-3 text-sm text-[#dc2626]">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() => void handleSubmit()}
          className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#166534] py-3.5 text-sm font-semibold text-white hover:bg-[#14532d] disabled:opacity-50"
        >
          {pending ? "주문 처리 중..." : `${formatKrw(totalPrice)} 주문하기`}
        </button>
        <p className="mt-2 text-center text-xs text-[#9ca3a0]">
          결제 안내는 주문 접수 후 별도 연락드립니다.
        </p>
      </div>
    </main>
  );
}
