"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_href: string;
  bg_color: string;
};

const fallbackBanners: Banner[] = [
  { id: "f1", title: "제철 과일", subtitle: "지금 만나보세요", image_url: null, link_href: "/products", bg_color: "#d97706" },
  { id: "f2", title: "새벽 배송", subtitle: "신선함을 그대로", image_url: null, link_href: "/products?category=dawn-delivery", bg_color: "#059669" },
];

export function HomeHeroCarousel({ banners }: { banners?: Banner[] }) {
  const slides = banners && banners.length > 0 ? banners : fallbackBanners;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const slide = slides[index % slides.length];

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="relative min-h-[200px] w-full transition-colors duration-500 sm:min-h-[260px] md:min-h-[320px]"
        style={{ backgroundColor: slide.bg_color }}
      >
        {slide.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/15" aria-hidden />
        <div className="relative flex h-full min-h-[200px] flex-col justify-center px-5 py-8 sm:min-h-[260px] md:min-h-[320px] md:px-10">
          <p className="max-w-md text-[22px] font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl">
            {slide.title}
            {slide.subtitle ? (
              <>
                <br />
                {slide.subtitle}
              </>
            ) : null}
          </p>
          <Link
            href={slide.link_href}
            className="mt-5 inline-flex w-fit items-center text-sm font-medium text-white/95 underline-offset-4 hover:underline"
          >
            자세히 보기 <span aria-hidden className="ml-0.5">›</span>
          </Link>
        </div>
        {slides.length > 1 ? (
          <div className="absolute bottom-3 right-4 rounded bg-black/25 px-2 py-0.5 font-mono text-[11px] tabular-nums text-white">
            {String(index + 1).padStart(2, "0")} | {String(slides.length).padStart(2, "0")}
          </div>
        ) : null}
      </div>
      {slides.length > 1 ? (
        <div className="flex justify-center gap-1.5 py-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#166534]" : "w-1.5 bg-[#c5d4cc]"
              }`}
              aria-label={`배너 ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
