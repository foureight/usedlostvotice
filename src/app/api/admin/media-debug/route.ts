import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FOLDERS = [
  "galerie",
  "vizualizace-foto",
  "vizualizace-dokonceno",
  "vizualizace",
  "pudorysy",
  "stav",
];

/** GET /api/admin/media-debug?folder=vizualizace-foto&file=puda.webp */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const url = new URL(request.url);
  const folder = url.searchParams.get("folder") || "vizualizace-foto";
  const file = url.searchParams.get("file") || "";
  if (!FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Neplatná složka." }, { status: 400 });
  }

  const cms = process.env.CMS_DATA_DIR || "";
  const localDir = path.join(process.cwd(), "public", folder);
  const volumeDir = cms ? path.join(cms, "public", folder) : "";

  let localFiles: string[] = [];
  let volumeFiles: string[] = [];
  try {
    localFiles = await readdir(localDir);
  } catch {
    /* missing */
  }
  if (volumeDir) {
    try {
      volumeFiles = await readdir(volumeDir);
    } catch {
      /* missing */
    }
  }

  async function describe(abs: string) {
    if (!existsSync(abs)) return { exists: false as const };
    const s = await stat(abs);
    return {
      exists: true as const,
      size: s.size,
      isFile: s.isFile(),
      isDirectory: s.isDirectory(),
      mode: s.mode,
      mtime: s.mtime.toISOString(),
    };
  }

  const target = file ? path.basename(file) : "";
  return NextResponse.json({
    cwd: process.cwd(),
    cms,
    folder,
    localDir,
    volumeDir: volumeDir || null,
    localCount: localFiles.length,
    volumeCount: volumeFiles.length,
    localHasPuda: localFiles.some((n) => n.toLowerCase().includes("puda")),
    volumeHasPuda: volumeFiles.some((n) => n.toLowerCase().includes("puda")),
    localPudaLike: localFiles.filter((n) => /puda/i.test(n)),
    volumePudaLike: volumeFiles.filter((n) => /puda/i.test(n)),
    file: target
      ? {
          name: target,
          local: await describe(path.join(localDir, target)),
          volume: volumeDir ? await describe(path.join(volumeDir, target)) : null,
        }
      : null,
  });
}
