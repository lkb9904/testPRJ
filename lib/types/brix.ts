export type BrixMeasurement = {
  id: string;
  product_id: string;
  measured_brix: number;
  baseline_brix: number;
  photo_url: string | null;
  description: string | null;
  curator_name: string;
  measured_at: string;
  is_active: boolean;
  created_at: string;
};

export type BrixWithProduct = BrixMeasurement & {
  product_name: string;
  product_image_url: string | null;
};

export function formatBrix(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export function formatBrixDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const day = d.getDate();
  const dow = days[d.getDay()];
  const h = d.getHours();
  return `${day}일(${dow}) ${h < 10 ? "0" : ""}${h}시 기준`;
}

export function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
