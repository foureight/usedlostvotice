#!/usr/bin/env node
/**
 * Only repair EMPTY / broken gallery arrays in the live site.json.
 * Never merge deploy-seed refs into non-empty online CMS data — volume wins.
 * Seed is used only as metadata fallback when a field has zero usable items.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");
const seedPath = process.argv[2];

const FIELDS = [
  { field: "gallery", folder: "galerie", withKind: true },
  { field: "visualizationsPhoto", folder: "vizualizace-foto", withKind: false },
  { field: "visualizationsDokonceno", folder: "vizualizace-dokonceno", withKind: false },
  { field: "visualizations", folder: "vizualizace", withKind: false },
  { field: "plans", folder: "pudorysy", withKind: false, withLabel: true },
];

function existsPublic(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return false;
  return existsSync(path.join(root, "public", src.replace(/^\//, "")));
}

function scanFolder(folder, { withKind = false, withLabel = false } = {}) {
  const dir = path.join(root, "public", folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name))
    .sort()
    .map((name) => {
      const item = {
        src: `/${folder}/${name}`,
        alt: name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      };
      if (withKind) item.kind = "exterier";
      if (withLabel) item.label = item.alt;
      return item;
    });
}

if (!existsSync(sitePath)) {
  console.log("[restore-media] no site.json, skip");
  process.exit(0);
}

const site = JSON.parse(readFileSync(sitePath, "utf8"));
const seed =
  seedPath && existsSync(seedPath)
    ? JSON.parse(readFileSync(seedPath, "utf8"))
    : {};

let changed = 0;

for (const { field, folder, withKind, withLabel } of FIELDS) {
  const current = Array.isArray(site[field]) ? site[field] : [];
  const present = current.filter((item) => existsPublic(item?.src));
  const seedList = Array.isArray(seed[field]) ? seed[field] : [];
  const seedPresent = seedList.filter((item) => existsPublic(item?.src));
  const scanned = scanFolder(folder, { withKind, withLabel });

  // Drop broken refs only when some items remain — never invent from seed.
  if (present.length > 0) {
    if (present.length !== current.length) {
      site[field] = present;
      changed += current.length - present.length;
      console.log(
        `[restore-media] pruned missing from ${field}: ${current.length} → ${present.length}`,
      );
    }
    continue;
  }

  // Field empty/broken: prefer seed metadata, else scan disk.
  if (seedPresent.length > 0) {
    site[field] = seedPresent;
    changed += seedPresent.length;
    console.log(`[restore-media] restored ${field} from seed: ${seedPresent.length}`);
    continue;
  }

  if (scanned.length > 0) {
    const bySrc = new Map(seedPresent.map((i) => [i.src, i]));
    site[field] = scanned.map((item) => bySrc.get(item.src) || item);
    changed += site[field].length;
    console.log(`[restore-media] rebuilt ${field} from disk: ${site[field].length}`);
  }
}

if (changed > 0) {
  writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    try {
      copyFileSync(sitePath, path.join(cms, "content", "site.json"));
    } catch {
      /* ignore */
    }
  }
  console.log(`[restore-media] wrote site.json (delta ${changed})`);
} else {
  console.log("[restore-media] nothing to restore — online CMS unchanged");
}
