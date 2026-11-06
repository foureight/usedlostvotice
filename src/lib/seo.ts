import type { SiteContent } from "@/lib/content-types";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://usedlostvodice.cz"
);

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const defaultOgImage = absoluteUrl("/og.jpg");

export function realEstateJsonLd(property: SiteContent) {
  const { location, specs, contact, architecture, completion, search, gallery } = property;
  const galleryImages = gallery.slice(0, 4).map((g) => absoluteUrl(g.src));
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
        alternateName: "Usedlost Vodice 17 — okres Tábor",
        description: search.seoDescription,
        disambiguatingDescription:
          "Prodej domu ve Vodicích u Tábora (čp. 17, Pilský rybník). Ne Vodice u Lhenic / památka čp. 25.",
        url: siteUrl,
        datePosted: "2026-04-01",
        keywords: search.keywords.join(", "),
        image: [absoluteUrl("/og.jpg"), ...galleryImages],
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
        identifier: [
          { "@type": "PropertyValue", name: "houseNumber", value: `Vodice ${location.houseNumber}` },
          { "@type": "PropertyValue", name: "cadastral", value: location.cadastral },
          { "@type": "PropertyValue", name: "parcel", value: location.parcel },
        ],
        sameAs: [property.listingUrl, absoluteUrl("/property.json"), absoluteUrl("/llms.txt")],
        subjectOf: [
          { "@type": "WebPage", url: absoluteUrl("/faq.json"), name: "FAQ JSON" },
          { "@type": "WebPage", url: absoluteUrl("/property.json"), name: "Property JSON" },
          { "@type": "WebPage", url: absoluteUrl("/places.json"), name: "Places JSON — hledání podle místa" },
          { "@type": "WebPage", url: absoluteUrl("/llms.txt"), name: "llms.txt" },
          { "@type": "WebPage", url: absoluteUrl("/prodej-domu-tabor"), name: "Prodej domu Tábor" },
          { "@type": "WebPage", url: absoluteUrl("/prodej-domu-jizni-cechy"), name: "Prodej domu Jižní Čechy" },
          { "@type": "WebPage", url: absoluteUrl("/dum-u-rybnika"), name: "Dům u rybníka" },
          { "@type": "WebPage", url: absoluteUrl("/dum-se-stodolou"), name: "Dům se stodolou" },
          { "@type": "WebPage", url: absoluteUrl("/dum-k-rekonstrukci-taborsko"), name: "Dům k rekonstrukci Táborsko" },
          { "@type": "WebPage", url: absoluteUrl("/prodej-domu-pacov"), name: "Prodej domu Pacov" },
        ],
      },
      {
        "@type": ["House", "SingleFamilyResidence"],
        "@id": `${siteUrl}/#residence`,
        name: property.title,
        alternateName: [
          "Usedlost Vodice 17",
          "Dům Vodice u Tábora u Pilského rybníka",
          "Prodej domu okres Tábor Vodice 17",
          "Prodej domu Tábor Vodice 17",
          "Dům u Pilského rybníka Vodice",
        ],
        description: search.aioSummary,
        disambiguatingDescription:
          "Prodej domu čp. 17 v obci Vodice u Tábora (okres Tábor). Ne Vodice u Lhenic na Prachaticku a ne památková usedlost čp. 25.",
        url: siteUrl,
        identifier: `CZ-Vodice-${location.houseNumber}-${location.postalCode}`,
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
          addressLocality: "Vodice u Tábora",
          postalCode: location.postalCode,
          addressRegion: location.district,
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
        alternateName: ["Vodice 17 u Tábora", "Usedlost u Pilského rybníka"],
        description: search.geoBody.join(" "),
        disambiguatingDescription:
          "Okres Tábor / KÚ Vodice u Tábora. Není to Vodice u Lhenic (Prachaticko) ani památkové usedlosti čp. 25, 1 nebo 20.",
        address: {
          "@type": "PostalAddress",
          streetAddress: `Vodice ${location.houseNumber}`,
          addressLocality: "Vodice u Tábora",
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
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "notToBeConfusedWith",
            value: "Vodice u Lhenic (Prachaticko); památková usedlost čp. 25",
          },
          ...location.places.map((p) => ({
            "@type": "PropertyValue",
            name: "searchablePlace",
            value: p.name,
            description: `${p.kind}; ${p.relation}${p.distanceKm ? `; ${p.distanceKm} km` : ""}; aliases: ${p.aliases.join(", ")}`,
          })),
        ],
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
            name: "Prodej domu Vodice 17 u Tábora",
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
