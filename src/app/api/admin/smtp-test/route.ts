import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { sendSmtpTestEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nejste přihlášeni." }, { status: 401 });
  }

  const result = await sendSmtpTestEmail();
  return NextResponse.json({
    ok: result.sent,
    sent: result.sent,
    reason: result.reason,
    detail: result.detail,
    meta: result.meta,
  });
}
