import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Explicit reverse proxy for PostHog.
 * Plain next.config rewrites on Vercel were returning 400 on /e/ and /i/v0/e/
 * ("missing event name") even with a valid client body. Forwarding the raw
 * body + Host header here is the reliable path.
 */
async function proxyPostHog(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAssets =
    pathname.startsWith("/ingest/static/") ||
    pathname.startsWith("/ingest/array/");
  const hostname = isAssets
    ? "us-assets.i.posthog.com"
    : "us.i.posthog.com";
  const upstreamPath = pathname.replace(/^\/ingest/, "") || "/";
  const upstreamUrl = `https://${hostname}${upstreamPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const pass = [
    "accept",
    "accept-language",
    "content-type",
    "content-encoding",
    "user-agent",
    "origin",
    "referer",
  ] as const;
  for (const name of pass) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("host", hostname);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(upstreamUrl, init);
  const body = await upstream.arrayBuffer();

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "transfer-encoding" ||
      lower === "connection" ||
      lower === "keep-alive" ||
      lower === "content-encoding"
    ) {
      return;
    }
    responseHeaders.set(key, value);
  });

  return new NextResponse(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    return proxyPostHog(request);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/ingest/:path*",
    "/((?!_next/static|_next/image|favicon.ico|ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
