"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  exiting?: boolean;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

const ToastContext = createContext<{
  showToast: (t: ToastInput) => void;
} | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { bar: string; ring: string; title: string }
> = {
  success: {
    bar: "bg-emerald-600",
    ring: "border-emerald-200 bg-white dark:border-emerald-900/50 dark:bg-zinc-900",
    title: "text-emerald-900 dark:text-emerald-100",
  },
  error: {
    bar: "bg-red-600",
    ring: "border-red-200 bg-white dark:border-red-900/50 dark:bg-zinc-900",
    title: "text-red-900 dark:text-red-100",
  },
  info: {
    bar: "bg-sky-600",
    ring: "border-sky-200 bg-white dark:border-sky-900/50 dark:bg-zinc-900",
    title: "text-sky-900 dark:text-sky-100",
  },
};

const EXIT_MS = 380;
const AUTO_DISMISS_MS = 4200;

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const s = VARIANT_STYLES[item.variant];
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-xl border shadow-lg ring-1 ring-black/5 will-change-transform ${s.ring} transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        item.exiting
          ? "translate-y-[-10px] scale-[0.97] opacity-0"
          : entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0"
      }`}
      role="status"
    >
      <div className={`w-1 shrink-0 ${s.bar}`} aria-hidden />
      <div className="min-w-0 flex-1 px-4 py-3">
        <p className={`text-sm font-semibold ${s.title}`}>{item.title}</p>
        {item.description ? (
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            {item.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        aria-label="닫기"
      >
        닫기
      </button>
    </div>
  );
}

export function DashboardToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const exitingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeAfterExit = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const beginExit = useCallback(
    (id: string) => {
      if (exitingIdsRef.current.has(id)) return;
      exitingIdsRef.current.add(id);
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      const existing = timersRef.current.get(`exit-${id}`);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        exitingIdsRef.current.delete(id);
        removeAfterExit(id);
        timersRef.current.delete(`exit-${id}`);
      }, EXIT_MS);
      timersRef.current.set(`exit-${id}`, t);
    },
    [removeAfterExit],
  );

  const showToast = useCallback(
    (t: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());
      const variant = t.variant ?? "info";
      setToasts((prev) => [
        ...prev,
        { id, title: t.title, description: t.description, variant },
      ]);
      const auto = setTimeout(() => {
        beginExit(id);
        timersRef.current.delete(`auto-${id}`);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(`auto-${id}`, auto);
    },
    [beginExit],
  );

  const dismiss = useCallback(
    (id: string) => {
      const auto = timersRef.current.get(`auto-${id}`);
      if (auto) {
        clearTimeout(auto);
        timersRef.current.delete(`auto-${id}`);
      }
      beginExit(id);
    },
    [beginExit],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const portal =
    mounted && toasts.length > 0 ? (
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[150] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    ) : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && portal ? createPortal(portal, document.body) : null}
    </ToastContext.Provider>
  );
}

export function useDashboardToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useDashboardToast는 DashboardToastProvider 안에서만 사용하세요.");
  }
  return ctx;
}
