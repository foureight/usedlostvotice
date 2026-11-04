import Image from "next/image";
import { DeferUntilVisible } from "@/components/defer-until-visible";
import { FadeIn } from "@/components/fade-in";
import { FaqAccordion } from "@/components/faq-accordion";
import { GalleryGrid } from "@/components/lightbox";
import { InquiryForm } from "@/components/inquiry-form";
import {
  gallery,
  plans,
  property,
  visualizations,
  visualizationsDokonceno,
  visualizationsPhoto,
} from "@/data/property";

function SectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-moss)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl leading-tight text-balance sm:text-4xl">{title}</h2>
      {lead ? <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">{lead}</p> : null}
    </div>
  );
}

export default function HomePage() {
  const hero = gallery[0];
  const photoGallery = gallery.filter((g) => g.kind !== "stav");
  const stavGallery = gallery.filter((g) => g.kind === "stav");

  return (
    <main id="top" className="atmosphere relative overflow-x-hidden">
      {/* HERO — mobile: photo then gray copy strip; desktop: full-bleed overlay */}
      <section className="relative md:min-h-[100svh] md:grain">
        <div className="relative h-[62svh] w-full md:absolute md:inset-0 md:h-auto md:min-h-[100svh]">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={75}
            className="animate-ken object-cover object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[color-mix(in_oklab,var(--color-ink)_78%,transparent)] via-[color-mix(in_oklab,var(--color-ink)_35%,transparent)] to-[color-mix(in_oklab,var(--color-ink)_20%,transparent)] md:block"
          />
        </div>

        <div className="relative bg-[#d9d6d1] text-[var(--color-ink)] md:flex md:min-h-[100svh] md:flex-col md:justify-end md:bg-transparent md:text-[var(--color-paper)]">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:pb-20 md:pt-28 lg:px-8">
            <p className="animate-rise text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-ink-soft)] md:text-[color-mix(in_oklab,var(--color-paper)_70%,transparent)]">
              Samostatná prezentace prodeje domu
            </p>
            <p
              className="animate-rise mt-3 font-display text-4xl text-[var(--color-ink)] sm:text-5xl md:text-6xl md:text-[var(--color-paper)] lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              {property.brand}
            </p>
            <h1
              className="animate-rise mt-4 max-w-xl text-lg leading-snug text-[var(--color-ink-soft)] sm:text-xl md:text-2xl md:text-[color-mix(in_oklab,var(--color-paper)_88%,transparent)]"
              style={{ animationDelay: "120ms" }}
            >
              {property.title}
            </h1>
            <p
              className="animate-rise mt-4 max-w-lg text-sm text-[var(--color-ink-soft)] sm:text-base md:text-[color-mix(in_oklab,var(--color-paper)_72%,transparent)]"
              style={{ animationDelay: "220ms" }}
            >
              {property.specs.disposition} · {property.specs.usableArea} m² · pozemek{" "}
              {property.specs.plotArea} m² · {property.location.addressLine} · Pilský rybník
            </p>
            <div
              className="animate-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "280ms" }}
            >
              <a
                href="#kontakt"
                className="rounded-sm bg-[var(--color-moss)] px-5 py-3 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-moss-deep)]"
              >
                Domluvit prohlídku
              </a>
              <a
                href="#galerie"
                className="rounded-sm border border-[color-mix(in_oklab,var(--color-ink)_28%,transparent)] px-5 py-3 text-sm text-[var(--color-ink)] transition hover:border-[var(--color-ink)] md:border-[color-mix(in_oklab,var(--color-paper)_45%,transparent)] md:text-[var(--color-paper)] md:hover:border-[var(--color-paper)]"
              >
                Prohlédnout fotografie
              </a>
            </div>
          </div>
        </div>
      </section>

      <div id="obsah">
        {/* SPECS STRIP */}
        <section id="nemovitost" className="border-y border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper)_70%,white)]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[var(--color-line)] sm:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 bg-[var(--color-moss-deep)] px-4 py-5 text-[var(--color-paper)] sm:col-span-3 sm:px-5 lg:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[color-mix(in_oklab,var(--color-paper)_65%,transparent)]">
                Cena
              </p>
              <p className="mt-1 font-display text-3xl sm:text-4xl">{property.priceLabel}</p>
              <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--color-paper)_70%,transparent)]">
                {property.priceNote}
              </p>
            </div>
            {[
              { k: "Dispozice", v: property.specs.disposition },
              { k: "Užitná plocha", v: `${property.specs.usableArea} m²` },
              { k: "Pozemek", v: `${property.specs.plotArea} m²` },
              { k: "Stodola", v: `${property.specs.builtUpBarn} m²` },
            ].map((item) => (
              <div key={item.k} className="bg-[var(--color-paper)] px-4 py-5 sm:px-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{item.k}</p>
                <p className="mt-1 font-display text-xl sm:text-2xl">{item.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STORY */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <FadeIn>
            <SectionHead
              eyebrow="O nabídce"
              title="Zahájená rekonstrukce usedlosti u rybníka"
              lead={property.summary[0]}
            />
          </FadeIn>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <FadeIn delay={80} className="space-y-5 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
              {property.summary.slice(1).map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>
                {property.priceNote}. Aktuální inzerát také na{" "}
                <a href={property.listingUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  reality.idnes.cz
                </a>
                .
              </p>
            </FadeIn>
            <FadeIn delay={140}>
              <ul className="space-y-5 border-l border-[var(--color-line)] pl-5">
                {property.highlights.map((h) => (
                  <li key={h.title}>
                    <p className="font-medium text-[var(--color-ink)]">{h.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">{h.text}</p>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </section>

        {/* GALLERY */}
        <section id="galerie" className="bg-[var(--color-moss-deep)] py-16 text-[var(--color-paper)] sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
                Fotografie
              </p>
              <h2 className="font-display text-3xl sm:text-4xl">Dům, stodola a krajina kolem Pilského rybníka</h2>
              <p className="mt-4 max-w-2xl text-[color-mix(in_oklab,var(--color-paper)_72%,transparent)]">
                Profesionální snímky exteriéu a interiéru. Po srovnání terénu jsou další aktuální fotky na{" "}
                <a href={property.listingUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  inzerátu
                </a>
                ; lokalita znovu ožije zelení.
              </p>
            </FadeIn>
            <DeferUntilVisible className="mt-10" minHeight={420} label="Načítám galerii…">
              <GalleryGrid items={photoGallery} />
            </DeferUntilVisible>
            {stavGallery.length ? (
              <div className="mt-12">
                <h3 className="font-display text-2xl">Aktuální stavební stav</h3>
                <p className="mt-2 max-w-xl text-sm text-[color-mix(in_oklab,var(--color-paper)_70%,transparent)]">
                  Přístavek a stodola tak, jak dnes vypadají na místě.
                </p>
                <DeferUntilVisible className="mt-6" minHeight={280} label="Načítám fotografie stavu…">
                  <GalleryGrid items={stavGallery} columns="grid-cols-1 sm:grid-cols-2" />
                </DeferUntilVisible>
              </div>
            ) : null}
          </div>
        </section>

        {/* VISION */}
        <section id="vize" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <FadeIn>
            <SectionHead
              eyebrow="Vize dokončení"
              title="Studie nabarvená do atmosféry místa"
              lead="Šedé rámce Dílny architektury jsme dobarvili materiály a světlem z reálných fotek usedlosti — bílá omítka, dřevo, pálená krytina, jarní zeleň a rybník. Jde o ilustrativní fotovize, ne o finální CGI zakázku."
            />
          </FadeIn>
          <FadeIn delay={100} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-ink-soft)]">
            <span>
              Autor studie: {property.architecture.studio} · {property.architecture.authors.join(", ")}
            </span>
            <span>Studie {property.architecture.studyYear}</span>
            <a
              href={property.architecture.pdf}
              className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Stáhnout PDF studie
            </a>
          </FadeIn>
          <DeferUntilVisible className="mt-10" minHeight={420} label="Načítám fotovize…">
            <GalleryGrid items={visualizationsPhoto} />
          </DeferUntilVisible>

          <div id="vize-dokonceno" className="mt-16 border-t border-[var(--color-line)] pt-14">
            <FadeIn>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-moss)]">
                Další vize dokončení
              </p>
              <h3 className="font-display text-2xl sm:text-3xl">
                Usedlost po dostavbě — dům, stodola, terasa a rybník
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-soft)] sm:text-base">
                Druhá sada ilustrativních vizí: exteriér, terasy, interiér a atmosféra bydlení u
                Pilského rybníka. Nejde o finální CGI zakázku — pomáhají představit směr dokončení.
              </p>
            </FadeIn>
            <DeferUntilVisible className="mt-8" minHeight={420} label="Načítám vize dokončení…">
              <GalleryGrid items={visualizationsDokonceno} />
            </DeferUntilVisible>
          </div>

          <div className="mt-14">
            <h3 className="font-display text-2xl sm:text-3xl">Původní studie (černobílé rámy)</h3>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-soft)] sm:text-base">
              Originální prostorové náhledy ze studie — přesná geometrie, ze které fotovize vycházejí.
            </p>
            <DeferUntilVisible className="mt-6" minHeight={420} label="Načítám studii…">
              <GalleryGrid items={visualizations} />
            </DeferUntilVisible>
          </div>
          <div className="mt-14">
            <h3 className="font-display text-2xl sm:text-3xl">Půdorysy a situace</h3>
            <DeferUntilVisible className="mt-6" minHeight={320} label="Načítám půdorysy…">
              <GalleryGrid
                items={plans.map((p) => ({ src: p.src, alt: p.alt }))}
                columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              />
            </DeferUntilVisible>
          </div>
        </section>

        {/* COMPLETION MY76 */}
        <section id="dostavba" className="border-y border-[var(--color-line)] bg-[var(--color-paper-deep)]">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <FadeIn>
              <SectionHead eyebrow="Dostavba" title={property.completion.headline} />
            </FadeIn>
            <FadeIn delay={100} className="space-y-4 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
              {property.completion.text.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <p>
                Realizace:{" "}
                <a href={property.completion.teamUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  {property.completion.team}
                </a>
                {" · "}
                partnerství s{" "}
                <a href={property.completion.partnerUrl} className="underline underline-offset-2" target="_blank" rel="noreferrer">
                  {property.completion.partner}
                </a>
                . Architektura studie: {property.architecture.studio}.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* LOCATION / GEO */}
        <section id="lokalita" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHead
                eyebrow="Lokalita · GEO"
                title={`${property.location.addressLine} · hráz Pilského rybníka`}
                lead={property.location.vicinity}
              />
              <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
                Hledání podle místa:{" "}
                <a className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline" href="/places.json">
                  places.json
                </a>
                {" — "}
                {property.location.places
                  .slice(0, 5)
                  .map((p) => p.name)
                  .join(" · ")}
                …
              </p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Místa pro hledání">
                {property.location.places.map((p) => (
                  <li
                    key={p.name}
                    className="border border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper)_80%,white)] px-2.5 py-1 text-xs text-[var(--color-ink-soft)]"
                  >
                    {p.name}
                    {p.distanceKm ? ` · ${p.distanceKm} km` : ""}
                  </li>
                ))}
              </ul>
              <dl className="mt-8 grid grid-cols-3 gap-4">
                {property.location.distances.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{d.label}</dt>
                    <dd className="mt-1 font-display text-2xl">{d.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-8 space-y-2 text-[var(--color-ink-soft)]">
                {property.location.nearby.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-moss)]" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-[var(--color-ink-soft)]">{property.location.parcel}</p>
            </FadeIn>
            <DeferUntilVisible
              className="relative min-h-[320px] overflow-hidden bg-[var(--color-paper-deep)] lg:min-h-full"
              minHeight={320}
              label="Načítám lokalitu…"
            >
              <div className="relative min-h-[320px] h-full w-full lg:absolute lg:inset-0">
                <Image
                  src="/galerie/02.jpg"
                  alt="Krajina kolem usedlosti a Pilského rybníka"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={70}
                  loading="lazy"
                  className="object-cover"
                />
              </div>
            </DeferUntilVisible>
          </div>
          <FadeIn delay={80} className="mt-12 space-y-4 text-base leading-relaxed text-[var(--color-ink-soft)] sm:text-lg">
            {property.search.geoBody.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </FadeIn>
        </section>

        {/* SEO / AIO searchable copy */}
        <section id="prodej" className="border-y border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper)_55%,white)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHead
                eyebrow="Shrnutí nabídky"
                title="Prodej domu Vodice 17 u Tábora — fakta na jednom místě"
                lead={property.search.aioSummary}
              />
            </FadeIn>
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <FadeIn delay={60} className="space-y-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
                <h3 className="font-display text-2xl text-[var(--color-ink)]">Proč Usedlost Vodice</h3>
                {property.search.seoBody.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </FadeIn>
              <FadeIn delay={120}>
                <h3 className="font-display text-2xl text-[var(--color-ink)]">Klíčová fakta pro AI a mapy</h3>
                <ul className="mt-4 space-y-3 text-[var(--color-ink-soft)]">
                  {property.search.aioBullets.map((b) => (
                    <li key={b} className="flex gap-3 border-b border-[var(--color-line)] pb-3 last:border-0">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-moss)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
                  Související vyhledávání:{" "}
                  {property.search.keywords.slice(0, 6).join(" · ")}.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* MAP */}
        <section id="mapa" className="border-y border-[var(--color-line)] bg-[var(--color-paper)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHead
                eyebrow="Mapa"
                title="Kde se dům nachází"
                lead={`${property.location.vicinity} ${property.location.parcel}.`}
              />
            </FadeIn>
            <FadeIn delay={80} className="mt-8 overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-paper-deep)]">
              <div className="relative aspect-[16/10] w-full sm:aspect-[21/9]">
                <iframe
                  title={`Mapa — ${property.brand}, ${property.location.addressLine}, Pilský rybník`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.geo.lng - 0.012}%2C${property.location.geo.lat - 0.008}%2C${property.location.geo.lng + 0.012}%2C${property.location.geo.lat + 0.008}&layer=mapnik&marker=${property.location.geo.lat}%2C${property.location.geo.lng}`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </FadeIn>
            <FadeIn delay={120} className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--color-ink-soft)]">
              <p>
                {property.location.addressLine} · Pilský rybník · {property.location.region}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${property.location.geo.lat}&mlon=${property.location.geo.lng}#map=16/${property.location.geo.lat}/${property.location.geo.lng}`}
                className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Otevřít v OpenStreetMap
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location.addressLine)}`}
                className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Otevřít v Google Maps
              </a>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-[color-mix(in_oklab,var(--color-moss)_8%,var(--color-paper))] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHead
                eyebrow="Časté otázky"
                title="Co se lidé ptají před prohlídkou"
                lead="Odpovědi jsou i ve strojově čitelném JSON a llms.txt — pro AI vyhledávání podobných nemovitostí."
              />
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-ink-soft)]">
                <a className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline" href="/faq.json">
                  faq.json
                </a>
                <a className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline" href="/property.json">
                  property.json
                </a>
                <a className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline" href="/places.json">
                  places.json
                </a>
                <a className="font-medium text-[var(--color-moss)] underline-offset-2 hover:underline" href="/llms.txt">
                  llms.txt
                </a>
              </p>
            </FadeIn>
            <FaqAccordion items={property.faqs} />
          </div>
        </section>

        {/* CONTACT */}
        <section id="kontakt" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <FadeIn>
              <SectionHead
                eyebrow="Kontakt"
                title="Prohlídka rozhodne"
                lead="Kvalitu a rozsah investice nejlépe posoudíte na místě. Napište nebo zavolejte Michalovi, nebo Jiřímu Loskotovi."
              />
              <div className="mt-8 grid gap-8 text-sm sm:grid-cols-2 sm:gap-6 sm:text-base lg:grid-cols-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">Majitel</p>
                  <p className="mt-1 font-display text-2xl">{property.contact.ownerName}</p>
                  <p className="text-[var(--color-ink-soft)]">{property.contact.ownerNote}</p>
                  <p className="mt-2">
                    <a className="underline underline-offset-2" href={`mailto:${property.contact.ownerEmail}`}>
                      {property.contact.ownerEmail}
                    </a>
                  </p>
                  <p>
                    <a className="underline underline-offset-2" href={`tel:${property.contact.ownerPhone.replace(/\s/g, "")}`}>
                      {property.contact.ownerPhone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">Kontakt</p>
                  <p className="mt-1 font-display text-2xl">{property.contact.agentName}</p>
                  <p className="text-[var(--color-ink-soft)]">{property.contact.agentNote}</p>
                  <p className="mt-2">
                    <a className="underline underline-offset-2" href={`mailto:${property.contact.agentEmail}`}>
                      {property.contact.agentEmail}
                    </a>
                  </p>
                  <p>
                    <a className="underline underline-offset-2" href={`tel:${property.contact.agentPhone.replace(/\s/g, "")}`}>
                      {property.contact.agentPhone}
                    </a>
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={100} className="rounded-sm border border-[var(--color-line)] bg-white/50 p-5 sm:p-8">
              <InquiryForm />
            </FadeIn>
          </div>
        </section>
      </div>
    </main>
  );
}
