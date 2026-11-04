import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MEDIA_FIELDS = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
] as const;

/**
 * POST /api/admin/repair
 * - Removes media entries whose public files are missing
 * - Flushes cleaned site.json to the persistent volume
 */
export async function POST() {
  const sitePath = path.join(process.cwd(), "content", "site.json");
  let site: Record<string, unknown>;
  try {
    site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "site.json unreadable" }, { status: 500 });
  }

  const removed: string[] = [];
  for (const field of MEDIA_FIELDS) {
    const list = Array.isArray(site[field]) ? (site[field] as { src?: string }[]) : [];
    const next = list.filter((item) => {
      const src = typeof item?.src === "string" ? item.src : "";
      if (!src.startsWith("/")) {
        removed.push(`${field}:${src || "(empty)"}`);
        return false;
      }
      const abs = path.join(process.cwd(), "public", src.replace(/^\//, ""));
      if (!existsSync(abs)) {
        removed.push(`${field}:${src}`);
        return false;
      }
      return true;
    });
    site[field] = next;
  }

  await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");

  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    await mkdir(path.join(cms, "content"), { recursive: true });
    await copyFile(sitePath, path.join(cms, "content", "site.json"));
  }

  return NextResponse.json({
    ok: true,
    removed: removed.length,
    items: removed,
  });
}
