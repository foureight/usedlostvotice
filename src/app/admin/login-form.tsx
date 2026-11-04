"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("michal@tribo.cz");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Špatný e-mail nebo heslo.");
        return;
      }
      router.replace("/keystatic");
      router.refresh();
    } catch {
      setError("Přihlášení selhalo.");
    } finally {
      setBusy(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    height: 42,
    borderRadius: 8,
    border: "1px solid #3a4150",
    background: "#0f1115",
    color: "#fff",
    padding: "0 12px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#0f1115",
        color: "#f5f5f5",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "min(400px, 100%)",
          display: "grid",
          gap: 14,
          padding: 28,
          borderRadius: 12,
          background: "#171a21",
          border: "1px solid #2a2f3a",
        }}
      >
        <div>
          <p style={{ margin: 0, opacity: 0.6, fontSize: 12, letterSpacing: "0.12em" }}>
            USEDLOST VODICE
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 600 }}>
            Administrace
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.7, fontSize: 14 }}>
            Přihlaste se do Keystatic CMS.
          </p>
        </div>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            style={fieldStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
          Heslo
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            required
            style={fieldStyle}
          />
        </label>
        {error ? (
          <p style={{ margin: 0, color: "#ff8f8f", fontSize: 14 }}>{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          style={{
            height: 42,
            borderRadius: 8,
            border: 0,
            background: "#5b8def",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {busy ? "Přihlašuji…" : "Přihlásit"}
        </button>
      </form>
    </div>
  );
}
