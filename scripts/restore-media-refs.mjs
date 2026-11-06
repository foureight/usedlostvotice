#!/usr/bin/env node
/**
 * Online CMS only: drop gallery refs whose files are missing.
 * Never add photos from deploy seed or by scanning disk folders.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");

const FIELDS = [
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

if (!existsSync(sitePath)) {
  console.log("[restore-media] no site.json, skip");
  process.exit(0);
}

const site = JSON.parse(readFileSync(sitePath, "utf8"));
let changed = 0;

for (const field of FIELDS) {
  const current = Array.isArray(site[field]) ? site[field] : [];
  const present = current.filter((item) => existsPublic(item?.src));
  if (present.length !== current.length) {
    site[field] = present;
    changed += current.length - present.length;
    console.log(
      `[restore-media] pruned ${field}: ${current.length} → ${present.length} (online only)`,
    );
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
  console.log(`[restore-media] wrote site.json (removed ${changed} missing)`);
} else {
  console.log("[restore-media] online CMS unchanged");
}
