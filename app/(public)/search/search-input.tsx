"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="어떤 상품을 찾으세요?"
        autoFocus
        className="flex-1 rounded-xl border border-[#dfe8e2] bg-white px-4 py-3 text-sm text-[#1a1f1c] placeholder:text-[#9ca3a0] focus:border-[#166534] focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-[#166534] px-5 py-3 text-sm font-medium text-white hover:bg-[#14532d]"
      >
        검색
      </button>
    </form>
  );
}
