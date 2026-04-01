"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    key: "1",
    line1: "반복되는 실패 대신",
    line2: "믿고 먹는 맛의 확신",
    cta: "제철 큐레이션 보러가기",
    href: "/#today",
    gradient:
      "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600",
  },
  {
    key: "2",
    line1: "새벽에 담긴",
    line2: "그날의 신선함",
    cta: "픽업으로 주문하기",
    href: "/pickup",
    gradient:
      "bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800",
  },
  {
    key: "3",
    line1: "제철 과일",
    line2: "지금 만나보세요",
    cta: "배송 안내",
    href: "/delivery",
    gradient:
      "bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500",
  },
];

export function HomeHeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(t);
  }, []);

  const slide = slides[index]!;

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={`relative min-h-[220px] w-full transition-[background] duration-500 sm:min-h-[280px] md:min-h-[320px] ${slide.gradient}`}
      >
        <div className="absolute inset-0 bg-black/10" aria-hidden />
        <div className="relative flex h-full min-h-[220px] flex-col justify-center px-5 py-8 sm:min-h-[280px] md:min-h-[320px] md:px-10">
          <p className="text-[22px] font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
            {slide.line1}
            <br />
            {slide.line2}
          </p>
          <Link
            href={slide.href}
            className="mt-5 inline-flex w-fit items-center text-sm font-medium text-white/95 underline-offset-4 hover:underline"
          >
            {slide.cta} <span aria-hidden className="ml-0.5">›</span>
          </Link>
        </div>
        <div className="absolute bottom-3 right-4 rounded bg-black/25 px-2 py-0.5 font-mono text-[11px] tabular-nums text-white">
          {String(index + 1).padStart(2, "0")} | {String(slides.length).padStart(2, "0")}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 py-3">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-[#166534]" : "w-1.5 bg-[#c5d4cc]"
            }`}
            aria-label={`배너 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
