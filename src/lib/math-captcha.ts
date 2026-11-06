import { createHmac, timingSafeEqual } from "crypto";

function secret() {
  return (
    process.env.ADMIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.KEYSTATIC_ADMIN_PASSWORD ||
    "usedlost-vodice-captcha"
  );
}

export type MathCaptchaChallenge = {
  a: number;
  b: number;
  question: string;
  token: string;
};

/** Create a fresh a+b challenge with a signed answer token. */
export function createMathCaptcha(): MathCaptchaChallenge {
  const a = 2 + Math.floor(Math.random() * 8); // 2–9
  const b = 2 + Math.floor(Math.random() * 8);
  const exp = Date.now() + 30 * 60 * 1000;
  const payload = `${a}.${b}.${a + b}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return {
    a,
    b,
    question: `Kolik je ${a} + ${b}?`,
    token: `${payload}.${sig}`,
  };
}

export function verifyMathCaptcha(token: string, answerRaw: string): boolean {
  const answer = Number(String(answerRaw).trim().replace(",", "."));
  if (!Number.isFinite(answer)) return false;

  // token: a.b.sum.exp.sig
  const parts = String(token || "").split(".");
  if (parts.length !== 5) return false;
  const [a, b, sum, exp, sig] = parts;
  const payload = `${a}.${b}.${sum}.${exp}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  try {
    const x = Buffer.from(sig);
    const y = Buffer.from(expected);
    if (x.length !== y.length || !timingSafeEqual(x, y)) return false;
  } catch {
    return false;
  }
  if (Date.now() > Number(exp)) return false;
  if (Number(a) + Number(b) !== Number(sum)) return false;
  return Number(sum) === answer;
}
