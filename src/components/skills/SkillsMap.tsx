"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";
import {
  SKILL_FIELDS,
  getFieldById,
  isSkillLive,
  liveSkillCountInField,
  totalCatalogSkills,
  totalLiveSkills,
  type FieldId,
  type SkillField,
} from "@/content/catalog/fields";
import { useAuth } from "@/components/auth/AuthProvider";
import { HomeSkillShowcase } from "@/components/landing/HomeSkillShowcase";
import { isSkillOpenWithoutAuth } from "@/lib/access";
import { useProgress } from "@/store/progress";
import { scrollWindowToTop } from "@/lib/scroll";
import { useClientReady } from "@/components/ClientBody";
import { track } from "@/lib/analytics";

type Props = {
  initialField?: string | null;
};

export function SkillsMap({ initialField = null }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const getSkillProgress = useProgress((s) => s.getSkillProgress);
  const [activeFieldId, setActiveFieldId] = useState<FieldId | null>(
    () => {
      if (initialField && getFieldById(initialField)) {
        return initialField as FieldId;
      }
      return null;
    }
  );
  const [entered, setEntered] = useState(false);

  const syncField = useEffectEvent((field: string | null | undefined) => {
    if (field && getFieldById(field)) {
      setActiveFieldId(field as FieldId);
    } else if (!field) {
      setActiveFieldId(null);
    }
  });

  useEffect(() => {
    syncField(initialField);
  }, [initialField]);

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const signedIn = !ready ? true : Boolean(user) || !configured;
  const authBusy = !ready || loading;
  const activeField = activeFieldId ? getFieldById(activeFieldId) : null;
  const liveTotal = totalLiveSkills();
  const catalogTotal = totalCatalogSkills();

  function openField(id: FieldId) {
    track("skills_field_opened", { field_id: id });
    setActiveFieldId(id);
    scrollWindowToTop("auto");
    startTransition(() => {
      router.replace(`/skills?field=${id}`, { scroll: false });
    });
  }

  function backToFields() {
    setActiveFieldId(null);
    scrollWindowToTop("auto");
    startTransition(() => {
      router.replace("/skills", { scroll: false });
    });
  }

  return (
    <>
    <div className="relative mx-auto w-full max-w-lg overflow-x-hidden px-4 pb-28 pt-5">
        <div
          className="pointer-events-none absolute -start-24 top-8 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-16 top-40 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />

        {!activeField ? (
          <FieldsView
            entered={entered}
            liveTotal={liveTotal}
            catalogTotal={catalogTotal}
            signedIn={signedIn}
            loading={authBusy}
            onOpen={openField}
          />
        ) : (
          <FieldSkillsView
            field={activeField}
            entered={entered}
            signedIn={signedIn}
            loading={authBusy}
            configured={configured}
            user={ready && Boolean(user)}
            getSkillProgress={getSkillProgress}
            progressReady={ready}
            onBack={backToFields}
          />
        )}
      </div>
    </>
  );
}

