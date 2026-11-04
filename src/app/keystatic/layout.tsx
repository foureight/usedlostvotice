import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminListThumbs } from "./admin-list-thumbs";
import { MultiUpload } from "./multi-upload";
import { RepairBanner } from "./repair-banner";
import KeystaticApp from "./keystatic";
import { getContent } from "@/lib/content";
import { repairSiteJson } from "@/lib/repair-site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrace | Usedlost Vodice",
  robots: { index: false, follow: false },
};

export default async function Layout() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  // Drop orphan media / bad URL+PDF values BEFORE Keystatic parses the singleton.
  let repairNote = "";
  try {
    const repaired = await repairSiteJson();
    if (repaired.wrote) {
      const bits = [
        repaired.removed.length ? `odebráno ${repaired.removed.length} chybějících fotek` : "",
        repaired.fixedPdf ? "opraveno PDF" : "",
        repaired.fixedUrls.length
          ? `opraveno URL (${repaired.fixedUrls.join(", ")})`
          : "",
      ].filter(Boolean);
      repairNote = bits.length
        ? `Automatická oprava: ${bits.join(", ")}. Obnovte stránku a zkuste Save.`
        : "";
    }
  } catch (err) {
    console.error("[admin] repairSiteJson failed", err);
  }

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
      <RepairBanner initialNote={repairNote} />
      <MultiUpload />
      <AdminListThumbs thumbs={thumbs} />
      <KeystaticApp />
    </>
  );
}
