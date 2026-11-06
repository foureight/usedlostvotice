import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoLanding } from "@/components/seo-landing";
import { getLanding, getLandingSlugs } from "@/data/landings";
import { getContent } from "@/lib/content";
import { absoluteUrl, defaultOgImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getLandingSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) return {};
  const property = await getContent();
  const url = absoluteUrl(`/${landing.slug}`);

  return {
    title: { absolute: landing.title },
    description: landing.description,
    keywords: [landing.keyword, ...landing.relatedKeywords, ...property.search.keywords.slice(0, 6)],
    alternates: { canonical: `/${landing.slug}` },
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url,
      siteName: property.brand,
      title: landing.title,
      description: landing.description,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: landing.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: landing.title,
      description: landing.description,
      images: [defaultOgImage],
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export default async function LandingRoute({ params }: Props) {
  const { slug } = await params;
  const landing = getLanding(slug);
  if (!landing) notFound();

  const property = await getContent();
  const hero =
    property.visualizationsPhoto[0] ||
    property.gallery[0] ||
    property.visualizations[0];
  if (!hero?.src) notFound();

  return (
    <SeoLanding
      landing={landing}
      property={property}
      heroSrc={hero.src}
      heroAlt={hero.alt || landing.h1}
    />
  );
}
