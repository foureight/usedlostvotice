"use client";

import { useEffect, useState, type CSSProperties } from "react";

type SmtpData = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  /** Empty in UI unless user types a new password. */
  password: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  ccEmail: string;
  subjectPrefix: string;
  hasPassword?: boolean;
};

const empty: SmtpData = {
  enabled: false,
  host: "",
  port: 587,
  secure: false,
  user: "",
  password: "",
  fromEmail: "",
  fromName: "Usedlost Vodice",
  toEmail: "",
  ccEmail: "",
  subjectPrefix: "[Usedlost Vodice]",
  hasPassword: false,
};

/** Custom SMTP editor — Uložit/Uloženo + heslo nikdy neukáže plain text. */
export function AdminSmtpEditor() {
  const [smtp, setSmtp] = useState<SmtpData>(empty);
  const [status, setStatus] = useState("Načítám SMTP…");
  const [busy, setBusy] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/content", { credentials: "same-origin" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { smtp?: Partial<SmtpData> };
        if (cancelled) return;
        const s = data.smtp || {};
        setSmtp({
          enabled: Boolean(s.enabled),
          host: String(s.host || ""),
          port: Number(s.port) > 0 ? Number(s.port) : 587,
          secure: Boolean(s.secure),
          user: String(s.user || ""),
          password: "",
          fromEmail: String(s.fromEmail || ""),
          fromName: String(s.fromName || "Usedlost Vodice"),
          toEmail: String(s.toEmail || ""),
          ccEmail: String(s.ccEmail || ""),
          subjectPrefix: String(s.subjectPrefix || "[Usedlost Vodice]"),
          hasPassword: Boolean(s.hasPassword),
        });
        setStatus(
          s.hasPassword
            ? "Načteno — heslo je uložené (neukazuje se). Zadejte nové jen při změně."
            : "Načteno — heslo zatím není nastavené.",
        );
      } catch {
        if (!cancelled) setStatus("Nepodařilo se načíst SMTP");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setBusy(true);
    setSaveState("saving");
    setStatus("Ukládám…");
    try {
      const payload = { ...smtp };
      // Never send empty password as wipe — API keeps existing when blank.
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          smtp: {
            enabled: payload.enabled,
            host: payload.host,
            port: payload.port,
            secure: payload.secure,
            user: payload.user,
            password: payload.password,
            fromEmail: payload.fromEmail,
            fromName: payload.fromName,
            toEmail: payload.toEmail,
            ccEmail: payload.ccEmail,
            subjectPrefix: payload.subjectPrefix,
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { smtp?: { hasPassword?: boolean } };
      setSmtp((prev) => ({
        ...prev,
        password: "",
        hasPassword: Boolean(
          data.smtp?.hasPassword ?? (prev.hasPassword || Boolean(prev.password)),
        ),
      }));
      setStatus("Uloženo online");
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2200);
    } catch {
      setStatus("Uložení selhalo");
      setSaveState("idle");
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
    boxSizing: "border-box",
  };

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
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>E-mail / SMTP</p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{status}</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={save}
          style={{
            padding: "10px 18px",
            borderRadius: 6,
            border: 0,
            background: saveState === "saved" ? "#2f7d4a" : "#3764d9",
            color: "#fff",
            fontWeight: 700,
            cursor: busy ? "wait" : "pointer",
            fontSize: 14,
            minWidth: 96,
            transition: "background .2s ease",
          }}
        >
          {saveState === "saving" ? "Ukládám…" : saveState === "saved" ? "Uloženo" : "Uložit"}
        </button>
      </div>

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "20px 16px 48px",
          display: "grid",
          gap: 14,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={smtp.enabled}
            onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })}
          />
          Odesílání e-mailů zapnuto
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          SMTP host
          <input
            style={field}
            value={smtp.host}
            onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
            placeholder="smtp.gmail.com"
            autoComplete="off"
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
            Port
            <input
              style={field}
              type="number"
              value={smtp.port}
              onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) || 587 })}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 13, paddingTop: 22 }}>
            <input
              type="checkbox"
              checked={smtp.secure}
              onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
            />
            TLS/SSL (port 465)
          </label>
        </div>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          SMTP uživatel
          <input
            style={field}
            value={smtp.user}
            onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
            autoComplete="username"
          />
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          SMTP heslo / app password
          <input
            style={field}
            type="password"
            value={smtp.password}
            onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
            placeholder={smtp.hasPassword ? "••••••••  (ponechte prázdné = beze změny)" : "Zadejte heslo"}
            autoComplete="new-password"
          />
          <span style={{ fontWeight: 400, color: "#666", fontSize: 12 }}>
            Heslo se v adminu nikdy nezobrazí. Prázdné pole při uložení heslo nemění.
          </span>
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          Odesílatel (From e-mail)
          <input
            style={field}
            value={smtp.fromEmail}
            onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
          />
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          Odesílatel (jméno)
          <input
            style={field}
            value={smtp.fromName}
            onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
          />
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          Příjemce poptávek (To)
          <input
            style={field}
            value={smtp.toEmail}
            onChange={(e) => setSmtp({ ...smtp, toEmail: e.target.value })}
            placeholder="více adres oddělte čárkou"
          />
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          Kopie (Cc)
          <input
            style={field}
            value={smtp.ccEmail}
            onChange={(e) => setSmtp({ ...smtp, ccEmail: e.target.value })}
          />
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 600, fontSize: 13 }}>
          Prefix předmětu
          <input
            style={field}
            value={smtp.subjectPrefix}
            onChange={(e) => setSmtp({ ...smtp, subjectPrefix: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
