"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { getSkillById } from "@/content/arithmetic";
import { FREE_SKILL_IDS } from "@/lib/access";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";
import { track } from "@/lib/analytics";
import type { VisualSpec } from "@/lib/types";

const HINTS: Record<string, string> = {
  "percent-change": "اسحب العمود الأخضر",
  "successive-percent": "اضغط الآلات ثم شغّل",
  pythagoras: "حرّك ضلع المثلث",
};

const AUTO_MS = 5000;
const SWIPE_MIN = 48;

type Slide = {
  id: string;
  title_ar: string;
  hint: string;
  visual: VisualSpec;
};

/**
 * One full-width free skill at a time.
 * Auto-scrolls every 5s — no auto-demo. Lab is live for the student to try.
 */
export function HomeSkillShowcase({
  showAllSkillsCta = true,
}: {
  showAllSkillsCta?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const indexRef = useRef(0);
  const interactedRef = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<"undecided" | "x" | "y">("undecided");

  const slides: Slide[] = FREE_SKILL_IDS.flatMap((id) => {
    const skill = getSkillById(id);
    const visual = skill?.visual;
    if (!visual) return [];
    return [
      {
        id,
        title_ar: skill.title_ar ?? id,
        hint: HINTS[id] ?? "جرّب بنفسك",
        visual,
      },
    ];
  });

  const n = slides.length;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  /** Pin «تأسيس» — only after the student changes slides (never on auto / first paint). */
  const pinToHeading = useCallback(() => {
    const el = headingRef.current;
    if (!el) return;
    const sticky = document.querySelector("header.sticky");
    const offset = (sticky?.getBoundingClientRect().height ?? 56) + 10;
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const goTo = useCallback(
    (next: number, opts?: { pin?: boolean }) => {
      if (n === 0) return;
      const safe = ((next % n) + n) % n;
      setIndex(safe);
      setSlideKey((k) => k + 1);
      interactedRef.current = false;
      if (opts?.pin) {
        // After paint so slide height is settled
        requestAnimationFrame(() => pinToHeading());
      }
    },
    [n, pinToHeading]
  );

  const pauseAuto = useCallback((ms = 12000) => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), ms);
  }, []);

  const onAutoTick = useEffectEvent(() => {
    if (paused || n < 2 || pointerId.current != null) return;
    // Silent rotate — never yank the page away from exams
    goTo(indexRef.current + 1);
  });

  useEffect(() => {
    if (n < 2) return;
    const id = window.setInterval(() => onAutoTick(), AUTO_MS);
    return () => window.clearInterval(id);
  }, [n, onAutoTick, paused]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const onSwipeDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerId.current = e.pointerId;
    startX.current = e.clientX;
    startY.current = e.clientY;
    axis.current = "undecided";
    pauseAuto(8000);
    try {
      swipeRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onSwipeMove = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (axis.current === "undecided") {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      axis.current = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      if (axis.current === "y") {
        try {
          swipeRef.current?.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        pointerId.current = null;
      }
    }
    if (axis.current === "x") e.preventDefault();
  };

  const onSwipeEnd = (e: React.PointerEvent) => {
    if (pointerId.current !== e.pointerId) return;
    const dx = e.clientX - startX.current;
    const wasX = axis.current === "x";
    pointerId.current = null;
    axis.current = "undecided";
    if (!wasX || Math.abs(dx) < SWIPE_MIN) return;
    goTo(dx < 0 ? indexRef.current + 1 : indexRef.current - 1, { pin: true });
    track("landing_skill_swipe", {
      skill_id: slides[indexRef.current]?.id,
      dir: dx < 0 ? "next" : "prev",
    });
  };

  if (n === 0) return null;
  const slide = slides[index]!;

  return (
    <section className="px-4 py-8" aria-labelledby="home-skills-title">
      <div ref={headingRef} className="mb-5">
        <p className="font-display text-[1.35rem] font-extrabold tracking-tight text-teal-700">
          تأسيس
        </p>
        <h2
          id="home-skills-title"
          className="mt-1 font-display text-[1.7rem] font-extrabold leading-snug text-ink"
        >
          جرب محاكاة الآن
        </h2>
      </div>

      <div className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/90">
        {/* Swipe zone: header only — lab stays free for hands */}
        <div
          ref={swipeRef}
          className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5"
          style={{ touchAction: "pan-y" }}
          onPointerDown={onSwipeDown}
          onPointerMove={onSwipeMove}
          onPointerUp={onSwipeEnd}
          onPointerCancel={onSwipeEnd}
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-teal-700">
              بدون حساب · {index + 1}/{n}
            </p>
            <h3 className="mt-0.5 truncate text-[16px] font-extrabold text-ink">
              {slide.title_ar}
            </h3>
          </div>
          <Link
            href={`/skill/${slide.id}`}
            onClick={() =>
              track("landing_skill_demo_open", { skill_id: slide.id })
            }
            className="shrink-0 rounded-full bg-ink px-3.5 py-2 text-[12px] font-extrabold text-white"
          >
            ابدأ المهارة
          </Link>
        </div>

        {/* Clear invite — never covers the lab */}
        <div className="flex items-center justify-between gap-2 border-b border-teal-50 bg-teal-50/80 px-4 py-2.5">
          <p className="text-[13px] font-extrabold text-teal-900">
            <span className="me-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-teal-500 align-middle" />
            مسّها: {slide.hint}
          </p>
          <span className="shrink-0 text-[11px] font-bold text-teal-700/70">
            أنت تتحكّم
          </span>
        </div>

        <div
          key={`${slide.id}-${slideKey}`}
          className="animate-fade-up p-3 pt-2"
          data-skill-demo={slide.id}
          onPointerDownCapture={() => {
            pauseAuto(16000);
            if (!interactedRef.current) {
              interactedRef.current = true;
              track("landing_skill_interact", { skill_id: slide.id });
            }
          }}
        >
          <VisualRenderer
            spec={slide.visual}
            skillId={slide.id}
            compact
            autoDemo={false}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="السابق"
          onClick={() => {
            pauseAuto(8000);
            goTo(index - 1, { pin: true });
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 ring-1 ring-slate-200"
        >
          ›
        </button>
        <div className="flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.title_ar}
              aria-current={i === index ? "true" : undefined}
              onClick={() => {
                pauseAuto(8000);
                goTo(i, { pin: true });
                track("landing_skill_dot", { skill_id: s.id, index: i });
              }}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-teal-600"
                  : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="التالي"
          onClick={() => {
            pauseAuto(8000);
            goTo(index + 1, { pin: true });
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 ring-1 ring-slate-200"
        >
          ‹
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] font-semibold text-slate-400">
        يتبدّل كل ٥ ثوانٍ · اسحب من العنوان أو النقاط
      </p>

      {showAllSkillsCta && (
        <Link
          href="/skills"
          onClick={() => track("landing_skills_map")}
          className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-50 text-[14px] font-extrabold text-teal-900 ring-1 ring-teal-100 transition active:scale-[0.99]"
        >
          اذهب لكل المهارات
        </Link>
      )}
    </section>
  );
}
