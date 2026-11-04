"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts heavy media (galleries, large images) only when near the viewport,
 * so the hero and above-the-fold content can load first.
 */
export function DeferUntilVisible({
  children,
  className = "",
  /** How far before the element enters the viewport to start loading. */
  rootMargin = "280px 0px",
  /** Min height placeholder so layout doesn't jump. */
  minHeight = 240,
  label = "Načítám fotografie…",
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  minHeight?: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser can't observe (or already in view on load), mount soon.
    if (typeof IntersectionObserver === "undefined") {
      setReady(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {ready ? (
        children
      ) : (
        <div
          className="flex items-center justify-center bg-[color-mix(in_oklab,var(--color-paper-deep)_80%,transparent)] text-sm text-[var(--color-ink-soft)]"
          style={{ minHeight }}
          aria-hidden
        >
          {label}
        </div>
      )}
    </div>
  );
}
