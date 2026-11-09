import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const MEDIA_FIELDS = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
] as const;

const URL_PATHS = [
  ["listingUrl"],
  ["architecture", "studioUrl"],
  ["completion", "teamUrl"],
  ["completion", "partnerUrl"],
] as const;

const ALT_EXTS = [".jpg", ".jpeg", ".webp", ".png", ".gif", ".avif"] as const;

function publicExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  const rel = src.replace(/^\//, "");
  if (existsSync(path.join(process.cwd(), "public", rel))) return true;
  const cms = process.env.CMS_DATA_DIR;
  if (cms && existsSync(path.join(cms, "public", rel))) return true;
  return false;
}

/** If /foo.png is missing but /foo.jpg exists, return the working path. */
function resolvePublicSrc(src: string): string | null {
  if (publicExists(src)) return src;
  const dir = path.posix.dirname(src);
  const base = path.posix.basename(src).replace(/\.[^.]+$/, "");
  for (const ext of ALT_EXTS) {
    const candidate = `${dir}/${base}${ext}`;
    if (publicExists(candidate)) return candidate;
  }
  return null;
}

function normalizePdf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    const raw = rec.filename ?? rec.src ?? rec.path ?? rec.value;
    if (typeof raw === "string" && raw.trim()) {
      return raw.startsWith("/") ? raw.trim() : `/docs/${raw.trim().replace(/^\.?\//, "")}`;
    }
  }
  return "/docs/architektonicka-studie.pdf";
}

function getPath(obj: Record<string, unknown>, parts: readonly string[]): unknown {
  let cur: unknown = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function setPath(obj: Record<string, unknown>, parts: readonly string[], value: unknown) {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (!next || typeof next !== "object") {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export type RepairResult = {
  removed: string[];
  fixedUrls: string[];
  fixedPdf: boolean;
  wrote: boolean;
};

/**
 * Make content/site.json Keystatic-safe: drop missing media, fix empty URLs, normalize PDF.
 */
export async function repairSiteJson(): Promise<RepairResult> {
  const sitePath = path.join(process.cwd(), "content", "site.json");
  const raw = await readFile(sitePath, "utf8");
  const site = JSON.parse(raw) as Record<string, unknown>;
  const removed: string[] = [];
  const fixedUrls: string[] = [];
  let fixedPdf = false;
  let dirty = false;

  for (const field of MEDIA_FIELDS) {
    const list = Array.isArray(site[field])
      ? (site[field] as { src?: unknown }[])
      : [];
    const next: { src?: unknown }[] = [];
    for (const item of list) {
      const src = typeof item?.src === "string" ? item.src.trim() : "";
      const fixed = src ? resolvePublicSrc(src) : null;
      if (!fixed) {
        removed.push(`${field}:${src || "(empty)"}`);
        continue;
      }
      if (fixed !== src) {
        next.push({ ...item, src: fixed });
        dirty = true;
      } else {
        next.push(item);
      }
    }
    // Never persist a fully emptied gallery — that wiped production photos before.
    if (next.length !== list.length && (next.length > 0 || list.length === 0)) {
      site[field] = next;
      dirty = true;
    } else if (next.length === list.length && dirty) {
      site[field] = next;
    } else if (next.length === 0 && list.length > 0) {
      console.warn(
        `[repair] skip emptying ${field} (${list.length} → 0); files may be mid-restore`,
      );
    }
  }

  for (const parts of URL_PATHS) {
    const value = getPath(site, parts);
    if (value === "" || value === null) {
      setPath(site, parts, undefined);
      // JSON.stringify drops undefined only if we delete the key
      let cur: Record<string, unknown> = site;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]] as Record<string, unknown>;
      }
      delete cur[parts[parts.length - 1]];
      fixedUrls.push(parts.join("."));
      dirty = true;
    }
  }

  const architecture = (site.architecture && typeof site.architecture === "object"
    ? (site.architecture as Record<string, unknown>)
    : null);
  if (architecture) {
    const before = architecture.pdf;
    const after = normalizePdf(before);
    if (before !== after || typeof before !== "string") {
      architecture.pdf = after;
      fixedPdf = true;
      dirty = true;
    }
  }

  if (dirty) {
    await writeFile(sitePath, `${JSON.stringify(site, null, 2)}\n`, "utf8");
    const cms = process.env.CMS_DATA_DIR;
    if (cms) {
      await mkdir(path.join(cms, "content"), { recursive: true });
      await copyFile(sitePath, path.join(cms, "content", "site.json"));
    }
  }

  return { removed, fixedUrls, fixedPdf, wrote: dirty };
}
