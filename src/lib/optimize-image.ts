import { readdir, readFile, rename, unlink, writeFile, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";

/** Max longest edge for stored CMS photos. */
export const MAX_IMAGE_EDGE = 2000;
/** JPEG quality for permanently resized uploads. */
export const STORE_JPEG_QUALITY = 82;

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export type OptimizedImage = {
  buffer: Buffer;
  filename: string;
  width: number;
  height: number;
  bytes: number;
};

/**
 * Permanently downscale + recompress an uploaded photo.
 * Large phone PNGs become JPEG so public/ stays small.
 */
export async function optimizeImageUpload(
  input: Buffer,
  originalFilename: string,
): Promise<OptimizedImage> {
  const ext = path.extname(originalFilename).toLowerCase();
  const stem = path.basename(originalFilename, path.extname(originalFilename));

  const image = sharp(input, { failOn: "none", animated: false }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const hasAlpha = Boolean(meta.hasAlpha);
  const keepPng = hasAlpha && ext === ".png";

  let pipeline = image.resize({
    width: MAX_IMAGE_EDGE,
    height: MAX_IMAGE_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  let outExt = ".jpg";
  if (keepPng) {
    pipeline = pipeline.png({ compressionLevel: 8, palette: false });
    outExt = ".png";
  } else {
    pipeline = pipeline.jpeg({
      quality: STORE_JPEG_QUALITY,
      mozjpeg: true,
      chromaSubsampling: "4:2:0",
    });
    outExt = ".jpg";
  }

  const buffer = await pipeline.toBuffer();
  const outMeta = await sharp(buffer).metadata();
  return {
    buffer,
    filename: `${stem}${outExt}`,
    width: outMeta.width ?? width,
    height: outMeta.height ?? height,
    bytes: buffer.length,
  };
}

type Rewrite = { from: string; to: string };

/** Shrink one file on disk; may change .png → .jpg. */
export async function optimizeExistingFile(absPath: string): Promise<Rewrite | null> {
  const ext = path.extname(absPath).toLowerCase();
  if (!RASTER_EXT.has(ext)) return null;

  const before = await stat(absPath);
  if (before.size < 350_000) return null;

  const input = await readFile(absPath);
  const optimized = await optimizeImageUpload(input, path.basename(absPath));

  if (optimized.bytes >= before.size * 0.97 && path.extname(optimized.filename) === ext) {
    return null;
  }

  const dir = path.dirname(absPath);
  const nextPath = path.join(dir, optimized.filename);
  const tmpPath = `${nextPath}.tmp`;
  await writeFile(tmpPath, optimized.buffer);
  await rename(tmpPath, nextPath);

  const fromPublic = "/" + path.relative(path.join(process.cwd(), "public"), absPath).split(path.sep).join("/");
  const toPublic = "/" + path.relative(path.join(process.cwd(), "public"), nextPath).split(path.sep).join("/");

  if (nextPath !== absPath && existsSync(absPath)) {
    await unlink(absPath);
  }

  if (fromPublic === toPublic) return null;
  return { from: fromPublic, to: toPublic };
}

const MEDIA_DIRS = [
  "galerie",
  "vizualizace-foto",
  "vizualizace-dokonceno",
  "vizualizace",
  "pudorysy",
];

const MEDIA_FIELDS = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
] as const;

/** Walk public media, shrink oversized originals, rewrite site.json src paths. */
export async function optimizePublicMedia(): Promise<{ touched: string[]; rewrites: Rewrite[] }> {
  const touched: string[] = [];
  const rewrites: Rewrite[] = [];
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
        const rewrite = await optimizeExistingFile(abs);
        if (rewrite) {
          touched.push(rewrite.to);
          rewrites.push(rewrite);
        } else {
          // in-place shrink still counts
          const st = await stat(abs).catch(() => null);
          if (st && st.size < 350_000) {
            /* already small */
          }
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

  return { touched, rewrites };
}
