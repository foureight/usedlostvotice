import type { ReactNode } from "react";

const DEFAULT_STUDIO = "Dílna architektury";
const DEFAULT_STUDIO_URL = "https://www.dilnaarchitektury.cz";
const DEFAULT_TEAM_URL = "https://www.my76.cz/";
const DEFAULT_PARTNER_URL = "https://www.ateliersad.cz/";

/** Longer phrases first so “Atelierem SAD” wins over shorter tokens. */
const PARTNER_PATTERN =
  /(Dílny architektury|Dílna architektury|Atelierem SAD|Atelier SAD|MY76)/g;

const DEFAULT_CLASS =
  "underline underline-offset-2 hover:text-[var(--color-moss)]";

export type PartnerLinkUrls = {
  studioUrl?: string;
  teamUrl?: string;
  partnerUrl?: string;
};

export function ArchitectureStudioLink({
  label = DEFAULT_STUDIO,
  href = DEFAULT_STUDIO_URL,
  className = DEFAULT_CLASS,
}: {
  label?: string;
  href?: string;
  className?: string;
}) {
  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {label}
    </a>
  );
}

function hrefForMatch(match: string, urls: PartnerLinkUrls): string | null {
  switch (match) {
    case "Dílna architektury":
    case "Dílny architektury":
      return urls.studioUrl || DEFAULT_STUDIO_URL;
    case "MY76":
      return urls.teamUrl || DEFAULT_TEAM_URL;
    case "Atelier SAD":
    case "Atelierem SAD":
      return urls.partnerUrl || DEFAULT_PARTNER_URL;
    default:
      return null;
  }
}

/** Linkify Dílna architektury, MY76 and Atelier SAD (incl. Czech inflections). */
export function linkifyArchitecture(
  text: string,
  studioOrUrls: string | PartnerLinkUrls = DEFAULT_STUDIO_URL,
  className = DEFAULT_CLASS,
): ReactNode {
  const urls: PartnerLinkUrls =
    typeof studioOrUrls === "string"
      ? { studioUrl: studioOrUrls }
      : studioOrUrls;

  const parts = text.split(PARTNER_PATTERN);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const href = hrefForMatch(part, urls);
    if (href) {
      return (
        <a
          key={`${part}-${i}`}
          href={href}
          className={className}
          target="_blank"
          rel="noreferrer"
        >
          {part}
        </a>
      );
    }
    return <span key={`t-${i}`}>{part}</span>;
  });
}

export function partnerUrlsFromProperty(property: {
  architecture: { studioUrl: string };
  completion: { teamUrl: string; partnerUrl: string };
}): PartnerLinkUrls {
  return {
    studioUrl: property.architecture.studioUrl,
    teamUrl: property.completion.teamUrl,
    partnerUrl: property.completion.partnerUrl,
  };
}
