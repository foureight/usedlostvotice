import nodemailer from "nodemailer";
import { readSmtpJson } from "@/lib/cms-files";

export type SmtpSettings = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  ccEmail: string;
  subjectPrefix: string;
};

function pick(value: string | null | undefined, fallback = ""): string {
  return (value || "").trim() || fallback;
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const stored = await readSmtpJson();

  const portFromEnv = Number(process.env.SMTP_PORT || "");
  const portFromStore = typeof stored.port === "number" ? stored.port : Number(stored.port);

  return {
    enabled:
      process.env.SMTP_ENABLED === "true" ||
      process.env.SMTP_ENABLED === "1" ||
      Boolean(stored.enabled),
    host: pick(process.env.SMTP_HOST, pick(typeof stored.host === "string" ? stored.host : "")),
    port:
      Number.isFinite(portFromEnv) && portFromEnv > 0
        ? portFromEnv
        : Number.isFinite(portFromStore) && portFromStore > 0
          ? portFromStore
          : 587,
    secure:
      process.env.SMTP_SECURE === "true" ||
      process.env.SMTP_SECURE === "1" ||
      Boolean(stored.secure),
    user: pick(process.env.SMTP_USER, pick(typeof stored.user === "string" ? stored.user : "")),
    password: pick(
      process.env.SMTP_PASSWORD,
      pick(typeof stored.password === "string" ? stored.password : ""),
    ),
    fromEmail: pick(
      process.env.SMTP_FROM_EMAIL,
      pick(typeof stored.fromEmail === "string" ? stored.fromEmail : ""),
    ),
    fromName: pick(
      process.env.SMTP_FROM_NAME,
      pick(typeof stored.fromName === "string" ? stored.fromName : "", "Usedlost Vodice"),
    ),
    toEmail: pick(
      process.env.SMTP_TO_EMAIL,
      pick(typeof stored.toEmail === "string" ? stored.toEmail : ""),
    ),
    ccEmail: pick(
      process.env.SMTP_CC_EMAIL,
      pick(typeof stored.ccEmail === "string" ? stored.ccEmail : ""),
    ),
    subjectPrefix: pick(
      process.env.SMTP_SUBJECT_PREFIX,
      pick(
        typeof stored.subjectPrefix === "string" ? stored.subjectPrefix : "",
        "[Usedlost Vodice]",
      ),
    ),
  };
}

export function smtpIsConfigured(settings: SmtpSettings): boolean {
  return Boolean(
    settings.enabled &&
      settings.host &&
      settings.port &&
      settings.fromEmail &&
      settings.toEmail,
  );
}

export type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  note: string;
};

const MAIL_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label}-timeout`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function createTransporter(settings: SmtpSettings) {
  // Port 465 = implicit TLS. Port 587 = STARTTLS (secure:false).
  const useSecure = settings.secure || settings.port === 465;

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: useSecure,
    requireTLS: !useSecure && settings.port === 587,
    auth: settings.user
      ? {
          user: settings.user,
          pass: settings.password,
        }
      : undefined,
    connectionTimeout: MAIL_TIMEOUT_MS,
    greetingTimeout: MAIL_TIMEOUT_MS,
    socketTimeout: MAIL_TIMEOUT_MS,
    tls: {
      // Some shared hosts use imperfect cert chains.
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
  });
}

function fromAddress(settings: SmtpSettings) {
  return settings.fromName
    ? `"${settings.fromName}" <${settings.fromEmail}>`
    : settings.fromEmail;
}

async function sendWithSettings(
  settings: SmtpSettings,
  mail: {
    to: string;
    cc?: string;
    replyTo?: string;
    subject: string;
    text: string;
  },
) {
  if (!smtpIsConfigured(settings)) {
    return { sent: false as const, reason: "smtp-not-configured" as const, detail: "" };
  }

  const transporter = createTransporter(settings);

  try {
    await withTimeout(
      transporter.sendMail({
        from: fromAddress(settings),
        to: mail.to,
        cc: mail.cc || undefined,
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
      }),
      MAIL_TIMEOUT_MS + 2000,
      "smtp-send",
    );
    return { sent: true as const, reason: undefined, detail: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "mail-failed";
    console.error("[mail] send failed", message);
    return {
      sent: false as const,
      reason: (message.includes("timeout") ? "smtp-timeout" : "mail-failed") as
        | "smtp-timeout"
        | "mail-failed",
      detail: message.slice(0, 240),
    };
  }
}

export async function sendInquiryEmail(payload: InquiryPayload) {
  const settings = await getSmtpSettings();
  const subject = `${settings.subjectPrefix} Nová poptávka od ${payload.name}`.trim();
  const text = [
    "Nová poptávka z webu Usedlost Vodice",
    "",
    `Jméno: ${payload.name}`,
    `E-mail: ${payload.email}`,
    `Telefon: ${payload.phone || "—"}`,
    "",
    "Zpráva:",
    payload.note || "—",
    "",
    `Čas: ${new Date().toISOString()}`,
  ].join("\n");

  return sendWithSettings(settings, {
    to: settings.toEmail,
    cc: settings.ccEmail || undefined,
    replyTo: payload.email,
    subject,
    text,
  });
}

/** Admin self-test — sends a short message to the configured To address. */
export async function sendSmtpTestEmail() {
  const settings = await getSmtpSettings();
  if (!smtpIsConfigured(settings)) {
    return {
      sent: false as const,
      reason: "smtp-not-configured" as const,
      detail: "Zapněte SMTP a vyplňte host, from a to.",
      meta: {
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        user: settings.user,
        to: settings.toEmail,
        hasPassword: Boolean(settings.password),
      },
    };
  }

  const result = await sendWithSettings(settings, {
    to: settings.toEmail,
    subject: `${settings.subjectPrefix} Test SMTP`.trim(),
    text: [
      "Testovací e-mail z adminu Usedlost Vodice.",
      "",
      `Host: ${settings.host}`,
      `Port: ${settings.port}`,
      `Secure/TLS: ${settings.secure || settings.port === 465}`,
      `From: ${settings.fromEmail}`,
      `To: ${settings.toEmail}`,
      `Čas: ${new Date().toISOString()}`,
      "",
      "Když tento mail dorazí, SMTP z webu funguje.",
    ].join("\n"),
  });

  return {
    ...result,
    meta: {
      host: settings.host,
      port: settings.port,
      secure: settings.secure || settings.port === 465,
      user: settings.user,
      to: settings.toEmail,
      hasPassword: Boolean(settings.password),
    },
  };
}
