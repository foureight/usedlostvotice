import { randomBytes } from "crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { optimizeImageUpload } from "@/lib/optimize-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGETS = {
  gallery: { folder: "galerie", field: "gallery" as const, needsKind: true },
  visualizationsPhoto: {
    folder: "vizualizace-foto",
    field: "visualizationsPhoto" as const,
    needsKind: false,
  },
  visualizationsDokonceno: {
    folder: "vizualizace-dokonceno",
    field: "visualizationsDokonceno" as const,
    needsKind: false,
  },
  visualizations: {
    folder: "vizualizace",
    field: "visualizations" as const,
    needsKind: false,
  },
  plans: { folder: "pudorysy", field: "plans" as const, needsKind: false },
} as const;

type TargetKey = keyof typeof TARGETS;
type Kind = "exterier" | "interier" | "stav";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_BYTES = 12 * 1024 * 1024;

function isTarget(value: string): value is TargetKey {
  return value in TARGETS;
}

function isKind(value: string): value is Kind {
  return value === "exterier" || value === "interier" || value === "stav";
}

function sanitizeBase(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return base || "foto";
}

function uniqueName(original: string, used: Set<string>): string {
  const ext = path.extname(original).slice(1).toLowerCase() || "jpg";
  const stem = sanitizeBase(path.basename(original, path.extname(original)));
  let candidate = `${stem}.${ext}`;
  if (!used.has(candidate)) {
    used.add(candidate);
    return candidate;
  }
  const suffix = randomBytes(3).toString("hex");
  candidate = `${stem}-${suffix}.${ext}`;
  used.add(candidate);
  return candidate;
}

type GalleryItem = {
  src?: string;
  alt?: string;
  kind?: string;
  label?: string;
};

/** Persist bytes to app public/ and Zerops volume (same path). */
async function writeMediaFile(folder: string, filename: string, buffer: Buffer) {
  const rel = path.join(folder, filename);
  const localAbs = path.join(process.cwd(), "public", rel);
  await mkdir(path.dirname(localAbs), { recursive: true });
  await writeFile(localAbs, buffer);

  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    const volumeAbs = path.join(cms, "public", rel);
    await mkdir(path.dirname(volumeAbs), { recursive: true });
    await writeFile(volumeAbs, buffer);
  }
  return `/${folder}/${filename}`.split(path.sep).join("/");
}

