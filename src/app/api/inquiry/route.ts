import { NextResponse } from "next/server";
import { markInquiryMailed, saveInquiry } from "@/lib/inquiries";
import { verifyMathCaptcha } from "@/lib/math-captcha";
import { sendInquiryEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const note = String(body.note || "").trim();
    const captcha = String(body.captcha || "").trim();
    const captchaToken = String(body.captchaToken || "").trim();

    if (!name || !email) {
      return NextResponse.json({ error: "missing" }, { status: 400 });
    }
    if (!verifyMathCaptcha(captchaToken, captcha)) {
      return NextResponse.json({ error: "captcha" }, { status: 400 });
    }

    // Save first so a slow/blocked SMTP never loses the lead.
    const saved = await saveInquiry({ name, email, phone, note, mailed: false });

    let mailed = false;
    let mailReason: string | undefined;
    try {
      const result = await sendInquiryEmail({ name, email, phone, note });
      mailed = result.sent;
      mailReason = result.sent ? undefined : result.reason;
      if (mailed) {
        await markInquiryMailed(saved.slug).catch(() => null);
      }
    } catch (error) {
      console.error("[inquiry] mail failed", error);
      mailReason = "mail-failed";
    }

    console.info("[inquiry]", {
      name,
      email,
      phone,
      note: note.slice(0, 2000),
      at: new Date().toISOString(),
      mail: mailed ? "sent" : mailReason,
      slug: saved.slug,
    });

    return NextResponse.json({
      ok: true,
      mailed,
      reason: mailReason,
      id: saved.slug,
    });
  } catch (error) {
    console.error("[inquiry] save failed", error);
    return NextResponse.json({ error: "save-failed" }, { status: 500 });
  }
}
