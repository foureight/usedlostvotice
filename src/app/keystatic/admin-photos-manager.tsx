"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MultiUpload } from "./multi-upload";

export type PhotoAlbum = {
  id: string;
  label: string;
  items: { src: string; alt: string }[];
};

export function AdminPhotosManager({ albums }: { albums: PhotoAlbum[] }) {
  const router = useRouter();
  const [busySrc, setBusySrc] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function removePhoto(field: string, src: string) {
    if (!confirm(`Smazat fotku z webu?\n${src}`)) return;
    setBusySrc(src);
    setMessage("");
    try {
      const res = await fetch("/api/admin/photos", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ field, src }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setMessage(data.error || `Smazání selhalo (${res.status})`);
        return;
      }
      setMessage("Smazáno. Obnovuji…");
      router.refresh();
    } catch {
      setMessage("Smazání selhalo (síť).");
    } finally {
      setBusySrc(null);
    }
  }

  const total = albums.reduce((n, a) => n + a.items.length, 0);

  return (
    <div
      style={{
        background: "#f7f4ef",
        borderBottom: "1px solid #ddd",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <MultiUpload />
      <div style={{ padding: "14px 16px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "baseline" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Fotky na webu ({total})
          </h2>
          <span style={{ color: "#666", fontSize: 13 }}>
            Podle kategorií — smažete jen to, co je online. Nic z lokálu se nedoplňuje.
          </span>
        </div>
        {message ? (
          <p style={{ margin: "8px 0 0", color: "#5a6b4a", fontSize: 13 }}>{message}</p>
        ) : null}

        <div style={{ display: "grid", gap: 22, marginTop: 16 }}>
          {albums.map((album) => (
            <section key={album.id}>
              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#444",
                }}
              >
                {album.label}{" "}
                <span style={{ fontWeight: 500, color: "#888" }}>({album.items.length})</span>
              </h3>
              {album.items.length === 0 ? (
                <p style={{ margin: 0, color: "#999", fontSize: 13 }}>Žádné fotky v této kategorii.</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 10,
                  }}
                >
                  {album.items.map((item) => (
                    <figure
                      key={`${album.id}-${item.src}`}
                      style={{
                        margin: 0,
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      <a href={item.src} target="_blank" rel="noreferrer" title={item.alt}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.src}
                          alt={item.alt}
                          loading="lazy"
                          decoding="async"
                          style={{
                            display: "block",
                            width: "100%",
                            aspectRatio: "4/3",
                            objectFit: "cover",
                            background: "#e8e8e8",
                          }}
                        />
                      </a>
                      <figcaption style={{ padding: "8px 8px 10px" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#555",
                            lineHeight: 1.3,
                            minHeight: 28,
                            overflow: "hidden",
                          }}
                          title={item.alt}
                        >
                          {item.alt || item.src}
                        </div>
                        <button
                          type="button"
                          disabled={busySrc === item.src}
                          onClick={() => removePhoto(album.id, item.src)}
                          style={{
                            marginTop: 6,
                            width: "100%",
                            padding: "6px 8px",
                            border: "1px solid #c45c5c",
                            borderRadius: 4,
                            background: busySrc === item.src ? "#eee" : "#fff5f5",
                            color: "#a33",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: busySrc === item.src ? "wait" : "pointer",
                          }}
                        >
                          {busySrc === item.src ? "Mažu…" : "Smazat"}
                        </button>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
