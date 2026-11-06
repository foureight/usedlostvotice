"use client";

import { useEffect, useState, type FormEvent } from "react";

export function InquiryForm({
  brand,
  priceLabel,
}: {
  brand: string;
  priceLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("Načítám ověření…");
  const [captchaToken, setCaptchaToken] = useState("");

  async function loadCaptcha() {
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      if (!res.ok) throw new Error("captcha");
      const data = (await res.json()) as { question?: string; token?: string };
      setCaptchaQuestion(data.question || "Kolik je součet?");
      setCaptchaToken(data.token || "");
    } catch {
      setCaptchaQuestion("Ověření nejde načíst — obnovte stránku.");
      setCaptchaToken("");
    }
  }

  useEffect(() => {
    void loadCaptcha();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (String(data.get("company") || "").trim()) {
      setStatus("ok");
      setMessage("Děkujeme, ozveme se.");
      form.reset();
      return;
    }
    setStatus("sending");
    const controller = new AbortController();
    const kill = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          note: data.get("note"),
          captcha: data.get("captcha"),
          captchaToken,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        if (err.error === "captcha") {
          setStatus("error");
          setMessage("Špatný výsledek ověření. Zkuste znovu.");
          await loadCaptcha();
          return;
        }
        throw new Error("fail");
      }
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        mailed?: boolean;
        reason?: string;
      };
      setStatus("ok");
      if (payload.mailed) {
        setMessage("Děkujeme. Ozveme se co nejdřív kvůli prohlídce.");
      } else {
        setMessage(
          "Děkujeme — poptávku jsme uložili. E-mail se teď nepodařilo odeslat, ozveme se podle kontaktu v poptávce.",
        );
      }
      form.reset();
      await loadCaptcha();
    } catch {
      setStatus("error");
      setMessage("Odeslání se nepovedlo. Zkuste e-mail nebo telefon níže.");
      await loadCaptcha();
    } finally {
      window.clearTimeout(kill);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--color-ink-soft)]">Jméno</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-[var(--color-ink-soft)]">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--color-ink-soft)]">Telefon</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="w-full rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--color-ink-soft)]">Zpráva</span>
        <textarea
          name="note"
          rows={4}
          defaultValue={`Dobrý den, mám zájem o ${brand} (${priceLabel}). Rád/a bych domluvil/a prohlídku.`}
          className="w-full rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--color-ink-soft)]">
          Ověření (anti-spam): {captchaQuestion}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="captcha"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="Výsledek"
            className="w-full max-w-[8rem] rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
          />
          <button
            type="button"
            onClick={() => void loadCaptcha()}
            className="text-sm text-[var(--color-moss)] underline-offset-2 hover:underline"
          >
            Jiný příklad
          </button>
        </div>
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button
        type="submit"
        disabled={status === "sending" || !captchaToken}
        className="inline-flex rounded-sm bg-[var(--color-moss)] px-5 py-3 text-sm font-medium text-[var(--color-paper)] transition hover:bg-[var(--color-moss-deep)] disabled:opacity-60"
      >
        {status === "sending" ? "Odesílám…" : "Poslat poptávku"}
      </button>
      {message ? (
        <p
          className={`text-sm ${status === "error" ? "text-[var(--color-clay)]" : "text-[var(--color-moss-deep)]"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
