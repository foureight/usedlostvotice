"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [localAlbums, setLocalAlbums] = useState(albums);

  useEffect(() => {
    setLocalAlbums(albums);
  }, [albums]);

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
      setLocalAlbums((prev) =>
        prev.map((album) =>
          album.id === field
            ? { ...album, items: album.items.filter((i) => i.src !== src) }
            : album,
        ),
      );
      setMessage("Smazáno z webu.");
      router.refresh();
    } catch {
      setMessage("Smazání selhalo (síť).");
    } finally {
      setBusySrc(null);
    }
  }

  const total = localAlbums.reduce((n, a) => n + a.items.length, 0);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f7f4ef", minHeight: "100%" }}>
      <div style={{ borderBottom: "1px solid #ddd", background: "#111" }}>
        <MultiUpload />
      </div>

      <div style={{ padding: "20px 20px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: "0 0 6px", fontSize: 22 }}>Fotky na webu ({total})</h1>
        <p style={{ margin: "0 0 8px", color: "#555", fontSize: 14 }}>
          Kategorie = sekce na webu. Nahrání i smazání platí hned online — nic z lokálu se
          nedoplňuje.
        </p>
        {message ? (
          <p style={{ margin: "0 0 12px", color: "#5a6b4a", fontSize: 13, fontWeight: 600 }}>
            {message}
          </p>
        ) : null}

        <div style={{ display: "grid", gap: 28, marginTop: 18 }}>
          {localAlbums.map((album) => (
            <section
              key={album.id}
              style={{
                background: "#fff",
                border: "1px solid #e0ddd6",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h2
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#333",
                }}
              >
                {album.label}{" "}
                <span style={{ color: "#888", fontWeight: 500 }}>({album.items.length})</span>
              </h2>

              {album.items.length === 0 ? (
                <p style={{ margin: 0, color: "#999", fontSize: 13 }}>
                  Žádné fotky — nahrajte nahoře do této kategorie.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: 12,
                  }}
                >
                  {album.items.map((item) => (
                    <figure
                      key={`${album.id}-${item.src}`}
                      style={{
                        margin: 0,
                        border: "1px solid #e5e5e5",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "#fafafa",
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
                      <figcaption style={{ padding: "8px" }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#555",
                            lineHeight: 1.35,
                            minHeight: 30,
                            overflow: "hidden",
                          }}
                        >
                          {item.alt || item.src}
                        </div>
                        <button
                          type="button"
                          disabled={busySrc === item.src}
                          onClick={() => removePhoto(album.id, item.src)}
                          style={{
                            marginTop: 8,
                            width: "100%",
                            padding: "7px 8px",
                            border: "1px solid #c45c5c",
                            borderRadius: 4,
                            background: busySrc === item.src ? "#eee" : "#fff5f5",
                            color: "#a33",
                            fontSize: 12,
                            fontWeight: 700,
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
