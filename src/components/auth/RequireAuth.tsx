"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  authHref,
  buildFreePathState,
  FREE_SKILL_COUNT,
} from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { PRODUCT_FACTS } from "@/lib/next-action";
import { useProgress } from "@/store/progress";

/** Blocks page content until the user is signed in (Google). */
export function RequireAuth({
  children,
  next,
  title = "سجّل دخولك للمتابعة",
  body,
}: {
  children: React.ReactNode;
  next?: string;
  title?: string;
  body?: string;
}) {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const pathname = usePathname() || "/";
  const after = next || pathname;
  const getSkillProgress = useProgress((s) => s.getSkillProgress);

  if (!configured) return <>{children}</>;

  // Same shell on server + first client paint
  if (!ready || loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  const path = buildFreePathState(getSkillProgress);
  const defaultBody = path.allDone
    ? `كل شيء مجاني: الـ ${PRODUCT_FACTS.skills} مهارة والاختبار. ادخل بحساب Google فقط.`
    : `كل شيء مجاني بحساب Google. لديك ${FREE_SKILL_COUNT} مهارات للتجربة بدون حساب الآن.`;

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.2),_transparent_60%)]"
        aria-hidden
      />
      <div className="overflow-hidden rounded-[2rem] bg-ink px-6 py-9 text-white shadow-2xl shadow-teal-900/20">
        <p className="text-xs font-bold tracking-wide text-teal-300">
          كل شيء مجاني
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-snug">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {body ?? defaultBody}
        </p>
        <Link
          href={authHref(after)}
          className="mt-7 flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400"
        >
          سجّل دخولك مع Google — مجاناً
        </Link>
        {!path.allDone && (
          <Link
            href={path.nextHref}
            className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-slate-400 hover:text-white"
          >
            أو جرّب بدون حساب أولاً
          </Link>
        )}
      </div>
    </div>
  );
}
