import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { BrixWithProduct } from "@/lib/types/brix";
import { BrixDetailClient } from "./brix-detail-client";

export const metadata = { title: "당도 전체보기 · 새벽과일" };

export default async function BrixPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const targetDate = params.date ?? new Date().toISOString().slice(0, 10);
  const startOfDay = `${targetDate}T00:00:00`;
  const endOfDay = `${targetDate}T23:59:59`;

  const { data: rows } = await supabase
    .from("brix_measurements")
    .select(
      "id, product_id, measured_brix, baseline_brix, photo_url, description, curator_name, measured_at, is_active, created_at, products(name, image_url)",
    )
    .eq("is_active", true)
    .gte("measured_at", startOfDay)
    .lte("measured_at", endOfDay)
    .order("measured_at", { ascending: false });

  const measurements: BrixWithProduct[] = (rows ?? []).map((r) => {
    const prod = r.products as unknown as { name: string; image_url: string | null } | null;
    return {
      id: r.id,
      product_id: r.product_id,
      measured_brix: Number(r.measured_brix),
      baseline_brix: Number(r.baseline_brix),
      photo_url: r.photo_url,
      description: r.description,
      curator_name: r.curator_name,
      measured_at: r.measured_at,
      is_active: r.is_active,
      created_at: r.created_at,
      product_name: prod?.name ?? "",
      product_image_url: prod?.image_url ?? null,
    };
  });

  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-sm text-[#9ca3a0]">불러오는 중...</p>
        </main>
      }
    >
      <BrixDetailClient measurements={measurements} initialDate={targetDate} />
    </Suspense>
  );
}
