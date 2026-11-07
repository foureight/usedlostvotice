"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOpeningStatus, OPENING_RULES, type OpeningStatus } from "@/lib/opening-hours";

type SiteHeaderProps = {
  brand: string;
  showGalerie: boolean;
  showVize: boolean;
};

export function SiteHeader({ brand, showGalerie, showVize }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OpeningStatus | null>(null);

  useEffect(() => {
    const tick = () => setStatus(getOpeningStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

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
      <div className="border-b border-white/10 bg-[color-mix(in_oklab,var(--color-moss-deep)_88%,black)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-1.5 text-[11px] leading-snug text-white/75 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:text-xs lg:px-8">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <span
              className={
                status?.open
                  ? "font-medium text-[color-mix(in_oklab,var(--color-moss)_70%,white)]"
                  : "font-medium text-white/90"
              }
            >
              {status ? status.label : "Prohlídky"}
            </span>
            {status ? (
              <>
                <span aria-hidden className="text-white/35">
                  ·
                </span>
                <span className="text-white/65">{status.detail}</span>
              </>
            ) : null}
          </p>
          <p className="min-w-0 truncate text-white/55 sm:max-w-[58%] sm:text-right" title={OPENING_RULES.map((r) => r.text).join(" · ")}>
            <span className="sm:hidden">
              So 1.4.–31.10. 8–11:30 · So 1.11.–31.3. zavřeno · Zima st 8–16
            </span>
            <span className="hidden sm:inline">
              {OPENING_RULES.map((r) => r.text).join(" · ")}
            </span>
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">
            Prezentace prodeje domu
          </span>
          <span className="font-display text-lg tracking-tight sm:text-xl">{brand}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link
            href="/#kontakt"
            className="rounded-sm border border-white/55 px-3.5 py-2 text-sm font-medium text-[var(--color-paper)] transition hover:border-white"
          >
            Domluvit prohlídku
          </Link>
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
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-white/10 pt-3 text-sm text-white/65">
              <p className="font-medium text-white/85">Prohlídky</p>
              <ul className="mt-1.5 space-y-1">
                {OPENING_RULES.map((r) => (
                  <li key={r.id}>{r.text}</li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href="/#kontakt"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex rounded-sm bg-[var(--color-moss)] px-4 py-2.5 text-[var(--color-paper)]"
              >
                Domluvit prohlídku
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
