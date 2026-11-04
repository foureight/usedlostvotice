"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Item = { src: string; alt: string };

function GalleryThumb({
  item,
  index,
  onOpen,
}: {
  item: Item;
  index: number;
  onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShowImage(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowImage(true);
          io.disconnect();
        }
      },
      // Load a bit before each tile hits the screen — top tiles first while scrolling.
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(index)}
      className="group relative aspect-[4/3] overflow-hidden bg-[var(--color-paper-deep)] text-left"
    >
      {showImage ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={65}
          loading="lazy"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      ) : null}
    </button>
  );
}

export function GalleryGrid({
  items,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: {
  items: readonly Item[];
  columns?: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  const prev = () =>
    setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
  const next = () => setActive((i) => (i === null ? i : (i + 1) % items.length));

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") {
        setActive((i) => (i === null ? i : (i + 1) % items.length));
      }
      if (e.key === "ArrowLeft") {
        setActive((i) => (i === null ? i : (i - 1 + items.length) % items.length));
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, items.length]);

  return (
    <>
      <div className={`grid gap-3 ${columns}`}>
        {items.map((item, i) => (
          <GalleryThumb key={item.src} item={item} index={i} onOpen={setActive} />
        ))}
      </div>
      {active !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie — fotografie ${active + 1} z ${items.length}`}
          className="fixed inset-0 z-[80] flex flex-col bg-[color-mix(in_oklab,var(--color-ink)_90%,transparent)]"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--color-paper)] sm:px-6">
            <p className="tabular-nums text-white/75">
              {active + 1} / {items.length}
            </p>
            <button
              type="button"
              className="rounded-sm border border-white/35 px-3 py-1.5 transition hover:border-white"
              onClick={() => setActive(null)}
            >
              Zavřít
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 sm:px-16">
            {items.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Předchozí fotografie"
                  onClick={prev}
                  className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-sm border border-white/35 text-xl text-[var(--color-paper)] transition hover:border-white sm:left-4"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Další fotografie"
                  onClick={next}
                  className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-sm border border-white/35 text-xl text-[var(--color-paper)] transition hover:border-white sm:right-4"
                >
                  ›
                </button>
              </>
            ) : null}

            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Zavřít galerii"
              onClick={() => setActive(null)}
            />

            <div
              className="relative z-[1] h-[min(78vh,720px)] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[active].src}
                alt={items[active].alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1024px"
                quality={80}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="px-4 pb-5 pt-2 text-center sm:px-6">
            <p className="mx-auto max-w-3xl text-sm text-[color-mix(in_oklab,var(--color-paper)_82%,transparent)]">
              {items[active].alt}
            </p>
            {items.length > 1 ? (
              <p className="mt-2 text-xs text-white/45">
                Proklikejte šipkami nebo klávesami ← →
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
