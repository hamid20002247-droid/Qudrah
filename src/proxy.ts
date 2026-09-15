import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets, images, and the PostHog reverse proxy.
     * `/ingest/e`, `/ingest/s`, `/ingest/flags` have no file extension — a
     * catch-all matcher would intercept them before the rewrite runs.
     */
    "/((?!_next/static|_next/image|favicon.ico|ingest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
