import { collection, config, fields, singleton } from "@keystatic/core";

const textList = (label: string) =>
  fields.array(fields.text({ label: "Text" }), {
    label,
    itemLabel: (props) => props.value || "Položka",
  });

const faqItem = fields.object({
  q: fields.text({ label: "Otázka", validation: { isRequired: true } }),
  a: fields.text({ label: "Odpověď", multiline: true, validation: { isRequired: true } }),
});

const highlightItem = fields.object({
  title: fields.text({ label: "Název", validation: { isRequired: true } }),
  text: fields.text({ label: "Text", multiline: true, validation: { isRequired: true } }),
});

const distanceItem = fields.object({
  label: fields.text({ label: "Místo", validation: { isRequired: true } }),
  value: fields.text({ label: "Vzdálenost", validation: { isRequired: true } }),
});

const placeItem = fields.object({
  name: fields.text({ label: "Název", validation: { isRequired: true } }),
  aliases: textList("Aliasy"),
  kind: fields.select({
    label: "Typ",
    options: [
      { label: "Obec", value: "village" },
      { label: "Město", value: "town" },
      { label: "Velkoměsto", value: "city" },
      { label: "Landmark", value: "landmark" },
      { label: "Přírodní park", value: "nature_park" },
      { label: "Okres", value: "district" },
      { label: "Kraj", value: "region" },
    ],
    defaultValue: "village",
  }),
  relation: fields.select({
    label: "Vztah k nabídce",
    options: [
      { label: "Přesně zde", value: "exact" },
      { label: "Na místě", value: "on" },
      { label: "Na hranici", value: "border" },
      { label: "Obsahuje", value: "contains" },
      { label: "Blízko", value: "near" },
      { label: "Dojezd", value: "commute" },
    ],
    defaultValue: "exact",
  }),
  distanceKm: fields.number({ label: "Vzdálenost (km)", defaultValue: 0 }),
  queries: textList("Ukázkové dotazy"),
});

/**
 * Image field rooted in a flat public subfolder so Keystatic can show
 * thumbnails (nested paths under `public/` do not preview reliably).
 * Stored value stays a public URL, e.g. `/galerie/01.jpg`.
 */
const mediaImage = (folder: string, label = "Fotka") =>
  fields.image({
    label,
    directory: `public/${folder}`,
    publicPath: `/${folder}/`,
    // Optional so admin Save works when a blob failed to hydrate from disk.
    validation: { isRequired: false },
  });

type ImageFieldValue = { filename?: string } | string | null | undefined;

/** Encode public path into itemLabel so AdminListThumbs can show a row thumbnail. */
const mediaItemLabel =
  (folder: string, textField: "alt" | "label" = "alt") =>
  (props: { fields: Record<string, { value?: unknown }> }) => {
    const text =
      String(props.fields[textField]?.value ?? "").trim() ||
      (textField === "label" ? "Půdorys" : "Foto");
    const raw = props.fields.src?.value as ImageFieldValue;
    const filename =
      typeof raw === "string"
        ? raw
        : raw && typeof raw === "object"
          ? raw.filename
          : undefined;
    if (!filename) return text;
    // Normalize legacy /stav/* into the Keystatic gallery folder.
    const normalized = filename.startsWith("/stav/")
      ? `/galerie/${filename.slice("/stav/".length)}`
      : filename;
    const src = normalized.startsWith("/")
      ? normalized
      : `/${folder}/${normalized.replace(/^\//, "")}`;
    return `${text} «${src}»`;
  };

const galleryItem = fields.object({
  src: mediaImage("galerie", "Fotka"),
  alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
  kind: fields.select({
    label: "Typ",
    options: [
      { label: "Exteriér", value: "exterier" },
      { label: "Interiér", value: "interier" },
      { label: "Stav", value: "stav" },
    ],
    defaultValue: "exterier",
  }),
});

const photoVisionItem = fields.object({
  src: mediaImage("vizualizace-foto", "Fotka"),
  alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
});

const doneVisionItem = fields.object({
  src: mediaImage("vizualizace-dokonceno", "Fotka"),
  alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
});

const studyItem = fields.object({
  src: mediaImage("vizualizace", "Fotka"),
  alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
});

