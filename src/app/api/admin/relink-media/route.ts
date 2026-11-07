import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGETS = [
  { folder: "galerie", field: "gallery" as const, withKind: true },
  { folder: "vizualizace-foto", field: "visualizationsPhoto" as const, withKind: false },
  { folder: "vizualizace-dokonceno", field: "visualizationsDokonceno" as const, withKind: false },
  { folder: "vizualizace", field: "visualizations" as const, withKind: false },
  { folder: "pudorysy", field: "plans" as const, withKind: false },
] as const;

const RASTER = /\.(webp|jpe?g|png|gif|avif)$/i;

type GalleryItem = {
  src?: string;
  alt?: string;
  kind?: string;
  label?: string;
};

function stemOf(name: string) {
  return path.basename(name, path.extname(name)).toLowerCase();
}

function altFromName(name: string) {
  return stemOf(name).replace(/[-_]+/g, " ").trim() || "Foto";
}

function rank(name: string) {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".webp") return 0;
  if (ext === ".jpg" || ext === ".jpeg") return 1;
  if (ext === ".png") return 2;
  return 3;
}

async function listRaster(dir: string): Promise<string[]> {
  try {
    const names = await readdir(dir);
    const out: string[] = [];
    for (const name of names) {
      if (!RASTER.test(name) || name.endsWith(".tmp")) continue;
      const abs = path.join(dir, name);
      try {
        const s = await stat(abs);
        if (s.isFile() && s.size > 0) out.push(name);
      } catch {
        /* skip */
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * POST /api/admin/relink-media
 * Attach orphan image files on disk/volume into site.json galleries.
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const sitePath = path.join(process.cwd(), "content", "site.json");
  const site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
  const added: { field: string; src: string }[] = [];
  let dirty = false;

  for (const target of TARGETS) {
    const existing = Array.isArray(site[target.field])
      ? ([...(site[target.field] as GalleryItem[])] as GalleryItem[])
      : [];
    const usedStems = new Set(
      existing
        .map((item) => {
          const src = typeof item?.src === "string" ? item.src : "";
          return src ? stemOf(path.basename(src)) : "";
        })
        .filter(Boolean),
    );
    const usedNames = new Set(
      existing
        .map((item) => {
          const src = typeof item?.src === "string" ? item.src : "";
          return src ? path.basename(src).toLowerCase() : "";
        })
        .filter(Boolean),
    );

    const dirs = [
      path.join(process.cwd(), "public", target.folder),
      process.env.CMS_DATA_DIR
        ? path.join(process.env.CMS_DATA_DIR, "public", target.folder)
        : "",
    ].filter(Boolean);

    const byStem = new Map<string, string>();
    for (const dir of dirs) {
      for (const name of await listRaster(dir)) {
        const stem = stemOf(name);
        const prev = byStem.get(stem);
        if (!prev || rank(name) < rank(prev)) byStem.set(stem, name);
      }
    }

    const next = [...existing];
    for (const [stem, name] of [...byStem.entries()].sort((a, b) =>
      a[1].localeCompare(b[1]),
    )) {
      if (usedStems.has(stem) || usedNames.has(name.toLowerCase())) continue;
      const src = `/${target.folder}/${name}`;
      const alt = altFromName(name);
      if (target.field === "plans") {
        next.push({ src, alt, label: alt });
      } else if (target.withKind) {
        next.push({ src, alt, kind: "exterier" });
      } else {
        next.push({ src, alt });
      }
      usedStems.add(stem);
      usedNames.add(name.toLowerCase());
      added.push({ field: target.field, src });
      dirty = true;
    }
    if (dirty) site[target.field] = next;
  }

  if (dirty) {
    await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");
    const cms = process.env.CMS_DATA_DIR;
    if (cms) {
      await mkdir(path.join(cms, "content"), { recursive: true });
      await copyFile(sitePath, path.join(cms, "content", "site.json"));
    }
  }

  return NextResponse.json({ ok: true, added: added.length, items: added });
}
