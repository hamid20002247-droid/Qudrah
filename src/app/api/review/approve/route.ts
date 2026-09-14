import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getReviewCookieName,
  verifyReviewSession,
} from "@/lib/review";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(getReviewCookieName())?.value;
  if (!verifyReviewSession(token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      id?: string;
      kind?: string;
      sub_pattern?: string;
      source?: string;
    };
    if (!body.id) {
      return NextResponse.json({ error: "missing_id" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { ok: true, stored: "noop", hint: "set SUPABASE to persist" },
        { status: 200 }
      );
    }

    const { error } = await supabase.from("questions_audit").upsert({
      id: body.id,
      sub_pattern: body.sub_pattern ?? null,
      source: body.source ?? "review-panel",
      review_status: "approved",
      reviewed_by: "reviewer",
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
