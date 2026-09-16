import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Node route handler reverse-proxy for PostHog.
 * Edge middleware was corrupting gzip capture bodies → 400
 * "missing event name". Node forwards bytes unchanged.
 */
async function proxyToPostHog(request: NextRequest) {
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
  for (const name of [
    "accept",
    "content-type",
    "content-encoding",
    "user-agent",
    "origin",
    "referer",
  ] as const) {
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
    init.body = Buffer.from(await request.arrayBuffer());
  }

  const upstream = await fetch(upstreamUrl, init);
  const body = Buffer.from(await upstream.arrayBuffer());

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

export async function GET(request: NextRequest) {
  return proxyToPostHog(request);
}

export async function POST(request: NextRequest) {
  return proxyToPostHog(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyToPostHog(request);
}
