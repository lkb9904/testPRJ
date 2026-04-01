"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function HomeScrollFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2 md:bottom-8 md:right-8">
      {visible ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe8e2] bg-white text-[#374151] shadow-md transition hover:bg-[#f4faf7]"
          aria-label="맨 위로"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      ) : null}
      <Link
        href="/support"
        className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#166534] bg-[#166534] text-white shadow-md transition hover:bg-[#14532d]"
        aria-label="고객센터"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Link>
    </div>
  );
}
