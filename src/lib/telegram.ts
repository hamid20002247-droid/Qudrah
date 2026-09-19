/**
 * Server-only Telegram signup alerts (Bot API is free).
 * Do not import this module from client components.
 *
 * Secrets live in Vercel / .env.local only — never commit them:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 */

function env(name: string): string | null {
  const v = process.env[name]?.trim();
  return v || null;
}

export type SignupAlert = {
  email?: string | null;
  name?: string | null;
  provider?: string | null;
  userId?: string | null;
  city?: string | null;
  country?: string | null;
};

export function isTelegramConfigured(): boolean {
  return Boolean(env("TELEGRAM_BOT_TOKEN") && env("TELEGRAM_CHAT_ID"));
}

/** True if the auth user was created in the last few minutes (likely a new signup). */
export function isLikelyNewSignup(
  createdAt: string | null | undefined,
  windowMs = 10 * 60 * 1000
): boolean {
  if (!createdAt) return false;
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < windowMs;
}

function header(req: Request | null | undefined, name: string): string | null {
  if (!req) return null;
  const v = req.headers.get(name)?.trim();
  return v || null;
}

function clientIp(req: Request | null | undefined): string | null {
  if (!req) return null;
  const forwarded = header(req, "x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    header(req, "x-real-ip") ||
    header(req, "cf-connecting-ip") ||
    header(req, "x-vercel-forwarded-for")
  );
}

/**
 * Prefer Vercel edge geo headers; fall back to free ip-api.com for city/country.
 */
export async function resolveSignupLocation(
  req: Request | null | undefined
): Promise<{ city: string | null; country: string | null }> {
  const vercelCity = header(req, "x-vercel-ip-city");
  const vercelCountry =
    header(req, "x-vercel-ip-country") ||
    header(req, "cf-ipcountry");

  if (vercelCity || vercelCountry) {
    return {
      city: vercelCity ? decodeURIComponent(vercelCity) : null,
      country: vercelCountry,
    };
  }

  const ip = clientIp(req);
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip === "localhost") {
    return { city: null, country: null };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,countryCode`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return { city: null, country: null };
    const data = (await res.json()) as {
      status?: string;
      city?: string;
      country?: string;
      countryCode?: string;
    };
    if (data.status !== "success") return { city: null, country: null };
    return {
      city: data.city ?? null,
      country: data.country || data.countryCode || null,
    };
  } catch {
    return { city: null, country: null };
  }
}

export async function sendTelegramSignupAlert(
  info: SignupAlert
): Promise<boolean> {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return false;

  const when = new Date().toLocaleString("en-GB", {
    timeZone: "Africa/Casablanca",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const place =
    info.city && info.country
      ? `${info.city}, ${info.country}`
      : info.city || info.country || "—";

  const lines = [
    "🆕 قُدرة — تسجيل جديد",
    "",
    `الاسم: ${info.name?.trim() || "—"}`,
    `البريد: ${info.email?.trim() || "—"}`,
    `الموقع: ${place}`,
    `الطريقة: ${info.provider?.trim() || "google"}`,
    `الوقت: ${when}`,
  ];

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[telegram] send failed", res.status, body.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] send error", err);
    return false;
  }
}