async function flushSiteToVolume(sitePath: string) {
  const cms = process.env.CMS_DATA_DIR;
  if (!cms) return;
  await mkdir(path.join(cms, "content"), { recursive: true });
  await copyFile(sitePath, path.join(cms, "content", "site.json"));
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Neplatný upload." }, { status: 400 });
  }

  const targetRaw = String(form.get("target") || "");
  if (!isTarget(targetRaw)) {
    return NextResponse.json({ error: "Neznámá galerie." }, { status: 400 });
  }
  const target = TARGETS[targetRaw];

  const kindRaw = String(form.get("kind") || "exterier");
  const kind: Kind = isKind(kindRaw) ? kindRaw : "exterier";

  const files = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!files.length) {
    return NextResponse.json({ error: "Vyberte aspoň jednu fotku." }, { status: 400 });
  }
  if (files.length > 5) {
    return NextResponse.json(
      { error: "Najednou max. 5 souborů (nahrajte po dávkách)." },
      { status: 400 },
    );
  }

  const sitePath = path.join(process.cwd(), "content", "site.json");
  const folderAbs = path.join(process.cwd(), "public", target.folder);
  await mkdir(folderAbs, { recursive: true });

  let site: Record<string, unknown>;
  try {
    site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Nelze načíst content/site.json." }, { status: 500 });
  }

  const existing = Array.isArray(site[target.field])
    ? ([...(site[target.field] as GalleryItem[])] as GalleryItem[])
    : [];
  const usedNames = new Set(
    existing
      .map((item) => {
        const src = typeof item?.src === "string" ? item.src : "";
        return path.basename(src);
      })
      .filter(Boolean),
  );

  const added: GalleryItem[] = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Soubor ${file.name} je větší než 12 MB.` },
        { status: 400 },
      );
    }
    const ext = path.extname(file.name).slice(1).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: `Nepodporovaný typ: ${file.name}` },
        { status: 400 },
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());
    let optimized;
    try {
      optimized = await optimizeImageUpload(raw, file.name);
    } catch (err) {
      console.error("[photos] optimize failed", file.name, err);
      return NextResponse.json(
        { error: `Soubor ${file.name} nejde zpracovat (poškozený obrázek?).` },
        { status: 400 },
      );
    }
    const filename = uniqueName(optimized.filename, usedNames);
    const src = await writeMediaFile(target.folder, filename, optimized.buffer);
    const alt =
      sanitizeBase(path.basename(file.name, path.extname(file.name))).replace(/-/g, " ") ||
      "Foto";

    if (target.field === "plans") {
      added.push({ src, alt, label: alt });
    } else if (target.needsKind) {
      added.push({ src, alt, kind });
    } else {
      added.push({ src, alt });
    }
  }

  site[target.field] = [...existing, ...added];
  await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");
  try {
    await flushSiteToVolume(sitePath);
  } catch (err) {
    console.error("[cms] flushSiteToVolume failed", err);
  }

  return NextResponse.json({
    ok: true,
    added: added.length,
    field: target.field,
    items: added,
  });
}

const DELETABLE_FIELDS = new Set(
  Object.values(TARGETS).map((t) => t.field as string),
);

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  let body: { field?: string; src?: string };
  try {
    body = (await request.json()) as { field?: string; src?: string };
  } catch {
    return NextResponse.json({ error: "Neplatné JSON." }, { status: 400 });
  }

  const field = String(body.field || "").trim();
  const src = String(body.src || "").trim();
  if (!DELETABLE_FIELDS.has(field) || !src.startsWith("/")) {
    return NextResponse.json({ error: "Neplatná fotka." }, { status: 400 });
  }
  if (src.includes("..") || src.includes("\\")) {
    return NextResponse.json({ error: "Neplatná cesta." }, { status: 400 });
  }

  const sitePath = path.join(process.cwd(), "content", "site.json");
  let site: Record<string, unknown>;
  try {
    site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Nelze načíst content/site.json." }, { status: 500 });
  }

  const existing = Array.isArray(site[field])
    ? ([...(site[field] as GalleryItem[])] as GalleryItem[])
    : [];
  const next = existing.filter((item) => item?.src !== src);
  if (next.length === existing.length) {
    return NextResponse.json({ error: "Fotka v CMS není." }, { status: 404 });
  }

  site[field] = next;
  await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");

  const rel = src.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  await rm(abs, { force: true }).catch(() => null);

  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    await mkdir(path.join(cms, "content"), { recursive: true });
    await copyFile(sitePath, path.join(cms, "content", "site.json"));
    await rm(path.join(cms, "public", rel), { force: true }).catch(() => null);
  }

  return NextResponse.json({ ok: true, field, src, remaining: next.length });
}

/** Update photo caption (alt / label) in online CMS. */
export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  let body: { field?: string; src?: string; alt?: string };
  try {
    body = (await request.json()) as { field?: string; src?: string; alt?: string };
  } catch {
    return NextResponse.json({ error: "Neplatné JSON." }, { status: 400 });
  }

  const field = String(body.field || "").trim();
  const src = String(body.src || "").trim();
  const alt = String(body.alt || "").trim();
  if (!DELETABLE_FIELDS.has(field) || !src.startsWith("/") || !alt) {
    return NextResponse.json({ error: "Neplatná fotka nebo popisek." }, { status: 400 });
  }
  if (src.includes("..") || src.includes("\\")) {
    return NextResponse.json({ error: "Neplatná cesta." }, { status: 400 });
  }

  const sitePath = path.join(process.cwd(), "content", "site.json");
  let site: Record<string, unknown>;
  try {
    site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Nelze načíst content/site.json." }, { status: 500 });
  }

  const existing = Array.isArray(site[field])
    ? ([...(site[field] as GalleryItem[])] as GalleryItem[])
    : [];
  const idx = existing.findIndex((item) => item?.src === src);
  if (idx < 0) {
    return NextResponse.json({ error: "Fotka v CMS není." }, { status: 404 });
  }

  const updated: GalleryItem = { ...existing[idx], alt };
  if (field === "plans") updated.label = alt;
  existing[idx] = updated;
  site[field] = existing;
  await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");

  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    await mkdir(path.join(cms, "content"), { recursive: true });
    await copyFile(sitePath, path.join(cms, "content", "site.json"));
  }

  return NextResponse.json({ ok: true, field, src, alt });
}
