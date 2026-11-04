import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
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
  // Keep payloads small for Zerops/nginx — client should send 1–3 files per request.
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

    const filename = uniqueName(file.name, usedNames);
    const abs = path.join(folderAbs, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(abs, buffer);

    const src = `/${target.folder}/${filename}`;
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

  return NextResponse.json({
    ok: true,
    added: added.length,
    field: target.field,
    items: added,
  });
}
