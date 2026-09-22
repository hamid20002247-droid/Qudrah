"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HomeDashboard } from "@/components/landing/HomeDashboard";
import { HomeExamShowcase } from "@/components/landing/HomeExamShowcase";
import { HomeSkillShowcase } from "@/components/landing/HomeSkillShowcase";
import { useAuth } from "@/components/auth/AuthProvider";
import { track, trackLandingView, identifyDevice } from "@/lib/analytics";
import { useProgress } from "@/store/progress";
import { useClientReady } from "@/components/ClientBody";

export function LandingPage() {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const deviceId = useProgress((s) => s.deviceId);
  const viewed = useRef(false);

  useEffect(() => {
    if (!ready || viewed.current) return;
    viewed.current = true;
    identifyDevice(deviceId);
    trackLandingView();
  }, [ready, deviceId]);

  const signedIn = ready && configured && !loading && Boolean(user);

  if (!ready || (configured && loading)) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  if (signedIn) {
    return <HomeDashboard />;
  }

  return (
    <div className="mx-auto w-full max-w-lg overflow-x-hidden pb-8">
      {/* Quiet brand — exams own the first screen */}
      <section className="relative px-4 pb-6 pt-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.14),_transparent_70%)]"
          aria-hidden
        />
        <p className="font-display text-[2.4rem] font-extrabold leading-none tracking-tight text-teal-800">
          قُدرة
        </p>
        <h1 className="mt-3 max-w-[17rem] text-[1.45rem] font-extrabold leading-snug text-ink">
          اختبار قدرات كمي
        </h1>
        <p className="mt-2 max-w-[20rem] text-[14px] leading-relaxed text-slate-600">
          ادخل اختباراً كاملاً الآن — أو أسّس الفكرة بلمس تصوّر حيّ.
        </p>
      </section>

      <HomeExamShowcase />
      <HomeSkillShowcase />

      <section className="mx-4 mb-4 rounded-[1.4rem] bg-slate-950 px-5 py-6 text-center text-white">
        <p className="text-[15px] font-extrabold leading-snug">
          احفظ درجتك على كل أجهزتك
        </p>
        <p className="mt-1.5 text-[12px] font-semibold text-white/60">
          Google مجاناً — دقيقة واحدة
        </p>
        <Link
          href="/auth"
          onClick={() => track("landing_save_progress_cta")}
          className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-white text-[15px] font-extrabold text-ink transition active:scale-[0.99]"
        >
          سجّل دخولك
        </Link>
      </section>
    </div>
  );
}
