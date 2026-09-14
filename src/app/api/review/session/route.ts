import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getReviewCookieName, verifyReviewSession } from "@/lib/review";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(getReviewCookieName())?.value;
  return NextResponse.json({ ok: verifyReviewSession(token) });
}
