"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type OrderItem = {
  productId: string;
  quantity: number;
  weightOption: string | null;
};

export type PlaceOrderInput = {
  orderType: "pickup" | "delivery";
  items: OrderItem[];
  pickupLocationId?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  recipientName?: string;
  recipientPhone?: string;
  notes?: string;
  guestName?: string;
  guestPhone?: string;
};

export async function placeOrder(input: PlaceOrderInput) {
  if (input.items.length === 0) return { error: "담은 상품이 없습니다." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const guestName = input.guestName?.trim() ?? "";
  const guestPhone = input.guestPhone?.trim().replace(/[\s-]/g, "") ?? "";

  if (!user) {
    if (guestName.length < 2) return { error: "이름을 2자 이상 입력해 주세요." };
    if (guestPhone.length < 9 || !/^[0-9+]+$/.test(guestPhone))
      return { error: "연락처를 올바르게 입력해 주세요." };
  }

  if (input.orderType === "pickup" && !input.pickupLocationId)
    return { error: "픽업 장소를 선택해 주세요." };

  if (input.orderType === "delivery") {
    if (!input.addressLine1?.trim()) return { error: "배송지 주소를 입력해 주세요." };
    if (!input.recipientName?.trim()) return { error: "수령인 이름을 입력해 주세요." };
    if (!input.recipientPhone?.trim()) return { error: "수령인 연락처를 입력해 주세요." };
  }

  const productIds = [...new Set(input.items.map((i) => i.productId))];
  const { data: productsData, error: pErr } = await supabase
    .from("products")
    .select("id, name, unit_price_krw, sale_price_krw, weight_options")
    .in("id", productIds);

  if (pErr || !productsData) return { error: "상품 정보를 불러올 수 없습니다." };

  const productMap = new Map(productsData.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItems: { product_id: string; product_name: string; quantity: number; unit_price: number; line_total: number; sort_order: number }[] = [];

  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    const p = productMap.get(item.productId);
    if (!p) return { error: "존재하지 않는 상품이 포함되어 있습니다." };

    let unitPrice = p.sale_price_krw ?? p.unit_price_krw;
    if (item.weightOption && Array.isArray(p.weight_options)) {
      const wo = (p.weight_options as { label: string; price: number }[]).find(
        (w) => w.label === item.weightOption,
      );
      if (wo) unitPrice = wo.price;
    }

    const lineTotal = unitPrice * item.quantity;
    totalAmount += lineTotal;
    orderItems.push({
      product_id: p.id,
      product_name: p.name,
      quantity: item.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      sort_order: i,
    });
  }

  let customerId: string;

  if (user) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: cErr } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          display_name: user.email?.split("@")[0] ?? "회원",
          email: user.email,
        })
        .select("id")
        .single();
      if (cErr || !newCust) return { error: "고객 정보 생성에 실패했습니다." };
      customerId = newCust.id;
    }
  } else {
    const { data: gCust, error: gErr } = await supabase
      .from("customers")
      .insert({ display_name: guestName, phone: guestPhone })
      .select("id")
      .single();
    if (gErr || !gCust) return { error: "비회원 고객 정보 생성에 실패했습니다." };
    customerId = gCust.id;
  }

  let deliveryAddressId: string | null = null;
  if (input.orderType === "delivery") {
    const { data: addr, error: aErr } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: customerId,
        recipient_name: input.recipientName!.trim(),
        line1: input.addressLine1!.trim(),
        line2: input.addressLine2?.trim() || null,
        postal_code: input.postalCode?.trim() || null,
        phone: input.recipientPhone!.trim(),
      })
      .select("id")
      .single();
    if (aErr || !addr) return { error: "배송지 저장에 실패했습니다." };
    deliveryAddressId = addr.id;
  }

  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customerId,
      order_type: input.orderType,
      pickup_location_id: input.orderType === "pickup" ? input.pickupLocationId : null,
      delivery_address_id: deliveryAddressId,
      notes: input.notes?.trim() || null,
      total_amount: totalAmount,
      status: "주문접수",
    })
    .select("id")
    .single();

  if (oErr || !order) return { error: oErr?.message ?? "주문 생성에 실패했습니다." };

  const itemsToInsert = orderItems.map((oi) => ({ ...oi, order_id: order.id }));
  const { error: iiErr } = await supabase.from("order_items").insert(itemsToInsert);

  if (iiErr) return { error: "주문 항목 저장에 실패했습니다." };

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");

  return { ok: true as const, orderNumber };
}
