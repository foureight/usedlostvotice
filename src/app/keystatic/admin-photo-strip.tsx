"use client";

import type { AdminThumb } from "./admin-list-thumbs";

/** Visible photo grid above Keystatic — text `src` fields alone don't show images. */
export function AdminPhotoStrip({ thumbs = [] }: { thumbs?: AdminThumb[] }) {
  if (!thumbs.length) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#f7f4ef",
        borderBottom: "1px solid #ddd",
        padding: "10px 16px",
        maxHeight: "220px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#666",
          marginBottom: 8,
        }}
      >
          Fotky na webu ({thumbs.length}) — jen online CMS
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: 8,
        }}
      >
        {thumbs.map((t) => (
          <a
            key={`${t.src}-${t.alt}`}
            href={t.src}
            target="_blank"
            rel="noreferrer"
            title={t.alt}
            style={{
              display: "block",
              aspectRatio: "4/3",
              overflow: "hidden",
              borderRadius: 4,
              background: "#e8e8e8",
              border: "1px solid #ddd",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.src}
              alt={t.alt}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}
