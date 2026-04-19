'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function SearchInput({
  defaultValue,
}: {
  defaultValue: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const isMounted = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the effect on the initial render — only react to user-driven changes
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set('search', value.trim());
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, pathname, router]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
      <svg
        className="h-4 w-4 shrink-0 text-stone-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z"
        />
      </svg>
      <input
        id="client-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, email, phone…"
        className="flex-1 bg-transparent py-1.5 text-sm text-zinc-900 placeholder-stone-300 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="shrink-0 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-50"
        >
          Clear
        </button>
      )}
    </div>
  );
}
