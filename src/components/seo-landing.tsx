import Image from "next/image";
import Link from "next/link";
import type { LandingPage } from "@/data/landings";
import type { SiteContent } from "@/lib/content-types";
import { InquiryForm } from "@/components/inquiry-form";

export function SeoLanding({
  landing,
  property,
  heroSrc,
  heroAlt,
}: {
  landing: LandingPage;
  property: SiteContent;
  heroSrc: string;
  heroAlt: string;
}) {
  return (
    <main id="obsah" className="atmosphere min-h-dvh pt-[4.5rem]">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroSrc}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/25" />
        </div>
        <div className="mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-20 sm:px-6 sm:pb-16 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            {property.brand} · {landing.keyword}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-white text-balance sm:text-5xl">
            {landing.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {landing.lead}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#kontakt"
              className="inline-flex rounded-sm bg-[var(--color-moss)] px-5 py-3 text-sm font-medium text-[var(--color-paper)]"
            >
              Domluvit prohlídku
            </a>
            <Link
              href="/"
              className="inline-flex rounded-sm border border-white/50 px-5 py-3 text-sm font-medium text-white"
            >
              Celá nabídka
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <ul className="space-y-3 text-[var(--color-ink-soft)]">
              {landing.bullets.map((b) => (
                <li key={b} className="flex gap-3 border-b border-[var(--color-line)] pb-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-moss)]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
              {landing.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-8 text-sm text-[var(--color-ink-soft)]">
              Související hledání: {landing.relatedKeywords.join(" · ")}.
            </p>
            <p className="mt-4 text-sm">
              <Link href="/" className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline">
                ← Zpět na hlavní prezentaci Usedlost Vodice
              </Link>
            </p>
          </div>

          <aside className="rounded-sm border border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper)_70%,white)] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">Základní údaje</p>
            <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">{property.priceLabel}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{property.priceNote}</p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--color-line)] py-2">
                <dt className="text-[var(--color-ink-soft)]">Adresa</dt>
                <dd className="text-right">{property.location.addressLine}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--color-line)] py-2">
                <dt className="text-[var(--color-ink-soft)]">Dispozice</dt>
                <dd>{property.specs.disposition}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--color-line)] py-2">
                <dt className="text-[var(--color-ink-soft)]">Užitná</dt>
                <dd>{property.specs.usableArea} m²</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--color-line)] py-2">
                <dt className="text-[var(--color-ink-soft)]">Pozemek</dt>
                <dd>{property.specs.plotArea} m²</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section
        id="kontakt"
        className="border-t border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-moss)_8%,var(--color-paper))] py-14 sm:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-moss)]">
              Kontakt
            </p>
            <h2 className="mt-2 font-display text-3xl text-[var(--color-ink)]">Napište kvůli prohlídce</h2>
            <p className="mt-4 text-[var(--color-ink-soft)]">
              {property.contact.ownerName} ·{" "}
              <a className="underline-offset-2 hover:underline" href={`mailto:${property.contact.ownerEmail}`}>
                {property.contact.ownerEmail}
              </a>{" "}
              ·{" "}
              <a
                className="underline-offset-2 hover:underline"
                href={`tel:${property.contact.ownerPhone.replace(/\s/g, "")}`}
              >
                {property.contact.ownerPhone}
              </a>
            </p>
          </div>
          <InquiryForm brand={property.brand} priceLabel={property.priceLabel} />
        </div>
      </section>
    </main>
  );
}
