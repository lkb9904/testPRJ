"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BrixWithProduct } from "@/lib/types/brix";
import { formatBrix, formatBrixDate, formatFullDate } from "@/lib/types/brix";

function PhotoModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          aria-label="닫기"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-h-[85vh] w-full object-contain" />
      </div>
    </div>
  );
}

export function BrixDetailClient({
  measurements,
  initialDate,
}: {
  measurements: BrixWithProduct[];
  initialDate: string;
}) {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [photoOpen, setPhotoOpen] = useState(false);

  const selected = measurements[selectedIdx] ?? null;

  function changeDate(offset: number) {
    const d = new Date(initialDate + "T12:00:00");
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().slice(0, 10);
    router.push(`/brix?date=${newDate}`);
  }

  const isToday = initialDate === new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-xs text-[#9ca3a0]">
        <Link href="/" className="hover:text-[#374151]">홈</Link>
        <span>/</span>
        <span className="text-[#374151]">당도 전체보기</span>
      </nav>

      {/* Date nav */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe8e2] text-[#374151] transition hover:bg-[#f4f6f5]"
          aria-label="이전 날짜"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-[#1a1f1c]">{formatFullDate(initialDate + "T12:00:00")}</h1>
        <button
          type="button"
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe8e2] text-[#374151] transition hover:bg-[#f4f6f5] disabled:opacity-30"
          aria-label="다음 날짜"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {measurements.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-[#5c6b63]">이 날짜의 당도 측정 데이터가 없습니다.</p>
          <Link
            href="/brix"
            className="mt-4 inline-flex rounded-full bg-[#166534] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#14532d]"
          >
            오늘로 이동
          </Link>
        </div>
      ) : (
        <>
          {/* Thumbnail selector */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {measurements.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex shrink-0 flex-col items-center rounded-2xl p-2 transition ${
                  idx === selectedIdx
                    ? "bg-[#f0fdf4] ring-2 ring-[#166534]"
                    : "bg-white hover:bg-[#fafdfb]"
                }`}
              >
                <div className="h-14 w-14 overflow-hidden rounded-full bg-[#f4f6f5]">
                  {m.product_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.product_image_url} alt={m.product_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-[#166534]/25">
                      {m.product_name.slice(0, 1)}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected detail */}
          {selected ? (
            <div className="mt-8 rounded-3xl border border-[#eef2ee] bg-[#fafdfb] p-6 md:p-8">
              {/* Time label */}
              <p className="flex items-center gap-1 text-xs text-[#9ca3a0]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatBrixDate(selected.measured_at)}
              </p>

              {/* Product name */}
              <h2 className="mt-3 text-xl font-bold text-[#1a1f1c]">{selected.product_name}</h2>

              {/* Product image */}
              <div className="mt-5 flex justify-center">
                <div className="h-40 w-40 overflow-hidden rounded-2xl bg-white shadow-sm">
                  {selected.product_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.product_image_url}
                      alt={selected.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[#166534]/20">
                      {selected.product_name.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Measurement photo button */}
              {selected.photo_url ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setPhotoOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe8e2] bg-white px-4 py-2 text-xs font-medium text-[#374151] transition hover:border-[#166534] hover:text-[#14532d]"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    당도 실측 사진보기
                  </button>
                </div>
              ) : null}

              {/* Brix display */}
              <div className="mt-6 flex items-end justify-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-[#9ca3a0]">기준 brix {formatBrix(selected.baseline_brix)}</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-extrabold tabular-nums tracking-tight text-[#1a1f1c]">
                    {formatBrix(selected.measured_brix)}
                  </p>
                </div>
              </div>

              {/* Brix bar comparison */}
              <div className="mx-auto mt-4 max-w-xs">
                <div className="h-2 overflow-hidden rounded-full bg-[#eef2ee]">
                  <div
                    className="h-full rounded-full bg-[#166534] transition-all"
                    style={{
                      width: `${Math.min(100, (selected.measured_brix / (selected.baseline_brix * 1.5)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              {selected.description ? (
                <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-[#5c6b63]">
                  {selected.description}
                </div>
              ) : null}

              {/* Curator */}
              <p className="mt-6 text-right text-xs text-[#9ca3a0]">
                Curator {selected.curator_name}
              </p>
            </div>
          ) : null}

          {/* Photo modal */}
          {photoOpen && selected?.photo_url ? (
            <PhotoModal
              src={selected.photo_url}
              alt={`${selected.product_name} 당도 실측 사진`}
              onClose={() => setPhotoOpen(false)}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
