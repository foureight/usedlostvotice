import { property } from "@/data/property";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://usedlostvodice.cz"
);

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const defaultOgImage = absoluteUrl("/og.jpg");

export function realEstateJsonLd() {
  const { location, specs, contact, architecture, completion, search } = property;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: property.brand,
        description: search.seoDescription,
        inLanguage: "cs-CZ",
        about: { "@id": `${siteUrl}/#listing` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#prodej", "#faq", "h1"],
        },
      },
      {
        "@type": "RealEstateListing",
        "@id": `${siteUrl}/#listing`,
        name: search.seoTitle,
        description: search.seoDescription,
        url: siteUrl,
        datePosted: "2026-04-01",
        keywords: search.keywords.join(", "),
        image: [
          absoluteUrl("/og.jpg"),
          absoluteUrl("/galerie/01.jpg"),
          absoluteUrl("/galerie/06.jpg"),
          absoluteUrl("/vizualizace-foto/04-krajina.jpg"),
        ],
        offers: {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "CZK",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: siteUrl,
          seller: {
            "@type": "Person",
            name: contact.ownerName,
            email: contact.ownerEmail,
            telephone: contact.ownerPhone,
          },
        },
        mainEntity: { "@id": `${siteUrl}/#residence` },
        subjectOf: [
          { "@type": "WebPage", url: absoluteUrl("/faq.json"), name: "FAQ JSON" },
          { "@type": "WebPage", url: absoluteUrl("/property.json"), name: "Property JSON" },
          { "@type": "WebPage", url: absoluteUrl("/places.json"), name: "Places JSON — hledání podle místa" },
          { "@type": "WebPage", url: absoluteUrl("/llms.txt"), name: "llms.txt" },
        ],
      },
      {
        "@type": ["House", "SingleFamilyResidence"],
        "@id": `${siteUrl}/#residence`,
        name: property.title,
        description: search.aioSummary,
        url: siteUrl,
        numberOfRooms: specs.rooms,
        numberOfBathroomsTotal: 1,
        floorSize: {
          "@type": "QuantitativeValue",
          value: specs.usableArea,
          unitCode: "MTK",
        },
        yearBuilt: architecture.studyYear,
        address: {
          "@type": "PostalAddress",
          streetAddress: `Vodice ${location.houseNumber}`,
          addressLocality: location.village,
          postalCode: location.postalCode,
          addressRegion: location.region,
          addressCountry: location.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.geo.lat,
          longitude: location.geo.lng,
        },
        accommodationCategory: "House",
        petsAllowed: true,
      },
      {
        "@type": "Place",
        "@id": `${siteUrl}/#place`,
        name: `${property.brand}, ${location.addressLine}`,
        description: search.geoBody.join(" "),
        address: {
          "@type": "PostalAddress",
          streetAddress: `Vodice ${location.houseNumber}`,
          addressLocality: location.village,
          postalCode: location.postalCode,
          addressRegion: location.district,
          addressCountry: location.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.geo.lat,
          longitude: location.geo.lng,
        },
        containedInPlace: [
          {
            "@type": "AdministrativeArea",
            name: "Přírodní park Polánka",
          },
          {
            "@type": "AdministrativeArea",
            name: "okres Tábor",
          },
          {
            "@type": "AdministrativeArea",
            name: "Jihočeský kraj",
          },
        ],
        additionalProperty: location.places.map((p) => ({
          "@type": "PropertyValue",
          name: "searchablePlace",
          value: p.name,
          description: `${p.kind}; ${p.relation}${p.distanceKm ? `; ${p.distanceKm} km` : ""}; aliases: ${p.aliases.join(", ")}`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#places`,
        name: "Hledání podle místa",
        url: absoluteUrl("/places.json"),
        numberOfItems: location.places.length,
        itemListElement: location.places.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: absoluteUrl("/#lokalita"),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: property.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Domů",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Prodej domu Vodice u Tábora",
            item: siteUrl,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#builder`,
        name: completion.team,
        url: completion.teamUrl,
        description: `Realizační tým úzce spjatý s ${completion.partner}`,
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#seller`,
        name: contact.ownerName,
        email: contact.ownerEmail,
        telephone: contact.ownerPhone,
        jobTitle: "Majitel nemovitosti",
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#agent`,
        name: contact.agentName,
        email: contact.agentEmail,
        telephone: contact.agentPhone,
        jobTitle: "Kontaktní osoba — Bio Reality",
        worksFor: {
          "@type": "Organization",
          name: "Bio Reality",
        },
      },
    ],
  };
}
