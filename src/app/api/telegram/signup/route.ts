import { NextResponse } from "next/server";
import {
  resolveSignupLocation,
  sendTelegramSignupAlert,
} from "@/lib/telegram";

/** Hardcoded gate for the manual test endpoint (not for browsers). */
const NOTIFY_SECRET = "qudrah-tg-notify-7f3a9c";

/**
 * Manual smoke test for signup alerts.
 * Header: x-telegram-secret: qudrah-tg-notify-7f3a9c
 * POST JSON: { email, display_name, provider }
 */
export async function POST(request: Request) {
  const given = request.headers.get("x-telegram-secret")?.trim();
  if (given !== NOTIFY_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const record =
    (body.record as Record<string, unknown> | undefined) ?? body;
  const loc = await resolveSignupLocation(request);

  const ok = await sendTelegramSignupAlert({
    email: (record.email as string | undefined) ?? null,
    name: (record.display_name as string | undefined) ?? null,
    provider: (record.provider as string | undefined) ?? "google",
    userId: (record.id as string | undefined) ?? null,
    city: loc.city,
    country: loc.country,
  });

  return NextResponse.json({ ok, location: loc });
}
