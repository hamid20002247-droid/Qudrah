import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "review_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return (
    process.env.REVIEW_SESSION_SECRET ||
    process.env.REVIEW_PIN ||
    "dev-only-review-secret"
  );
}

export function getReviewCookieName() {
  return COOKIE_NAME;
}

export function signReviewSession(pin: string): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `ok:${exp}`;
  const sig = createHmac("sha256", secret() + pin)
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function verifyReviewSession(token: string | undefined): boolean {
  if (!token) return false;
  const pin = process.env.REVIEW_PIN;
  if (!pin) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = createHmac("sha256", secret() + pin)
    .update(payload)
    .digest("hex");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const [, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;
  return true;
}

export function checkPin(input: string): boolean {
  const pin = process.env.REVIEW_PIN;
  if (!pin) return false;
  if (input.length !== pin.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(pin));
  } catch {
    return false;
  }
}

export function reviewCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
