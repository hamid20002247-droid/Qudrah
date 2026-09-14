"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  authHrefForSkill,
  buildFreePathState,
  FREE_SKILL_COUNT,
  isSkillOpenWithoutAuth,
} from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { useProgress } from "@/store/progress";
import { GuestFreePath } from "@/components/auth/GuestFreePath";
import { PRODUCT_FACTS } from "@/lib/next-action";

/** Blocks locked skills for guests; preview skills + signed-in users pass through. */
export function SkillAccessGate({
  skillId,
  children,
}: {
  skillId: string;
  children: React.ReactNode;
}) {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);

  if (!configured || isSkillOpenWithoutAuth(skillId)) {
    return <>{children}</>;
  }

  if (!ready || loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
      </div>
    );
  }

  if (user) return <>{children}</>;

  const path = buildFreePathState(getSkillProgress);

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
          افتح هذه المهارة بحساب Google
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          الـ {PRODUCT_FACTS.skills} مهارة كلها مجانية — بلا اشتراك. حساب Google
          فقط لفتح المسار كامل وحفظ تقدّمك.
          {!path.allDone
            ? ` يمكنك أيضاً تجريب ${FREE_SKILL_COUNT} مهارات بدون حساب الآن.`
            : ""}
        </p>
        <Link
          href={authHrefForSkill(skillId)}
          className="mt-7 flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400"
        >
          المتابعة مع Google — مجاناً
        </Link>
        {!path.allDone && path.nextId && (
          <Link
            href={path.nextHref}
            className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-slate-400 hover:text-white"
          >
            أو جرّب مهارة بدون حساب
          </Link>
        )}
      </div>
      {!path.allDone && (
        <div className="mt-4">
          <GuestFreePath variant="panel" />
        </div>
      )}
    </div>
  );
}
