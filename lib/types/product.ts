export type WeightOption = {
  label: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  unit_label: string;
  unit_price_krw: number;
  sale_price_krw: number | null;
  discount_percent: number | null;
  delivery_type: string;
  weight_options: WeightOption[];
  origin: string | null;
  badge: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  review_count: number;
  category_id: string | null;
};

export type ProductCard = Pick<
  Product,
  | "id"
  | "name"
  | "unit_price_krw"
  | "sale_price_krw"
  | "discount_percent"
  | "delivery_type"
  | "badge"
  | "image_url"
  | "review_count"
  | "unit_label"
>;

export function effectivePrice(p: Pick<Product, "unit_price_krw" | "sale_price_krw">): number {
  return p.sale_price_krw ?? p.unit_price_krw;
}

export function formatKrw(n: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(n)}원`;
}
