import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { absoluteUrl, defaultOgImage, realEstateJsonLd, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const property = await getContent();
  const description = property.search.seoDescription;

  return {
    title: {
      default: property.search.seoTitle,
      template: `%s | ${property.brand}`,
    },
    description,
    keywords: [...property.search.keywords],
    authors: [{ name: property.contact.ownerName }],
    alternates: {
      canonical: "/",
      types: {
        "application/json": [
          { url: "/property.json", title: "Property listing JSON" },
          { url: "/faq.json", title: "FAQ JSON" },
          { url: "/places.json", title: "Places / geo search JSON" },
        ],
        "text/plain": [
          { url: "/llms.txt", title: "llms.txt" },
          { url: "/llms-full.txt", title: "llms-full.txt" },
        ],
      },
    },
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url: siteUrl,
      siteName: property.brand,
      title: property.search.seoTitle,
      description,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: property.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: property.search.seoTitle,
      description,
      images: [defaultOgImage],
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    icons: {
      icon: [{ url: "/favicon-32.png", sizes: "32x32" }],
      apple: [{ url: "/icon-192.png", sizes: "192x192" }],
    },
    other: {
      "geo.region": "CZ-JC",
      "geo.placename": "Vodice 17, Pilský rybník",
      "geo.position": `${property.location.geo.lat};${property.location.geo.lng}`,
      ICBM: `${property.location.geo.lat}, ${property.location.geo.lng}`,
      "llms-txt": absoluteUrl("/llms.txt"),
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const property = await getContent();
  const showGalerie = property.gallery.length > 0;
  const showVize =
    property.visualizationsPhoto.length > 0 ||
    property.visualizationsDokonceno.length > 0 ||
    property.visualizations.length > 0 ||
    property.plans.length > 0;

  return (
    <>
      <JsonLd data={realEstateJsonLd(property)} />
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2"
      >
        Přeskočit na obsah
      </a>
      <SiteHeader
        brand={property.brand}
        showGalerie={showGalerie}
        showVize={showVize}
      />
      {children}
      <footer className="border-t border-[var(--color-line)] bg-[var(--color-moss-deep)] text-[var(--color-paper)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              Samostatná prezentace prodeje domu
            </p>
            <p className="mt-2 font-display text-2xl">{property.brand}</p>
            <p className="mt-2 max-w-md text-white/75">
              Jedna nemovitost · Vodice u Tábora · {property.priceLabel}. Samostatná prezentace
              prodeje — majitel a kontakt Bio Reality.
            </p>
          </div>
          <div className="space-y-1 text-white/70">
            <p>
              {property.contact.ownerName}:{" "}
              <a
                className="underline-offset-2 hover:underline"
                href={`mailto:${property.contact.ownerEmail}`}
              >
                {property.contact.ownerEmail}
              </a>
              {" · "}
              <a
                className="underline-offset-2 hover:underline"
                href={`tel:${property.contact.ownerPhone.replace(/\s/g, "")}`}
              >
                {property.contact.ownerPhone}
              </a>
            </p>
            <p>
              {property.contact.agentName}:{" "}
              <a
                className="underline-offset-2 hover:underline"
                href={`mailto:${property.contact.agentEmail}`}
              >
                {property.contact.agentEmail}
              </a>
              {" · "}
              <a
                className="underline-offset-2 hover:underline"
                href={`tel:${property.contact.agentPhone.replace(/\s/g, "")}`}
              >
                {property.contact.agentPhone}
              </a>
            </p>
            <p>
              <a
                className="underline-offset-2 hover:underline"
                href={property.listingUrl}
                target="_blank"
                rel="noreferrer"
              >
                Inzerát iDNES
              </a>
            </p>
            <p>
              © {new Date().getFullYear()} {property.contact.ownerName}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
