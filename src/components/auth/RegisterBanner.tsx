"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useClientReady } from "@/components/ClientBody";
import {
  buildFreePathState,
  FREE_SKILL_COUNT,
} from "@/lib/access";
import { PRODUCT_FACTS } from "@/lib/next-action";
import { useProgress } from "@/store/progress";

/** Guest CTA — everything is free; Google only unlocks the full path. */
export function RegisterBanner({ compact = false }: { compact?: boolean }) {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);

  if (!ready || !configured || loading || user) return null;

  const path = buildFreePathState(getSkillProgress);

  if (compact) {
    return (
      <Link
        href={path.allDone ? "/auth" : "/auth"}
        className="flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-white"
      >
        <span className="text-sm font-bold leading-snug">
          {PRODUCT_FACTS.skills} مهارة كلها مجانية — ادخل بحساب Google
        </span>
        <span className="shrink-0 text-teal-300">←</span>
      </Link>
    );
  }

  if (path.allDone) {
    return (
      <div className="overflow-hidden rounded-[1.75rem] bg-ink p-5 text-white shadow-lg shadow-teal-900/20">
        <p className="text-[11px] font-bold text-teal-300">كل شيء مجاني</p>
        <p className="mt-1 text-lg font-extrabold leading-snug">
          ادخل بحساب Google وافتح المسار
        </p>
        <p className="mt-1.5 text-sm text-slate-300">
          الـ {PRODUCT_FACTS.skills} مهارة والمحاكاة مجانية بالكامل — بلا اشتراك.
          حساب Google فقط.
        </p>
        <Link
          href="/auth"
          className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-teal-500 text-sm font-extrabold text-white"
        >
          المتابعة مع Google
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-bl from-teal-800 via-teal-700 to-cyan-700 p-5 text-white shadow-lg shadow-teal-800/25">
      <p className="text-[11px] font-bold text-teal-100">كل شيء مجاني</p>
      <p className="mt-1 text-lg font-extrabold leading-snug">
        {PRODUCT_FACTS.skills} مهارة — مجاناً بحساب Google
      </p>
      <p className="mt-1.5 text-sm text-teal-50/85">
        جرّب {FREE_SKILL_COUNT} مهارات بدون حساب الآن. الباقي كله مجاني أيضاً —
        فقط سجّل دخولك بحساب Google.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/auth"
          className="flex min-h-12 items-center justify-center rounded-2xl bg-white text-sm font-extrabold text-teal-900"
        >
          ادخل بحساب Google — مجاناً
        </Link>
        <Link
          href={path.nextHref}
          className="flex min-h-10 items-center justify-center text-sm font-semibold text-teal-100/90 hover:text-white"
        >
          أو جرّب بدون حساب أولاً
        </Link>
      </div>
    </div>
  );
}
