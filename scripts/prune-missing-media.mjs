#!/usr/bin/env node
/**
 * Remove gallery entries whose public files are missing.
 * Also used on Zerops boot so broken thumbnails disappear.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const root = process.cwd();
const sitePath = path.join(root, "content", "site.json");
const fields = [
  "gallery",
  "visualizationsPhoto",
  "visualizationsDokonceno",
  "visualizations",
  "plans",
];

const site = JSON.parse(readFileSync(sitePath, "utf8"));
let removed = 0;

for (const field of fields) {
  const list = Array.isArray(site[field]) ? site[field] : [];
  const next = list.filter((item) => {
    const src = typeof item?.src === "string" ? item.src : "";
    if (!src.startsWith("/")) {
      removed += 1;
      return false;
    }
    const abs = path.join(root, "public", src.replace(/^\//, ""));
    if (!existsSync(abs)) {
      removed += 1;
      console.log(`[prune] remove missing ${field}: ${src}`);
      return false;
    }
    return true;
  });
  site[field] = next;
}

if (removed > 0) {
  writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
  console.log(`[prune] removed ${removed} missing media entries`);
} else {
  console.log("[prune] no missing media entries");
}
