import { existsSync } from "fs";
import path from "path";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import type { SiteContent } from "@/lib/content-types";

export type { SiteContent } from "@/lib/content-types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => asString(item)) : [];
}

/** Keystatic may store filename only, a public path, or a { filename } object. */
function resolveMediaSrc(value: unknown, folder: string): string {
  let raw = "";
  if (typeof value === "string") raw = value.trim();
  else if (value && typeof value === "object") {
    const rec = value as UnknownRecord;
    raw = asString(rec.filename || rec.src || rec.path).trim();
  }
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
    // Legacy stav images lived under /stav/; Keystatic gallery field is rooted in /galerie/.
    if (raw.startsWith("/stav/")) return `/galerie/${raw.slice("/stav/".length)}`;
    return raw;
  }
  return `/${folder}/${raw.replace(/^\.?\//, "")}`;
}

/** Drop CMS entries whose public file is missing (avoids broken thumbnails). */
function publicMediaExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  if (src.startsWith("http://") || src.startsWith("https://")) return true;
  return existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")));
}

function normalizeSearch(search: UnknownRecord) {
  return {
    seoTitle: asString(search.seoTitle),
    seoDescription: asString(search.seoDescription),
    keywords: asStringArray(search.keywords),
    seoBody: asStringArray(search.seoBody),
    geoBody: asStringArray(search.geoBody),
    aioSummary: asString(search.aioSummary),
    aioBullets: asStringArray(search.aioBullets),
  };
}

