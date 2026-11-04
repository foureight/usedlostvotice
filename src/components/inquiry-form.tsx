"use client";

import { useState, type FormEvent } from "react";
import { property } from "@/data/property";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

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
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          note: data.get("note"),
          captcha: data.get("captcha"),
        }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      setMessage("Děkujeme. Ozveme se co nejdřív kvůli prohlídce.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Odeslání se nepovedlo. Zkuste e-mail nebo telefon níže.");
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
          defaultValue={`Dobrý den, mám zájem o ${property.brand} (${property.priceLabel}). Rád/a bych domluvil/a prohlídku.`}
          className="w-full rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[var(--color-ink-soft)]">Ověření: kolik je 4 + 5?</span>
        <input
          name="captcha"
          required
          inputMode="numeric"
          className="w-full max-w-[8rem] rounded-sm border border-[var(--color-line)] bg-white/70 px-3 py-2.5 outline-none ring-[var(--color-moss)] focus:ring-2"
        />
      </label>
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button
        type="submit"
        disabled={status === "sending"}
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
