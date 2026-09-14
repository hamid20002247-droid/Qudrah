import { NextResponse } from "next/server";
import {
  checkPin,
  getReviewCookieName,
  reviewCookieOptions,
  signReviewSession,
} from "@/lib/review";

export async function POST(req: Request) {
  try {
    const { pin } = (await req.json()) as { pin?: string };
    if (!pin || !checkPin(pin)) {
      return NextResponse.json({ error: "invalid_pin" }, { status: 401 });
    }

    const token = signReviewSession(pin);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(getReviewCookieName(), token, reviewCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
