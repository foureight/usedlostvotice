#!/usr/bin/env node
/**
 * If volume site.json lost gallery refs (aggressive prune) but public/ still
 * has files, restore media arrays from the deploy seed.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");
const seedPath = process.argv[2];

if (!seedPath || !existsSync(seedPath)) {
  console.log("[restore-media] no seed path, skip");
  process.exit(0);
}

const fields = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
];

function existsPublic(src) {
  if (typeof src !== "string" || !src.startsWith("/")) return false;
  return existsSync(path.join(root, "public", src.replace(/^\//, "")));
}

const site = JSON.parse(readFileSync(sitePath, "utf8"));
const seed = JSON.parse(readFileSync(seedPath, "utf8"));
let changed = 0;

for (const field of fields) {
  const current = Array.isArray(site[field]) ? site[field] : [];
  const present = current.filter((item) => existsPublic(item?.src));
  const seedList = Array.isArray(seed[field]) ? seed[field] : [];
  const seedPresent = seedList.filter((item) => existsPublic(item?.src));

  // Restore when current gallery is empty/broken but seed files are on disk.
  if (present.length === 0 && seedPresent.length > 0) {
    site[field] = seedPresent;
    changed += seedPresent.length;
    console.log(`[restore-media] restored ${field}: ${seedPresent.length} items`);
    continue;
  }

  // Keep existing present items; append any seed items that exist and are missing.
  if (seedPresent.length > 0) {
    const have = new Set(present.map((i) => i.src));
    const merged = [...present];
    for (const item of seedPresent) {
      if (!have.has(item.src)) {
        merged.push(item);
        changed += 1;
      }
    }
    if (merged.length !== current.length) {
      site[field] = merged;
      console.log(`[restore-media] merged ${field}: ${merged.length} items`);
    } else {
      site[field] = present.length === current.length ? current : present;
    }
  } else if (present.length !== current.length) {
    site[field] = present;
  }
}

if (changed > 0 || fields.some((f) => (site[f] || []).length !== (JSON.parse(readFileSync(sitePath, "utf8"))[f] || []).length)) {
  writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
  const cms = process.env.CMS_DATA_DIR;
  if (cms) {
    try {
      copyFileSync(sitePath, path.join(cms, "content", "site.json"));
    } catch {
      /* ignore */
    }
  }
  console.log(`[restore-media] wrote site.json (+${changed})`);
} else {
  console.log("[restore-media] nothing to restore");
}
