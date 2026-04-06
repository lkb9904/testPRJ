"use client";

import Link from "next/link";
import type { BrixWithProduct } from "@/lib/types/brix";
import { formatBrix, formatBrixDate } from "@/lib/types/brix";

type Props = {
  measurements: BrixWithProduct[];
};

export function HomeBrixSection({ measurements }: Props) {
  if (measurements.length === 0) return null;

  const latestTime = measurements[0].measured_at;

  return (
    <section className="border-t border-[#eef2ee] bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#1a1f1c] sm:text-xl">
            오늘의 당도
          </h2>
          <span className="flex items-center gap-1 text-xs text-[#9ca3a0]">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatBrixDate(latestTime)}
          </span>
        </div>

        <div className="mt-5 flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {measurements.map((m) => (
            <Link
              key={m.id}
              href={`/brix?date=${m.measured_at.slice(0, 10)}`}
              className="flex w-28 shrink-0 flex-col items-center rounded-2xl bg-white p-3 transition hover:shadow-md sm:w-32"
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#f4f6f5] p-1 sm:h-18 sm:w-18">
                {m.product_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.product_image_url}
                    alt={m.product_name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-[#166534]/25">
                    {m.product_name.slice(0, 1)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-center text-xs font-medium text-[#374151] line-clamp-1">
                {m.product_name}
              </p>
              <p className="mt-1 text-center text-3xl font-extrabold tabular-nums tracking-tight text-[#1a1f1c]">
                {formatBrix(m.measured_brix)}
              </p>
              <p className="mt-0.5 text-center text-[10px] text-[#9ca3a0]">
                기준 {formatBrix(m.baseline_brix)}brix
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/brix"
            className="inline-flex items-center gap-1 rounded-full border border-[#dfe8e2] bg-white px-6 py-2.5 text-sm font-medium text-[#374151] transition hover:border-[#166534] hover:text-[#14532d]"
          >
            당도 전체보기
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
