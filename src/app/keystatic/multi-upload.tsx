"use client";

import { useRef, useState } from "react";

const TARGETS = [
  { id: "gallery", label: "Galerie" },
  { id: "visualizationsPhoto", label: "Fotovize" },
  { id: "visualizationsDokonceno", label: "Vize dokončení" },
  { id: "visualizations", label: "Studie (černobílé)" },
  { id: "plans", label: "Půdorysy" },
] as const;

type TargetId = (typeof TARGETS)[number]["id"];
type Kind = "exterier" | "interier" | "stav";

async function uploadBatch(
  files: File[],
  target: TargetId,
  kind: Kind,
): Promise<{ ok: boolean; added?: number; error?: string }> {
  const form = new FormData();
  form.set("target", target);
  form.set("kind", kind);
  for (const file of files) form.append("files", file);

  const res = await fetch("/api/admin/photos", {
    method: "POST",
    body: form,
    credentials: "same-origin",
  });

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    added?: number;
    error?: string;
  };

  if (!res.ok) {
    return { ok: false, error: data.error || `Chyba ${res.status}` };
  }
  return { ok: true, added: data.added ?? files.length };
}

export function MultiUpload({
  onUploaded,
}: {
  onUploaded?: (count: number, label: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<TargetId>("gallery");
  const [kind, setKind] = useState<Kind>("exterier");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function onFilesSelected(list: FileList | null) {
    if (!list?.length) return;
    const files = [...list];
    setBusy(true);
    setError(false);
    setMessage(`Nahrávám ${files.length} fotek…`);

    let uploaded = 0;
    // Small batches so Zerops/nginx body limit does not reject the request.
    const chunkSize = 3;
    const label = TARGETS.find((t) => t.id === target)?.label || target;
    try {
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        const result = await uploadBatch(chunk, target, kind);
        if (!result.ok) {
          setError(true);
          setMessage(result.error || "Upload selhal.");
          setBusy(false);
          if (inputRef.current) inputRef.current.value = "";
          return;
        }
        uploaded += result.added ?? chunk.length;
        setMessage(`Nahráno ${uploaded} / ${files.length}…`);
      }
      setMessage(`Hotovo: ${uploaded} fotek v „${label}“.`);
      onUploaded?.(uploaded, label);
    } catch {
      setError(true);
      setMessage("Upload selhal (síť nebo server).");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        background: "#111",
        color: "#f5f5f5",
        borderBottom: "2px solid #5a6b4a",
        padding: "12px 16px",
        fontFamily: "system-ui, sans-serif",
        fontSize: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <strong style={{ marginRight: 4 }}>Nahrát více fotek</strong>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          Galerie
          <select
            value={target}
            disabled={busy}
            onChange={(e) => setTarget(e.target.value as TargetId)}
            style={{ padding: "6px 8px", borderRadius: 4 }}
          >
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {target === "gallery" ? (
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            Typ
            <select
              value={kind}
              disabled={busy}
              onChange={(e) => setKind(e.target.value as Kind)}
              style={{ padding: "6px 8px", borderRadius: 4 }}
            >
              <option value="exterier">Exteriér</option>
              <option value="interier">Interiér</option>
              <option value="stav">Stav</option>
            </select>
          </label>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "none",
            background: busy ? "#666" : "#5a6b4a",
            color: "#fff",
            fontWeight: 600,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "Nahrávám…" : "Vybrat fotky…"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          hidden
          onChange={(e) => onFilesSelected(e.target.files)}
        />
        {message ? (
          <span style={{ color: error ? "#f5a8a8" : "#c8e6c0", flex: "1 1 220px" }}>
            {message}
          </span>
        ) : (
          <span style={{ color: "#aaa", flex: "1 1 220px" }}>
            Vyberte více souborů najednou — uloží se rovnou na web (bez Keystatic Save).
          </span>
        )}
      </div>
    </div>
  );
}
