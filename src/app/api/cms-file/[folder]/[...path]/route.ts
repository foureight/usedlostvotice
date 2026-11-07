import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "galerie",
  "vizualizace-foto",
  "vizualizace-dokonceno",
  "vizualizace",
  "pudorysy",
  "stav",
  "docs",
]);

function contentType(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".avif") return "image/avif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

async function readCandidate(abs: string) {
  try {
    const s = await stat(abs);
    if (!s.isFile() || s.size <= 0) return null;
    return await readFile(abs);
  } catch {
    return null;
  }
}

type Ctx = { params: Promise<{ folder: string; path: string[] }> };

/**
 * Serves CMS media from app public/ or Zerops volume.
 * Wired via beforeFiles rewrite so uploads stay visible even when
 * Next static serving misses a runtime file.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const { folder, path: parts } = await ctx.params;
  if (!ALLOWED.has(folder) || !parts?.length) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (parts.some((p) => !p || p === "." || p === ".." || p.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rel = parts.map((p) => path.basename(p)).join("/");
  const candidates = [
    path.join(process.cwd(), "public", folder, rel),
    process.env.CMS_DATA_DIR
      ? path.join(process.env.CMS_DATA_DIR, "public", folder, rel)
      : "",
  ].filter(Boolean);

  for (const abs of candidates) {
    const buf = await readCandidate(abs);
    if (!buf) continue;
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType(rel),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  return new NextResponse("Not found", { status: 404 });
}