const planItem = fields.object({
  src: mediaImage("pudorysy", "Půdorys"),
  alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
  label: fields.text({ label: "Popisek", validation: { isRequired: true } }),
});

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Usedlost Vodice" },
  },
  collections: {
    inquiries: collection({
      label: "Poptávky",
      slugField: "title",
      path: "content/inquiries/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: {
            label: "Název záznamu",
            description: "Automaticky z formuláře (jméno + čas).",
          },
        }),
        name: fields.text({ label: "Jméno", validation: { isRequired: true } }),
        email: fields.text({ label: "E-mail", validation: { isRequired: true } }),
        phone: fields.text({ label: "Telefon" }),
        note: fields.text({ label: "Zpráva", multiline: true }),
        createdAt: fields.text({
          label: "Přijato",
          description: "Čas odeslání formuláře (UTC).",
          validation: { isRequired: true },
        }),
        status: fields.select({
          label: "Stav",
          options: [
            { label: "Nová", value: "new" },
            { label: "Kontaktováno", value: "contacted" },
            { label: "Vyřízeno", value: "done" },
            { label: "Spam", value: "spam" },
          ],
          defaultValue: "new",
        }),
        mailed: fields.checkbox({
          label: "E-mail přes SMTP odeslán",
          defaultValue: false,
        }),
      },
    }),
  },
  singletons: {
    site: singleton({
      label: "Celý web",
      path: "content/site",
      format: { data: "json" },
      schema: {
        brand: fields.text({ label: "Brand / název", validation: { isRequired: true } }),
        title: fields.text({ label: "Hlavní titulek", validation: { isRequired: true } }),
        shortTitle: fields.text({ label: "Krátký titulek", validation: { isRequired: true } }),
        price: fields.integer({ label: "Cena (Kč)", validation: { isRequired: true } }),
        priceLabel: fields.text({ label: "Cena (zobrazení)", validation: { isRequired: true } }),
        priceNote: fields.text({ label: "Poznámka k ceně" }),
        listingUrl: fields.url({ label: "URL inzerátu" }),
        listingId: fields.text({ label: "ID inzerátu" }),

        location: fields.object(
          {
            village: fields.text({ label: "Obec", validation: { isRequired: true } }),
            houseNumber: fields.text({ label: "Číslo popisné", defaultValue: "17" }),
            postalCode: fields.text({ label: "PSČ", defaultValue: "391 53" }),
            cadastral: fields.text({ label: "Katastr", validation: { isRequired: true } }),
            parcel: fields.text({ label: "Parcelní číslo", multiline: true }),
            district: fields.text({ label: "Okres", validation: { isRequired: true } }),
            region: fields.text({ label: "Kraj", validation: { isRequired: true } }),
            country: fields.text({ label: "Země", defaultValue: "CZ" }),
            addressLine: fields.text({ label: "Adresa (řádek)", description: "např. Vodice 17, 391 53 Vodice" }),
            vicinity: fields.text({ label: "Popis okolí", multiline: true }),
            distances: fields.array(distanceItem, {
              label: "Vzdálenosti",
              itemLabel: (props) => props.fields.label.value || "Vzdálenost",
            }),
            nearby: textList("V okolí"),
            geoLat: fields.number({ label: "Zeměpisná šířka", validation: { isRequired: true } }),
            geoLng: fields.number({ label: "Zeměpisná délka", validation: { isRequired: true } }),
            places: fields.array(placeItem, {
              label: "Místa pro AI hledání",
              itemLabel: (props) => props.fields.name.value || "Místo",
            }),
          },
          { label: "Lokalita" },
        ),

        specs: fields.object(
          {
            usableArea: fields.integer({ label: "Užitná plocha (m²)" }),
            builtUpHouse: fields.integer({ label: "Zastavěná plocha domu (m²)" }),
            builtUpBarn: fields.integer({ label: "Zastavěná plocha stodoly (m²)" }),
            plotArea: fields.integer({ label: "Pozemek (m²)" }),
            gardenArea: fields.integer({ label: "Zahrada (m²)" }),
            disposition: fields.text({ label: "Dispozice" }),
            floors: fields.integer({ label: "Podlaží" }),
            basementFloors: fields.integer({ label: "Suterénní podlaží" }),
            rooms: fields.integer({ label: "Počet pokojů" }),
            construction: fields.text({ label: "Konstrukce" }),
            condition: fields.text({ label: "Stav", multiline: true }),
            ownership: fields.text({ label: "Vlastnictví" }),
            furnishing: fields.text({ label: "Vybavení" }),
            energy: fields.text({ label: "PENB" }),
            utilities: textList("Sítě"),
          },
          { label: "Parametry" },
        ),

        summary: textList("Úvodní texty"),

        highlights: fields.array(highlightItem, {
          label: "Highlights",
          itemLabel: (props) => props.fields.title.value || "Highlight",
        }),

        architecture: fields.object(
          {
            studio: fields.text({ label: "Studio" }),
            authors: textList("Autoři"),
            studyYear: fields.integer({ label: "Rok studie" }),
            studyTitle: fields.text({ label: "Název studie" }),
            investors: fields.text({ label: "Investoři" }),
            email: fields.text({ label: "E-mail studia" }),
            pdf: fields.text({
              label: "PDF studie (cesta)",
              description: "Veřejná cesta, např. /docs/architektonicka-studie.pdf",
              defaultValue: "/docs/architektonicka-studie.pdf",
            }),
            concept: fields.text({ label: "Koncept", multiline: true }),
          },
          { label: "Architektura" },
        ),

        completion: fields.object(
          {
            team: fields.text({ label: "Realizační tým" }),
            partner: fields.text({ label: "Partner" }),
            teamUrl: fields.url({ label: "URL týmu" }),
            partnerUrl: fields.url({ label: "URL partnera" }),
            headline: fields.text({ label: "Nadpis sekce" }),
            text: textList("Texty sekce"),
          },
          { label: "Dostavba" },
        ),

        contact: fields.object(
          {
            ownerName: fields.text({ label: "Jméno majitele" }),
            ownerNote: fields.text({ label: "Poznámka majitel" }),
            ownerEmail: fields.text({ label: "E-mail majitele" }),
            ownerPhone: fields.text({ label: "Telefon majitele" }),
            agentName: fields.text({ label: "Jméno agenta" }),
            agentNote: fields.text({ label: "Poznámka agent" }),
            agentEmail: fields.text({ label: "E-mail agenta" }),
            agentPhone: fields.text({ label: "Telefon agenta" }),
          },
          { label: "Kontakty" },
        ),

        faqs: fields.array(faqItem, {
          label: "FAQ",
          itemLabel: (props) => props.fields.q.value || "Otázka",
        }),

        gallery: fields.array(galleryItem, {
          label: "Galerie",
          itemLabel: mediaItemLabel("galerie"),
        }),
        visualizationsPhoto: fields.array(photoVisionItem, {
          label: "Fotovize",
          itemLabel: mediaItemLabel("vizualizace-foto"),
        }),
        visualizationsDokonceno: fields.array(doneVisionItem, {
          label: "Vize dokončení",
          itemLabel: mediaItemLabel("vizualizace-dokonceno"),
        }),
        visualizations: fields.array(studyItem, {
          label: "Studie (černobílé)",
          itemLabel: mediaItemLabel("vizualizace"),
        }),
        plans: fields.array(planItem, {
          label: "Půdorysy",
          itemLabel: mediaItemLabel("pudorysy", "label"),
        }),
      },
    }),
    seo: singleton({
      label: "SEO / AI",
      path: "content/seo",
      format: { data: "json" },
      schema: {
        seoTitle: fields.text({ label: "SEO title", validation: { isRequired: true } }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true },
        }),
        keywords: textList("Keywords"),
        seoBody: textList("SEO odstavce (levý sloupec webu)"),
        geoBody: textList("GEO odstavce (lokalita)"),
        aioSummary: fields.text({ label: "AI shrnutí", multiline: true }),
        aioBullets: textList("AI bullet points"),
      },
    }),
    smtp: singleton({
      label: "E-mail / SMTP",
      path: "content/smtp",
      format: { data: "json" },
      schema: {
        enabled: fields.checkbox({
          label: "Odesílání e-mailů zapnuto",
          defaultValue: false,
        }),
        host: fields.text({ label: "SMTP host (např. smtp.gmail.com)" }),
        port: fields.integer({ label: "SMTP port", defaultValue: 587 }),
        secure: fields.checkbox({
          label: "TLS/SSL (secure) — typicky zapnout u portu 465",
          defaultValue: false,
        }),
        user: fields.text({ label: "SMTP uživatel" }),
        password: fields.text({ label: "SMTP heslo / app password" }),
        fromEmail: fields.text({ label: "Odesílatel (From e-mail)" }),
        fromName: fields.text({ label: "Odesílatel (jméno)", defaultValue: "Usedlost Vodice" }),
        toEmail: fields.text({
          label: "Příjemce poptávek (To)",
          description: "Kam chodí poptávky z formuláře. Více adres oddělte čárkou.",
        }),
        ccEmail: fields.text({
          label: "Kopie (Cc)",
          description: "Volitelné. Více adres oddělte čárkou.",
        }),
        subjectPrefix: fields.text({
          label: "Prefix předmětu",
          defaultValue: "[Usedlost Vodice]",
        }),
      },
    }),
  },
});
