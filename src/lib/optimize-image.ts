import { readdir, readFile, rename, unlink, writeFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

/** Max longest edge for stored CMS photos. */
export const MAX_IMAGE_EDGE = 1600;
/** WebP quality for permanently stored photos (much smaller than JPEG/PNG). */
export const STORE_WEBP_QUALITY = 72;
/** Recompress / convert when larger than this (bytes). */
export const OPTIMIZE_MIN_BYTES = 40_000;

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export type OptimizedImage = {
  buffer: Buffer;
  filename: string;
  width: number;
  height: number;
  bytes: number;
};

/**
 * Permanently downscale + store as WebP (with alpha when needed).
 * WebP is typically 25–40% smaller than JPEG at similar quality.
 */
export async function optimizeImageUpload(
  input: Buffer,
  originalFilename: string,
): Promise<OptimizedImage> {
  const stem = path.basename(originalFilename, path.extname(originalFilename));

  const image = sharp(input, { failOn: "none", animated: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const pipeline = image
    .resize({
      width: MAX_IMAGE_EDGE,
      height: MAX_IMAGE_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: STORE_WEBP_QUALITY,
      alphaQuality: 80,
      effort: 4,
    });

  const buffer = await pipeline.toBuffer();
  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    filename: `${stem}.webp`,
    width: outMeta.width ?? width,
    height: outMeta.height ?? height,
    bytes: buffer.length,
  };
}

type Rewrite = { from: string; to: string };

/** Shrink one file on disk; converts JPG/PNG → WebP. */
export async function optimizeExistingFile(
  absPath: string,
): Promise<{ rewrite: Rewrite | null; savedBytes: number } | null> {
  const ext = path.extname(absPath).toLowerCase();
  if (!RASTER_EXT.has(ext)) return null;

  const before = await stat(absPath);
  // Always convert legacy JPG/PNG; only skip tiny WebP.
  if (ext === ".webp" && before.size < OPTIMIZE_MIN_BYTES) return null;
  if (ext !== ".webp" && before.size < 12_000) return null;

  const input = await readFile(absPath);
  const optimized = await optimizeImageUpload(input, path.basename(absPath));

  // Keep original if WebP isn't meaningfully smaller (rare for PNG).
  if (ext === ".webp" && optimized.bytes >= before.size * 0.95) {
    return null;
  }
  if (ext !== ".webp" && optimized.bytes >= before.size * 0.98) {
    // Still convert to WebP for consistent format / Next Image cache keys.
  }

  const dir = path.dirname(absPath);
  const nextPath = path.join(dir, optimized.filename);
  const tmpPath = `${nextPath}.tmp`;
  await writeFile(tmpPath, optimized.buffer);
  await rename(tmpPath, nextPath);

  const fromPublic =
    "/" + path.relative(path.join(process.cwd(), "public"), absPath).split(path.sep).join("/");
  const toPublic =
    "/" + path.relative(path.join(process.cwd(), "public"), nextPath).split(path.sep).join("/");

  if (nextPath !== absPath && existsSync(absPath)) {
    await unlink(absPath);
  }

  const savedBytes = Math.max(0, before.size - optimized.bytes);
  if (fromPublic === toPublic) {
    return { rewrite: null, savedBytes };
  }
  return { rewrite: { from: fromPublic, to: toPublic }, savedBytes };
}

const MEDIA_DIRS = [
  "galerie",
  "vizualizace-foto",
  "vizualizace-dokonceno",
  "vizualizace",
  "pudorysy",
  "stav",
];

const MEDIA_FIELDS = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
] as const;

/** Walk public media, convert to WebP, rewrite site.json src paths. */
export async function optimizePublicMedia(): Promise<{
  touched: string[];
  rewrites: Rewrite[];
  savedBytes: number;
}> {
  const touched: string[] = [];
  const rewrites: Rewrite[] = [];
  let savedBytes = 0;
  const root = path.join(process.cwd(), "public");

  for (const folder of MEDIA_DIRS) {
    const dir = path.join(root, folder);
    let names: string[] = [];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (name.endsWith(".tmp")) continue;
      const abs = path.join(dir, name);
      try {
        const result = await optimizeExistingFile(abs);
        if (!result) continue;
        savedBytes += result.savedBytes;
        if (result.rewrite) {
          touched.push(result.rewrite.to);
          rewrites.push(result.rewrite);
        } else {
          touched.push("/" + path.relative(root, abs).split(path.sep).join("/"));
        }
      } catch (err) {
        console.error("[optimize]", abs, err);
      }
    }
  }

  if (rewrites.length) {
    const sitePath = path.join(process.cwd(), "content", "site.json");
    const site = JSON.parse(await readFile(sitePath, "utf8")) as Record<string, unknown>;
    const map = new Map(rewrites.map((r) => [r.from, r.to]));
    let dirty = false;
    for (const field of MEDIA_FIELDS) {
      const list = Array.isArray(site[field]) ? (site[field] as { src?: string }[]) : [];
      for (const item of list) {
        if (typeof item.src === "string" && map.has(item.src)) {
          item.src = map.get(item.src);
          dirty = true;
        }
      }
    }
    if (dirty) {
      await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");
    }
  }

  return { touched, rewrites, savedBytes };
}
