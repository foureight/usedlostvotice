import { cp, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { optimizePublicMedia } from "@/lib/optimize-image";
import { repairSiteJson } from "@/lib/repair-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MEDIA_DIRS = [
  "galerie",
  "vizualizace-foto",
  "vizualizace-dokonceno",
  "vizualizace",
  "pudorysy",
];

/**
 * POST /api/admin/repair
 * - Drop missing media + normalize Bad-data fields
 * - Permanently resize oversized originals in public/
 */
export async function POST() {
  try {
    const repaired = await repairSiteJson();
    const optimized = await optimizePublicMedia();

    // Re-run repair after png→jpg renames so missing old paths are dropped if any linger.
    const repairedAfter = optimized.rewrites.length ? await repairSiteJson() : repaired;

    const cms = process.env.CMS_DATA_DIR;
    if (cms && (optimized.touched.length || repairedAfter.wrote)) {
      await mkdir(path.join(cms, "content"), { recursive: true });
      await cp(
        path.join(process.cwd(), "content", "site.json"),
        path.join(cms, "content", "site.json"),
      );
      for (const folder of MEDIA_DIRS) {
        await mkdir(path.join(cms, "public", folder), { recursive: true });
        await cp(
          path.join(process.cwd(), "public", folder),
          path.join(cms, "public", folder),
          { recursive: true },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      ...repairedAfter,
      removedCount: repairedAfter.removed.length,
      optimized: optimized.touched.length,
      rewrites: optimized.rewrites,
    });
  } catch (err) {
    console.error("[repair]", err);
    return NextResponse.json({ error: "repair failed" }, { status: 500 });
  }
}
