#!/usr/bin/env node
/**
 * Re-compress public photos for faster page loads.
 * Usage: node scripts/optimize-images.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(jpe?g|png)$/i.test(name) && !/favicon|icon-/.test(name)) out.push(p);
  }
  return out;
}

function maxFor(file) {
  const rel = path.relative(ROOT, file);
  if (rel.startsWith("og")) return 1200;
  if (rel.startsWith("pudorysy")) return 2000;
  return 1920;
}

const files = walk(ROOT);
let before = 0;
let after = 0;

for (const file of files) {
  const input = fs.readFileSync(file);
  before += input.length;
  const meta = await sharp(input).metadata();
  const maxEdge = maxFor(file);
  const longest = Math.max(meta.width || 0, meta.height || 0);
  let pipeline = sharp(input).rotate();
  if (maxEdge && longest > maxEdge) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? maxEdge : undefined,
      height: meta.height > meta.width ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  const isPng = /\.png$/i.test(file);
  const outBuf = isPng
    ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
    : await pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer();
  if (outBuf.length < input.length || (maxEdge && longest > maxEdge)) {
    fs.writeFileSync(file, outBuf);
    after += outBuf.length;
    console.log(
      `${path.relative(ROOT, file)}: ${(input.length / 1024).toFixed(0)} → ${(outBuf.length / 1024).toFixed(0)} KB`,
    );
  } else {
    after += input.length;
  }
}

console.log(
  `\nTotal ${(before / 1024 / 1024).toFixed(2)} → ${(after / 1024 / 1024).toFixed(2)} MB (${(((before - after) / before) * 100).toFixed(1)}% saved)`,
);
