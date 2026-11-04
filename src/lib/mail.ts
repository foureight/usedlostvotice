import nodemailer from "nodemailer";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

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
  const reader = createReader(process.cwd(), keystaticConfig);
  const stored = await reader.singletons.smtp.read();

  const portFromEnv = Number(process.env.SMTP_PORT || "");
  const portFromStore = stored?.port;

  return {
    enabled:
      process.env.SMTP_ENABLED === "true" ||
      process.env.SMTP_ENABLED === "1" ||
      Boolean(stored?.enabled),
    host: pick(process.env.SMTP_HOST, pick(stored?.host)),
    port: Number.isFinite(portFromEnv) && portFromEnv > 0 ? portFromEnv : portFromStore || 587,
    secure:
      process.env.SMTP_SECURE === "true" ||
      process.env.SMTP_SECURE === "1" ||
      Boolean(stored?.secure),
    user: pick(process.env.SMTP_USER, pick(stored?.user)),
    password: pick(process.env.SMTP_PASSWORD, pick(stored?.password)),
    fromEmail: pick(process.env.SMTP_FROM_EMAIL, pick(stored?.fromEmail)),
    fromName: pick(process.env.SMTP_FROM_NAME, pick(stored?.fromName, "Usedlost Vodice")),
    toEmail: pick(process.env.SMTP_TO_EMAIL, pick(stored?.toEmail)),
    ccEmail: pick(process.env.SMTP_CC_EMAIL, pick(stored?.ccEmail)),
    subjectPrefix: pick(
      process.env.SMTP_SUBJECT_PREFIX,
      pick(stored?.subjectPrefix, "[Usedlost Vodice]"),
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

export async function sendInquiryEmail(payload: InquiryPayload) {
  const settings = await getSmtpSettings();

  if (!smtpIsConfigured(settings)) {
    return { sent: false as const, reason: "smtp-not-configured" as const, settings };
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user
      ? {
          user: settings.user,
          pass: settings.password,
        }
      : undefined,
  });

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

  await transporter.sendMail({
    from: settings.fromName
      ? `"${settings.fromName}" <${settings.fromEmail}>`
      : settings.fromEmail,
    to: settings.toEmail,
    cc: settings.ccEmail || undefined,
    replyTo: payload.email,
    subject,
    text,
  });

  return { sent: true as const, settings };
}
