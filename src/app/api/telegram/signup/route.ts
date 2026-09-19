import { NextResponse } from "next/server";
import {
  isTelegramConfigured,
  resolveSignupLocation,
  sendTelegramAuthAlert,
  type AuthAlertKind,
} from "@/lib/telegram";

/**
 * Manual smoke test for auth alerts.
 * Requires TELEGRAM_NOTIFY_SECRET header match.
 * POST JSON: { email, display_name, provider, kind? }
 */
export async function POST(request: Request) {
  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, error: "telegram_not_configured" },
      { status: 503 }
    );
  }

  const secret = process.env.TELEGRAM_NOTIFY_SECRET?.trim();
  const given = request.headers.get("x-telegram-secret")?.trim();
  if (!secret || given !== secret) {
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
  const rawKind = String(record.kind ?? body.kind ?? "signup");
  const kind: AuthAlertKind =
    rawKind === "signin" ? "signin" : "signup";

  const ok = await sendTelegramAuthAlert({
    kind,
    email: (record.email as string | undefined) ?? null,
    name: (record.display_name as string | undefined) ?? null,
    provider: (record.provider as string | undefined) ?? "google",
    userId: (record.id as string | undefined) ?? null,
    city: loc.city,
    country: loc.country,
  });

  return NextResponse.json({ ok, kind, location: loc });
}
