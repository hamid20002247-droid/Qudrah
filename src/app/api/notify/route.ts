import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      contact?: string;
      contact_type?: string;
      device_id?: string;
      test_date?: string | null;
    };

    const contact = body.contact?.trim();
    if (!contact || contact.length < 5) {
      return NextResponse.json({ error: "invalid_contact" }, { status: 400 });
    }

    const contact_type =
      body.contact_type ||
      (contact.includes("@") ? "email" : "phone");

    const supabase = getSupabase();
    if (!supabase) {
      // Graceful degrade: accept locally so UX works without Supabase in demo
      console.info("[notify_leads:fallback]", {
        contact,
        contact_type,
        device_id: body.device_id,
        test_date: body.test_date,
      });
      return NextResponse.json({ ok: true, stored: "fallback" });
    }

    const { error } = await supabase.from("notify_leads").insert({
      contact,
      contact_type,
      device_id: body.device_id ?? null,
      test_date: body.test_date || null,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stored: "supabase" });
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
}
