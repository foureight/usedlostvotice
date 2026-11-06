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
  const [editing, setEditing] = useState<{ field: string; src: string } | null>(null);
  const [draftAlt, setDraftAlt] = useState("");
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
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
      if (editing?.src === src) setEditing(null);
      setMessage("Smazáno z webu.");
      router.refresh();
    } catch {
      setMessage("Smazání selhalo (síť).");
    } finally {
      setBusySrc(null);
    }
  }

  function startEdit(field: string, src: string, alt: string) {
    setEditing({ field, src });
    setDraftAlt(alt);
    setMessage("");
  }

  async function saveAlt() {
    if (!editing) return;
    const alt = draftAlt.trim();
    if (!alt) {
      setMessage("Popisek nesmí být prázdný.");
      return;
    }
    setBusySrc(editing.src);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ field: editing.field, src: editing.src, alt }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setMessage(data.error || `Uložení popisku selhalo (${res.status})`);
        return;
      }
      setLocalAlbums((prev) =>
        prev.map((album) =>
          album.id === editing.field
            ? {
                ...album,
                items: album.items.map((i) =>
                  i.src === editing.src ? { ...i, alt } : i,
                ),
              }
            : album,
        ),
      );
      setEditing(null);
      setMessage("Popisek uložen.");
      router.refresh();
    } catch {
      setMessage("Uložení popisku selhalo (síť).");
    } finally {
      setBusySrc(null);
    }
  }

  const total = localAlbums.reduce((n, a) => n + a.items.length, 0);

  function saveAndRefresh() {
    setSaveState("saving");
    setMessage("Uloženo online. Obnovuji náhled…");
    router.refresh();
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 2200);
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#f7f4ef", minHeight: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #333",
          background: "#111",
          color: "#f5f5f5",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Fotky ({total})</div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            Nahrání, úprava popisku i smazání jdou rovnou na web
          </div>
        </div>
        <button
          type="button"
          onClick={saveAndRefresh}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: 0,
            background: saveState === "saved" ? "#2f7d4a" : "#3764d9",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
            minWidth: 96,
            transition: "background .2s ease",
          }}
        >
          {saveState === "saving" ? "Ukládám…" : saveState === "saved" ? "Uloženo" : "Uložit"}
        </button>
      </div>

      <div style={{ borderBottom: "1px solid #ddd", background: "#111" }}>
        <MultiUpload />
      </div>

      <div style={{ padding: "20px 20px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ margin: "0 0 8px", color: "#555", fontSize: 14 }}>
          Kategorie = sekce na webu. ✕ maže fotku, Edit upraví popisek.
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
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {album.items.map((item) => {
                    const isEditing =
                      editing?.field === album.id && editing.src === item.src;
                    const busy = busySrc === item.src;
                    return (
                      <figure
                        key={`${album.id}-${item.src}`}
                        style={{
                          margin: 0,
                          border: "1px solid #e5e5e5",
                          borderRadius: 6,
                          overflow: "hidden",
                          background: "#fafafa",
                          position: "relative",
                        }}
                      >
                        <div style={{ position: "relative" }}>
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
                          <button
                            type="button"
                            title="Smazat fotku"
                            aria-label="Smazat fotku"
                            disabled={busy}
                            onClick={() => removePhoto(album.id, item.src)}
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              border: "2px solid #fff",
                              background: "#d64545",
                              color: "#fff",
                              fontSize: 16,
                              fontWeight: 700,
                              lineHeight: "24px",
                              padding: 0,
                              cursor: busy ? "wait" : "pointer",
                              boxShadow: "0 1px 4px rgba(0,0,0,.35)",
                            }}
                          >
                            ×
                          </button>
                        </div>
                        <figcaption style={{ padding: "8px" }}>
                          {isEditing ? (
                            <div style={{ display: "grid", gap: 6 }}>
                              <textarea
                                value={draftAlt}
                                onChange={(e) => setDraftAlt(e.target.value)}
                                rows={3}
                                autoFocus
                                style={{
                                  width: "100%",
                                  boxSizing: "border-box",
                                  fontSize: 12,
                                  padding: 6,
                                  borderRadius: 4,
                                  border: "1px solid #ccc",
                                  resize: "vertical",
                                }}
                              />
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void saveAlt()}
                                  style={{
                                    flex: 1,
                                    padding: "6px 8px",
                                    border: 0,
                                    borderRadius: 4,
                                    background: "#3764d9",
                                    color: "#fff",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: busy ? "wait" : "pointer",
                                  }}
                                >
                                  {busy ? "…" : "Uložit"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => setEditing(null)}
                                  style={{
                                    padding: "6px 8px",
                                    border: "1px solid #ccc",
                                    borderRadius: 4,
                                    background: "#fff",
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                >
                                  Zrušit
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
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
                                onClick={() => startEdit(album.id, item.src, item.alt)}
                                style={{
                                  marginTop: 8,
                                  width: "100%",
                                  padding: "6px 8px",
                                  border: "1px solid #ccc",
                                  borderRadius: 4,
                                  background: "#fff",
                                  color: "#333",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Edit popisek
                              </button>
                            </>
                          )}
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
