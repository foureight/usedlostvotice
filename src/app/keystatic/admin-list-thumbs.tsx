"use client";

import { useEffect } from "react";

/**
 * Keystatic array rows only show text `itemLabel`. We encode `«/path.jpg»` in
 * the label and also match against a server-provided alt→src map so thumbnails
 * keep working even when Keystatic form state has no loaded asset bytes.
 */
const MARK_RE = /«(\/[^»]+)»/g;
const THUMB_ATTR = "data-uv-thumb";

export type AdminThumb = { alt: string; src: string };

function cleanLabel(raw: string) {
  return raw.replace(MARK_RE, "").replace(/\s+/g, " ").trim() || "Foto";
}

function extractSrc(raw: string): string | null {
  const match = MARK_RE.exec(raw);
  MARK_RE.lastIndex = 0;
  return match?.[1] ?? null;
}

function normalizePublicSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

function lookupByAlt(map: AdminThumb[], label: string): string | null {
  const needle = label.trim().toLowerCase();
  if (!needle) return null;
  const exact = map.find((t) => t.alt.trim().toLowerCase() === needle);
  if (exact) return exact.src;
  const starts = map.find(
    (t) =>
      needle.startsWith(t.alt.trim().toLowerCase().slice(0, 24)) ||
      t.alt.trim().toLowerCase().startsWith(needle.slice(0, 24)),
  );
  return starts?.src ?? null;
}

function enhance(thumbs: AdminThumb[]) {
  const rows = document.querySelectorAll<HTMLElement>('[role="row"]');

  for (const row of rows) {
    const textEl =
      row.querySelector<HTMLElement>('[class*="Text"]') ||
      [...row.querySelectorAll<HTMLElement>("span")].find((s) => {
        const t = s.textContent || "";
        return t.includes("«/") || t.length > 8;
      });

    if (!textEl) continue;

    const raw = textEl.textContent || "";
    const fromMark = extractSrc(raw);
    const label = cleanLabel(raw);
    const fromMap = lookupByAlt(thumbs, label);
    const src = normalizePublicSrc(fromMark || fromMap || "");
    if (!src) continue;

    if (fromMark) textEl.textContent = label;

    let img = row.querySelector<HTMLImageElement>(`img[${THUMB_ATTR}]`);
    if (!img) {
      img = document.createElement("img");
      img.setAttribute(THUMB_ATTR, "1");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer-when-downgrade";
      img.style.cssText =
        "width:72px;height:48px;object-fit:cover;border-radius:4px;flex:0 0 auto;margin-inline-end:12px;background:#e8e8e8";
      const insertAt =
        textEl.closest('[role="gridcell"]') || textEl.parentElement || row;
      insertAt.insertBefore(img, insertAt.firstChild);
    }

    const absolute = src.startsWith("http")
      ? src
      : `${window.location.origin}${src}`;
    if (img.getAttribute("src") !== absolute) {
      img.src = absolute;
    }

    row.style.minHeight = "64px";
    const cell = textEl.closest<HTMLElement>('[role="gridcell"]');
    if (cell) {
      cell.style.display = "flex";
      cell.style.alignItems = "center";
      cell.style.gap = "4px";
      cell.style.minWidth = "0";
    }
  }
}

export function AdminListThumbs({ thumbs = [] }: { thumbs?: AdminThumb[] }) {
  useEffect(() => {
    const run = () => enhance(thumbs);
    run();
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        run();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [thumbs]);

  return null;
}
