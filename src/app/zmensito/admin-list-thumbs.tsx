"use client";

import { useEffect } from "react";

/**
 * Keystatic array rows only render a text `itemLabel`. We encode the public
 * image path in the label as `«/path.jpg»` and rewrite each row to show a
 * thumbnail beside the clean label.
 */
const MARK_RE = /«(\/[^»]+)»/g;
const THUMB_ATTR = "data-uv-thumb";

function cleanLabel(raw: string) {
  return raw.replace(MARK_RE, "").replace(/\s+/g, " ").trim() || "Foto";
}

function extractSrc(raw: string): string | null {
  const match = MARK_RE.exec(raw);
  MARK_RE.lastIndex = 0;
  return match?.[1] ?? null;
}

function enhance() {
  const rows = document.querySelectorAll<HTMLElement>('[role="row"]');

  for (const row of rows) {
    const textEl =
      row.querySelector<HTMLElement>('[class*="Text"]') ||
      [...row.querySelectorAll<HTMLElement>("span")].find((s) =>
        (s.textContent || "").includes("«/"),
      );

    if (!textEl) continue;

    const raw = textEl.textContent || "";
    const src = extractSrc(raw);
    if (!src) {
      // Already cleaned; keep existing thumb if any
      continue;
    }

    const label = cleanLabel(raw);
    textEl.textContent = label;

    let img = row.querySelector<HTMLImageElement>(`img[${THUMB_ATTR}]`);
    if (!img) {
      img = document.createElement("img");
      img.setAttribute(THUMB_ATTR, "1");
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.style.cssText =
        "width:72px;height:48px;object-fit:cover;border-radius:4px;flex:0 0 auto;margin-inline-end:12px;background:#e8e8e8";
      const insertAt =
        textEl.closest('[role="gridcell"]') || textEl.parentElement || row;
      insertAt.insertBefore(img, insertAt.firstChild);
    }
    if (img.getAttribute("src") !== src) {
      img.src = src;
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

export function AdminListThumbs() {
  useEffect(() => {
    enhance();
    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhance();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
