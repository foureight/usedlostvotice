import { NextResponse } from "next/server";
import { createMathCaptcha } from "@/lib/math-captcha";

export const dynamic = "force-dynamic";

export async function GET() {
  const challenge = createMathCaptcha();
  return NextResponse.json({
    question: challenge.question,
    token: challenge.token,
  });
}
