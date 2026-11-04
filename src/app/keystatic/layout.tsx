import type { Metadata } from "next";
import { AdminListThumbs } from "./admin-list-thumbs";
import KeystaticApp from "./keystatic";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrace | Usedlost Vodice",
  robots: { index: false, follow: false },
};

export default async function Layout() {
  const content = await getContent();
  const thumbs = [
    ...content.gallery.map((g) => ({ alt: g.alt, src: g.src })),
    ...content.visualizationsPhoto.map((g) => ({ alt: g.alt, src: g.src })),
    ...content.visualizationsDokonceno.map((g) => ({ alt: g.alt, src: g.src })),
    ...content.visualizations.map((g) => ({ alt: g.alt, src: g.src })),
    ...content.plans.map((g) => ({ alt: g.alt || g.label, src: g.src })),
  ].filter((t) => t.src && t.alt);

  return (
    <>
      <AdminListThumbs thumbs={thumbs} />
      <KeystaticApp />
    </>
  );
}
