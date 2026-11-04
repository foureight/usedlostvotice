"use client";

import { useState } from "react";

export function RepairBanner({ initialNote = "" }: { initialNote?: string }) {
  const [note, setNote] = useState(initialNote);
  const [busy, setBusy] = useState(false);

  async function runRepair() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/repair", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        removedCount?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setNote(data.error || `Oprava selhala (${res.status}).`);
        return;
      }
      setNote(
        `Opraveno (odebráno ${data.removedCount ?? 0} položek). Obnovte stránku (F5) a uložte znovu.`,
      );
    } catch {
      setNote("Oprava selhala — síťová chyba.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "#1a1a1a",
        color: "#f5f0e8",
        fontSize: 14,
        borderBottom: "1px solid #333",
      }}
    >
      <p style={{ margin: 0, maxWidth: "52rem", lineHeight: 1.4 }}>
        {note ||
          "Když Keystatic hlásí „Bad data“ / nejde Save: nejdřív opravte data, pak obnovte stránku."}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={runRepair}
        style={{
          border: "1px solid #c4a574",
          background: busy ? "#333" : "#2a241c",
          color: "#f5f0e8",
          padding: "8px 14px",
          cursor: busy ? "wait" : "pointer",
          borderRadius: 2,
          whiteSpace: "nowrap",
        }}
      >
        {busy ? "Opravuji…" : "Opravit data (Bad data)"}
      </button>
    </div>
  );
}
