#!/usr/bin/env node
/**
 * Fix gallery refs that point at missing files:
 * 1) try same basename with .jpg/.webp/.png/.jpeg
 * 2) only then drop the row
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");
const EXTS = [".jpg", ".jpeg", ".webp", ".png", ".gif", ".avif"];

const FIELDS = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
];

function publicAbs(src) {
  return path.join(root, "public", src.replace(/^\//, ""));
}

function existsPublic(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return false;
  if (existsSync(publicAbs(src))) return true;
  const cms = process.env.CMS_DATA_DIR;
  if (!cms) return false;
  return existsSync(path.join(cms, "public", src.replace(/^\//, "")));
}

function resolveExistingSrc(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return null;
  if (existsPublic(src)) return src;

  const dir = path.posix.dirname(src);
  const base = path.posix.basename(src).replace(/\.[^.]+$/, "");
  for (const ext of EXTS) {
    const candidate = `${dir}/${base}${ext}`;
    if (existsPublic(candidate)) return candidate;
  }
  return null;
}

if (!existsSync(sitePath)) {
  console.log("[restore-media] no site.json, skip");
  process.exit(0);
}

const site = JSON.parse(readFileSync(sitePath, "utf8"));
let rewritten = 0;
let removed = 0;

for (const field of FIELDS) {
  const current = Array.isArray(site[field]) ? site[field] : [];
  const next = [];
  for (const item of current) {
    const raw = typeof item?.src === "string" ? item.src.trim() : "";
    const fixed = resolveExistingSrc(raw);
    if (!fixed) {
      removed += 1;
      console.log(`[restore-media] drop missing ${field}: ${raw || "(empty)"}`);
      continue;
    }
    if (fixed !== raw) {
      rewritten += 1;
      console.log(`[restore-media] rewrite ${field}: ${raw} → ${fixed}`);
      next.push({ ...item, src: fixed });
    } else {
      next.push(item);
    }
  }
  site[field] = next;
}

if (rewritten > 0 || removed > 0) {
  writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    try {
      copyFileSync(sitePath, path.join(cms, "content", "site.json"));
    } catch {
      /* ignore */
    }
  }
  console.log(
    `[restore-media] wrote site.json (rewrote ${rewritten}, removed ${removed})`,
  );
} else {
  console.log("[restore-media] online CMS unchanged");
}
