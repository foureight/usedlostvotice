"use client";

import { useState } from "react";

type SiteHeaderProps = {
  brand: string;
  showGalerie: boolean;
  showVize: boolean;
};

export function SiteHeader({ brand, showGalerie, showVize }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  // Absolute /#… so landing pages jump back to the main presentation.
  const links = [
    { href: "/#nemovitost", label: "Nemovitost" },
    ...(showGalerie ? [{ href: "/#galerie", label: "Galerie" }] : []),
    ...(showVize ? [{ href: "/#vize", label: "Vize" }] : []),
    { href: "/#lokalita", label: "Lokalita" },
    { href: "/#mapa", label: "Mapa" },
    { href: "/#dostavba", label: "Dostavba" },
    { href: "/#kontakt", label: "Kontakt" },
  ];

  return (
    <header
      data-site-header
      className="fixed inset-x-0 top-0 z-50 border-b-2 border-[var(--color-moss)] bg-black text-[var(--color-paper)]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
            Prezentace prodeje domu
          </span>
          <span className="font-display text-lg tracking-tight sm:text-xl">{brand}</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-white">
              {l.label}
            </a>
          ))}
          <a
            href="/#kontakt"
            className="rounded-sm border border-white/55 px-3.5 py-2 text-sm font-medium text-[var(--color-paper)] transition hover:border-white"
          >
            Domluvit prohlídku
          </a>
        </nav>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm border border-white/45 px-3 py-2 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Zavřít" : "Menu"}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 bg-black px-4 py-4 md:hidden"
        >
          <ul className="flex flex-col gap-3 text-base text-white/90">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block py-1 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/#kontakt"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex rounded-sm bg-[var(--color-moss)] px-4 py-2.5 text-[var(--color-paper)]"
              >
                Domluvit prohlídku
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
