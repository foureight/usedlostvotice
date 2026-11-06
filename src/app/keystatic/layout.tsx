import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminMediaChrome } from "./admin-media-chrome";
import { RepairBanner } from "./repair-banner";
import KeystaticApp from "./keystatic";
import { getContent } from "@/lib/content";
import { repairSiteJson } from "@/lib/repair-site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrace | Usedlost Vodice",
  robots: { index: false, follow: false },
};

function isGithubMode() {
  const id = (process.env.KEYSTATIC_GITHUB_CLIENT_ID || "").trim();
  // Zerops may leave unresolved `${VAR}` placeholders — treat those as unset.
  if (!id || id.includes("${") || id === "undefined") return false;
  return true;
}

export default async function Layout() {
  // GitHub mode = přihlášení přes GitHub App (Keystatic).
  // Bez GitHub env zůstaneme u hesla na /admin.
  if (!isGithubMode() && !(await isAdminAuthenticated())) {
    redirect("/admin");
  }

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
  ].filter((t) => t.src);

  const albums = [
    {
      id: "gallery",
      label: "Galerie",
      items: content.gallery.map((g) => ({ src: g.src, alt: g.alt })),
    },
    {
      id: "visualizationsPhoto",
      label: "Fotovize",
      items: content.visualizationsPhoto.map((g) => ({ src: g.src, alt: g.alt })),
    },
    {
      id: "visualizationsDokonceno",
      label: "Vize dokončení",
      items: content.visualizationsDokonceno.map((g) => ({ src: g.src, alt: g.alt })),
    },
    {
      id: "visualizations",
      label: "Studie (černobílé)",
      items: content.visualizations.map((g) => ({ src: g.src, alt: g.alt })),
    },
    {
      id: "plans",
      label: "Půdorysy",
      items: content.plans.map((g) => ({ src: g.src, alt: g.alt || g.label })),
    },
  ];

  if (isGithubMode()) {
    return <KeystaticApp />;
  }

  return (
    <>
      <RepairBanner initialNote={repairNote} />
      <AdminMediaChrome thumbs={thumbs} albums={albums} />
      <KeystaticApp />
    </>
  );
}