function FieldsView({
  entered,
  liveTotal,
  catalogTotal,
  signedIn,
  loading,
  onOpen,
}: {
  entered: boolean;
  liveTotal: number;
  catalogTotal: number;
  signedIn: boolean;
  loading: boolean;
  onOpen: (id: FieldId) => void;
}) {
  return (
    <div
      className={`relative transition duration-500 ${
        entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <p className="text-[11px] font-bold tracking-[0.18em] text-teal-700">
        مسار الكمي
      </p>
      <h1 className="mt-2 font-display text-[2rem] font-extrabold leading-tight text-ink">
        خمسة مجالات
        <span className="block text-teal-700">ستون مهارة</span>
      </h1>
      <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-slate-600">
        اختر مجالاً، ثم مهارة واحدة: تصوّر، اختصار، تدريب، ثم اختبار نهائي على
        نفس النمط.
      </p>

      <Link
        href="/mock"
        onClick={() => track("skills_map_mock_cta")}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-ink text-sm font-extrabold text-white transition active:scale-[0.99]"
      >
        ادخل الاختبار — 60 سؤالاً
      </Link>

      {!signedIn && !loading && (
        <div className="-mx-4 mt-2">
          <HomeSkillShowcase showAllSkillsCta={false} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-teal-50 px-3 py-1 font-bold tabular-nums text-teal-800 ring-1 ring-teal-100">
          {liveTotal} مهارة
        </span>
        {liveTotal < catalogTotal ? (
          <span className="text-slate-500">
            من أصل {catalogTotal} في الخطة
          </span>
        ) : (
          <span className="text-slate-500">المسار مكتمل للتدريب</span>
        )}
      </div>

      <ul className="mt-7 space-y-3">
        {SKILL_FIELDS.map((field, i) => {
          const live = liveSkillCountInField(field);
          const total = field.skills.length;
          return (
            <li
              key={field.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <button
                type="button"
                onClick={() => onOpen(field.id)}
                className="group relative flex w-full min-h-[5.75rem] overflow-hidden rounded-[1.65rem] text-start shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] transition duration-300 active:scale-[0.985]"
                style={{
                  background: `linear-gradient(135deg, ${field.accent.from}, ${field.accent.to})`,
                  boxShadow: `0 18px 40px -24px ${field.accent.ring}`,
                }}
              >
                <span
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 12% 20%, rgba(255,255,255,0.28), transparent 42%), radial-gradient(circle at 88% 80%, rgba(255,255,255,0.12), transparent 40%)",
                  }}
                  aria-hidden
                />
                <span className="relative flex flex-1 items-center gap-4 px-5 py-4 text-white">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur-sm ring-1 ring-white/25 transition duration-300 group-hover:scale-105">
                    {field.mark}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-xl font-extrabold">
                        {field.title_ar}
                      </span>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold text-white/90">
                        {field.share_label}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-sm text-white/80">
                      {field.subtitle_ar}
                    </span>
                    <span className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-white/70">
                      <span className="tabular-nums">
                        {total} مهارة
                      </span>
                      <span className="h-1 w-1 rounded-full bg-white/50" />
                      <span className="tabular-nums text-teal-100">
                        {live === 0
                          ? "قريباً"
                          : live === total
                            ? "مكتمل"
                            : `${live} للتدريب`}
                      </span>
                    </span>
                  </span>
                  <span className="text-2xl text-white/80 transition duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FieldSkillsView({
  field,
  entered,
  signedIn,
  loading,
  configured,
  user,
  getSkillProgress,
  progressReady,
  onBack,
}: {
  field: SkillField;
  entered: boolean;
  signedIn: boolean;
  loading: boolean;
  configured: boolean;
  user: boolean;
  getSkillProgress: (id: string) => {
    started: boolean;
    completed: boolean;
  };
  progressReady: boolean;
  onBack: () => void;
}) {
  const live = liveSkillCountInField(field);

  return (
    <div
      className={`relative transition duration-500 ${
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition hover:ring-teal-200"
      >
        <span aria-hidden>→</span>
        كل المجالات
      </button>

      <div
        className="overflow-hidden rounded-[1.75rem] text-white shadow-[0_24px_50px_-28px_rgba(15,23,42,0.5)]"
        style={{
          background: `linear-gradient(145deg, ${field.accent.from}, ${field.accent.to})`,
        }}
      >
        <div className="relative px-5 pb-6 pt-6">
          <div
            className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-white/70">
                مجال · {field.share_label} من الكمي
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold">
                {field.title_ar}
              </h1>
              <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-white/80">
                {field.blurb_ar}
              </p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold ring-1 ring-white/20">
              {field.mark}
            </span>
          </div>
          <div className="mt-5 flex gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-white/15 px-3 py-1 tabular-nums ring-1 ring-white/20">
              {field.skills.length} مهارة
            </span>
            <span className="rounded-full bg-black/20 px-3 py-1 tabular-nums">
              {live === field.skills.length
                ? "مكتمل للتدريب"
                : live === 0
                  ? "قريباً"
                  : `${live} من ${field.skills.length} للتدريب`}
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {field.skills.map((skill, idx) => {
          const liveSkill = isSkillLive(skill.id);
          const p = progressReady
            ? getSkillProgress(skill.id)
            : { started: false, completed: false };
          const freeOpen = isSkillOpenWithoutAuth(skill.id);
          const locked =
            liveSkill &&
            configured &&
            !loading &&
            !user &&
            !freeOpen;

          // Always open the skill page — SkillAccessGate shows real UI + signup sheet
          const href = `/skill/${skill.id}`;

          const chip = !liveSkill
            ? { label: "قريباً", cls: "bg-slate-900/90 text-white" }
            : locked
              ? { label: "سجّل", cls: "bg-slate-900 text-white" }
              : p.completed
                ? { label: "مكتملة", cls: "bg-green-100 text-green-800" }
                : p.started
                  ? { label: "جارٍ", cls: "bg-amber-100 text-amber-900" }
                  : freeOpen && !user
                    ? { label: "بدون حساب", cls: "bg-teal-100 text-teal-800" }
                    : { label: "جاهزة", cls: "bg-teal-50 text-teal-800" };

          return (
            <li
              key={skill.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(idx, 12) * 40}ms` }}
            >
              <Link
                href={href}
                className={`flex min-h-[4.75rem] items-center gap-3 rounded-[1.35rem] p-3.5 transition active:scale-[0.99] ${
                  liveSkill
                    ? locked
                      ? "bg-slate-50 ring-1 ring-slate-200"
                      : freeOpen && !user
                        ? "bg-white ring-2 ring-teal-400 shadow-[0_12px_28px_-18px_rgba(13,148,136,0.55)]"
                        : "bg-white ring-1 ring-slate-100 hover:ring-teal-300"
                    : "bg-gradient-to-l from-slate-50 to-white ring-1 ring-dashed ring-slate-200"
                }`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl text-[11px] font-extrabold ${
                    liveSkill
                      ? locked
                        ? "bg-slate-200 text-slate-500"
                        : "text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                  style={
                    liveSkill && !locked
                      ? {
                          background: `linear-gradient(145deg, ${field.accent.from}, ${field.accent.to})`,
                        }
                      : undefined
                  }
                >
                  <span className="text-[9px] font-bold opacity-70">
                    {skill.order}
                  </span>
                  <span className="leading-none">
                    {locked ? "سجّل" : liveSkill ? "افتح" : "…"}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`font-bold ${
                        liveSkill ? "text-ink" : "text-slate-600"
                      }`}
                    >
                      {skill.title_ar}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${chip.cls}`}
                    >
                      {chip.label}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                    {liveSkill
                      ? skill.hook_ar
                      : "نجهّز تصوّراً واختصاراً وتدريباً خاصاً بهذا العنوان فقط"}
                  </p>
                </div>
                <span
                  className={`text-lg ${
                    liveSkill ? "text-teal-700" : "text-slate-300"
                  }`}
                >
                  ←
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