function normalizeSite(site: UnknownRecord, seo: UnknownRecord = {}): SiteContent {
  const location = asRecord(site.location);
  const specs = asRecord(site.specs);
  // SEO lives in content/seo.json (Keystatic singleton), with legacy fallback on site.search.
  const search = Object.keys(seo).length ? seo : asRecord(site.search);
  const architecture = asRecord(site.architecture);
  const completion = asRecord(site.completion);
  const contact = asRecord(site.contact);

  return {
    brand: asString(site.brand),
    title: asString(site.title),
    shortTitle: asString(site.shortTitle),
    price: asNumber(site.price),
    priceLabel: asString(site.priceLabel),
    priceNote: asString(site.priceNote),
    listingUrl: asString(site.listingUrl),
    listingId: asString(site.listingId),
    location: {
      village: asString(location.village),
      houseNumber: asString(location.houseNumber),
      postalCode: asString(location.postalCode),
      cadastral: asString(location.cadastral),
      parcel: asString(location.parcel),
      district: asString(location.district),
      region: asString(location.region),
      country: asString(location.country, "CZ"),
      addressLine: asString(location.addressLine),
      vicinity: asString(location.vicinity),
      distances: (Array.isArray(location.distances) ? location.distances : []).map((item) => {
        const d = asRecord(item);
        return { label: asString(d.label), value: asString(d.value) };
      }),
      nearby: asStringArray(location.nearby),
      geo: {
        lat: asNumber(location.geoLat),
        lng: asNumber(location.geoLng),
      },
      places: (Array.isArray(location.places) ? location.places : []).map((item) => {
        const p = asRecord(item);
        return {
          name: asString(p.name),
          aliases: asStringArray(p.aliases),
          kind: asString(p.kind),
          relation: asString(p.relation),
          distanceKm: asNumber(p.distanceKm),
          queries: asStringArray(p.queries),
        };
      }),
    },
    specs: {
      usableArea: asNumber(specs.usableArea),
      builtUpHouse: asNumber(specs.builtUpHouse),
      builtUpBarn: asNumber(specs.builtUpBarn),
      plotArea: asNumber(specs.plotArea),
      gardenArea: asNumber(specs.gardenArea),
      disposition: asString(specs.disposition),
      floors: asNumber(specs.floors),
      basementFloors: asNumber(specs.basementFloors),
      rooms: asNumber(specs.rooms),
      construction: asString(specs.construction),
      condition: asString(specs.condition),
      ownership: asString(specs.ownership),
      furnishing: asString(specs.furnishing),
      energy: asString(specs.energy),
      utilities: asStringArray(specs.utilities),
    },
    summary: asStringArray(site.summary),
    search: normalizeSearch(search),
    highlights: (Array.isArray(site.highlights) ? site.highlights : []).map((item) => {
      const h = asRecord(item);
      return { title: asString(h.title), text: asString(h.text) };
    }),
    architecture: {
      studio: asString(architecture.studio),
      authors: asStringArray(architecture.authors),
      studyYear: asNumber(architecture.studyYear),
      studyTitle: asString(architecture.studyTitle),
      investors: asString(architecture.investors),
      email: asString(architecture.email),
      pdf: asString(architecture.pdf),
      concept: asString(architecture.concept),
    },
    completion: {
      team: asString(completion.team),
      partner: asString(completion.partner),
      teamUrl: asString(completion.teamUrl),
      partnerUrl: asString(completion.partnerUrl),
      headline: asString(completion.headline),
      text: asStringArray(completion.text),
    },
    contact: {
      ownerName: asString(contact.ownerName),
      ownerNote: asString(contact.ownerNote),
      ownerEmail: asString(contact.ownerEmail),
      ownerPhone: asString(contact.ownerPhone),
      agentName: asString(contact.agentName),
      agentNote: asString(contact.agentNote),
      agentEmail: asString(contact.agentEmail),
      agentPhone: asString(contact.agentPhone),
    },
    faqs: (Array.isArray(site.faqs) ? site.faqs : []).map((item) => {
      const f = asRecord(item);
      return { q: asString(f.q), a: asString(f.a) };
    }),
    gallery: (Array.isArray(site.gallery) ? site.gallery : [])
      .map((item) => {
        const g = asRecord(item);
        const kind = asString(g.kind, "exterier");
        const src = resolveMediaSrc(g.src, "galerie");
        if (!src || !publicMediaExists(src)) return null;
        return {
          src,
          alt: asString(g.alt),
          kind: (kind === "interier" || kind === "stav" ? kind : "exterier") as
            | "exterier"
            | "interier"
            | "stav",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    visualizationsPhoto: (Array.isArray(site.visualizationsPhoto) ? site.visualizationsPhoto : [])
      .map((item) => {
        const g = asRecord(item);
        const src = resolveMediaSrc(g.src, "vizualizace-foto");
        if (!src || !publicMediaExists(src)) return null;
        return { src, alt: asString(g.alt) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    visualizationsDokonceno: (
      Array.isArray(site.visualizationsDokonceno) ? site.visualizationsDokonceno : []
    )
      .map((item) => {
        const g = asRecord(item);
        const src = resolveMediaSrc(g.src, "vizualizace-dokonceno");
        if (!src || !publicMediaExists(src)) return null;
        return { src, alt: asString(g.alt) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    visualizations: (Array.isArray(site.visualizations) ? site.visualizations : [])
      .map((item) => {
        const g = asRecord(item);
        const src = resolveMediaSrc(g.src, "vizualizace");
        if (!src || !publicMediaExists(src)) return null;
        return { src, alt: asString(g.alt) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    plans: (Array.isArray(site.plans) ? site.plans : [])
      .map((item) => {
        const g = asRecord(item);
        const src = resolveMediaSrc(g.src, "pudorysy");
        if (!src || !publicMediaExists(src)) return null;
        return { src, alt: asString(g.alt), label: asString(g.label) };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

export async function getContent(): Promise<SiteContent> {
  const reader = createReader(process.cwd(), keystaticConfig);
  const site = await reader.singletons.site.read();
  if (!site) {
    throw new Error("Chybí content/site.json — otevřete /keystatic a uložte obsah.");
  }
  const seo = (await reader.singletons.seo.read()) as UnknownRecord | null;
  return normalizeSite(site as UnknownRecord, seo ?? {});
}

export async function getProperty() {
  const content = await getContent();
  const {
    gallery,
    visualizationsPhoto,
    visualizationsDokonceno,
    visualizations,
    plans,
    ...property
  } = content;
  return {
    property,
    gallery,
    visualizationsPhoto,
    visualizationsDokonceno,
    visualizations,
    plans,
  };
}
