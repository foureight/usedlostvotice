"use client";

import { useEffect, useState, type CSSProperties } from "react";

type SeoData = {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  seoBody: string[];
  geoBody: string[];
  aioSummary: string;
  aioBullets: string[];
};

const empty: SeoData = {
  seoTitle: "",
  seoDescription: "",
  keywords: [],
  seoBody: [],
  geoBody: [],
  aioSummary: "",
  aioBullets: [],
};

function ListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, margin: 0 }}>
      <legend style={{ padding: "0 6px", fontWeight: 600, fontSize: 13 }}>{label}</legend>
      <div style={{ display: "grid", gap: 8 }}>
        {values.map((value, i) => (
          <div key={i} style={{ display: "flex", gap: 8 }}>
            <textarea
              value={value}
              rows={2}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              style={{ alignSelf: "start", padding: "8px 10px" }}
            >
              −
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...values, ""])} style={{ width: "fit-content" }}>
          + Přidat
        </button>
      </div>
    </fieldset>
  );
}

/** Reliable SEO editor from online CMS API (Keystatic often shows empty draft). */
export function AdminSeoEditor() {
  const [seo, setSeo] = useState<SeoData>(empty);
  const [status, setStatus] = useState("Načítám online SEO…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/content", { credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { seo?: Partial<SeoData> };
        if (cancelled) return;
        const s = data.seo || {};
        setSeo({
          seoTitle: String(s.seoTitle || ""),
          seoDescription: String(s.seoDescription || ""),
          keywords: Array.isArray(s.keywords) ? s.keywords.map(String) : [],
          seoBody: Array.isArray(s.seoBody) ? s.seoBody.map(String) : [],
          geoBody: Array.isArray(s.geoBody) ? s.geoBody.map(String) : [],
          aioSummary: String(s.aioSummary || ""),
          aioBullets: Array.isArray(s.aioBullets) ? s.aioBullets.map(String) : [],
        });
        setStatus("Načteno z online CMS");
      } catch {
        if (!cancelled) setStatus("Nepodařilo se načíst SEO");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setBusy(true);
    setStatus("Ukládám…");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seo }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("Uloženo online");
    } catch {
      setStatus("Uložení selhalo");
    } finally {
      setBusy(false);
    }
  }

  const field: CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    font: "inherit",
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "grid",
        gap: 0,
        minHeight: "100%",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid #e5e5e5",
          background: "#fff",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>SEO</h1>
          <p style={{ margin: "2px 0 0", color: "#666", fontSize: 13 }}>{status}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={save}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: 0,
            background: "#3764d9",
            color: "#fff",
            fontWeight: 700,
            cursor: busy ? "wait" : "pointer",
            fontSize: 14,
          }}
        >
          {busy ? "Ukládám…" : "Save"}
        </button>
      </div>

      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "20px 16px 48px",
          display: "grid",
          gap: 16,
          width: "100%",
          boxSizing: "border-box",
        }}
      >

      <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
        SEO title
        <input
          style={field}
          value={seo.seoTitle}
          onChange={(e) => setSeo({ ...seo, seoTitle: e.target.value })}
        />
      </label>

      <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
        SEO description
        <textarea
          style={field}
          rows={4}
          value={seo.seoDescription}
          onChange={(e) => setSeo({ ...seo, seoDescription: e.target.value })}
        />
      </label>

      <ListEditor
        label="Keywords"
        values={seo.keywords}
        onChange={(keywords) => setSeo({ ...seo, keywords })}
      />
      <ListEditor
        label="SEO odstavce"
        values={seo.seoBody}
        onChange={(seoBody) => setSeo({ ...seo, seoBody })}
      />
      <ListEditor
        label="GEO odstavce"
        values={seo.geoBody}
        onChange={(geoBody) => setSeo({ ...seo, geoBody })}
      />

      <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
        Shrnutí nabídky
        <textarea
          style={field}
          rows={5}
          value={seo.aioSummary}
          onChange={(e) => setSeo({ ...seo, aioSummary: e.target.value })}
        />
      </label>

      <ListEditor
        label="Klíčová fakta"
        values={seo.aioBullets}
        onChange={(aioBullets) => setSeo({ ...seo, aioBullets })}
      />
      </div>
    </div>
  );
}
