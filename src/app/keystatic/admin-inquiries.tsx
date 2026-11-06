"use client";

import { useCallback, useEffect, useState } from "react";

type Inquiry = {
  slug: string;
  title?: string;
  name?: string;
  email?: string;
  phone?: string;
  note?: string;
  createdAt?: string;
  status?: string;
  mailed?: boolean;
};

/** Reliable Poptávky list — Keystatic collection often hides API-written JSON. */
export function AdminInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("Načítám poptávky…");
  const [open, setOpen] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("Načítám poptávky…");
    try {
      const res = await fetch("/api/admin/content", { credentials: "same-origin" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { inquiries?: Inquiry[] };
      const list = Array.isArray(data.inquiries) ? data.inquiries : [];
      setRows(list);
      setStatus(list.length ? `${list.length} poptávek` : "Zatím žádná poptávka");
    } catch {
      setStatus("Nepodařilo se načíst poptávky");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(slug: string, label: string) {
    if (!window.confirm(`Smazat poptávku „${label}“?`)) return;
    setBusySlug(slug);
    try {
      const res = await fetch("/api/admin/content", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ inquirySlug: slug }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { inquiries?: Inquiry[] };
      const list = Array.isArray(data.inquiries) ? data.inquiries : [];
      setRows(list);
      if (open === slug) setOpen(null);
      setStatus(list.length ? `${list.length} poptávek` : "Zatím žádná poptávka");
    } catch {
      setStatus("Smazání selhalo");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh", background: "#f7f7f5" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          background: "#fff",
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Poptávky</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{status}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Obnovit
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 48px" }}>
        {rows.length === 0 ? (
          <p style={{ color: "#666" }}>Žádné záznamy. Po odeslání formuláře se tu objeví.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((r) => {
              const isOpen = open === r.slug;
              const label = r.name || r.title || r.slug;
              const busy = busySlug === r.slug;
              return (
                <article
                  key={r.slug}
                  style={{
                    position: "relative",
                    background: "#fff",
                    border: "1px solid #e0ddd6",
                    borderRadius: 8,
                    padding: "12px 14px",
                    paddingRight: 48,
                  }}
                >
                  <button
                    type="button"
                    aria-label={`Smazat poptávku ${label}`}
                    disabled={busy}
                    onClick={() => void remove(r.slug, label)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
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
                      boxShadow: "0 1px 4px rgba(0,0,0,.25)",
                    }}
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : r.slug)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      background: "none",
                      border: 0,
                      padding: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    <span>
                      <strong style={{ display: "block", marginBottom: 4 }}>{label}</strong>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        {r.email || "—"}
                        {r.phone ? ` · ${r.phone}` : ""}
                      </span>
                    </span>
                    <span style={{ fontSize: 12, color: "#777", whiteSpace: "nowrap", marginRight: 8 }}>
                      {r.createdAt ? r.createdAt.replace("T", " ").slice(0, 16) : ""}
                      <br />
                      {r.mailed ? "e-mail OK" : "e-mail ne"}
                    </span>
                  </button>
                  {isOpen ? (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#444", whiteSpace: "pre-wrap" }}>
                        {r.note || "—"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                        Stav: {r.status || "new"} · slug: {r.slug}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
