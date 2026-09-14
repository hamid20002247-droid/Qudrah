import { NextResponse } from "next/server";
import { getReviewCookieName } from "@/lib/review";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getReviewCookieName(), "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
