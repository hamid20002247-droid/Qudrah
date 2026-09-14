"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";
import { ChoiceList } from "@/components/ui/ChoiceList";
import { GuestFreePath } from "@/components/auth/GuestFreePath";
import { RegisterBanner } from "@/components/auth/RegisterBanner";
import { HomeDashboard } from "@/components/landing/HomeDashboard";
import { useAuth } from "@/components/auth/AuthProvider";
import { LANDING_QUESTION } from "@/content/mock/pool";
import { track, trackLandingView, identifyDevice } from "@/lib/analytics";
import { useProgress } from "@/store/progress";
import { PRODUCT_FACTS } from "@/lib/next-action";
import { FREE_SKILL_ID } from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";

export function LandingPage() {
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const deviceId = useProgress((s) => s.deviceId);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const engaged = useRef(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (!ready || viewed.current) return;
    viewed.current = true;
    identifyDevice(deviceId);
    trackLandingView();
  }, [ready, deviceId]);

  const onVisual = () => {
    if (engaged.current) return;
    engaged.current = true;
    track("interactive_engaged");
  };

  const answer = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    track("landing_question_answered", {
      correct: i === LANDING_QUESTION.correct_index,
    });
  };

  const signedIn = ready && configured && !loading && Boolean(user);

  // Avoid flashing the guest marketing page for returning users
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
    <div className="mx-auto max-w-lg">
      <section className="relative overflow-hidden px-4 pb-6 pt-5">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 80% -10%, rgba(13,148,136,0.16), transparent), linear-gradient(180deg, #F0FDFA 0%, #F8FAFC 55%, #FFFFFF 100%)",
          }}
        />

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-teal-700 px-3 py-1 text-[11px] font-bold text-white">
            القسم الكمي
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {PRODUCT_FACTS.skills} مهارة
          </span>
        </div>

        <h1 className="mt-4 text-[1.7rem] font-extrabold leading-snug text-ink">
          قدرات كمي: افهم النمط، وحُلّ أسرع.
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          مسار منظم على أنماط الكمي الأكثر تكراراً — تصوّر، اختصار، تدريب موقوت،
          ثم محاكاة كاملة بستين سؤالاً.
        </p>

        <ol className="mt-5 grid grid-cols-3 gap-2">
          {[
            { n: "1", t: "تصوّر", d: "شاهد الفكرة" },
            { n: "2", t: "اختصار", d: "احفظ الحيلة" },
            { n: "3", t: "تدريب", d: "حلّ بسرعة" },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-2xl bg-white/90 px-2 py-3 text-center ring-1 ring-teal-100"
            >
              <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">
                {s.n}
              </span>
              <p className="mt-1.5 text-sm font-bold text-ink">{s.t}</p>
              <p className="text-[10px] text-slate-500">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <GuestFreePath variant="hero" />
        </div>

        {configured && (
          <div className="mt-4">
            <RegisterBanner />
          </div>
        )}

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
          قُدرة اسم الأداة · غير تابعة لقياس أو هيئة تقويم التعليم
        </p>
      </section>

      <section className="space-y-6 border-t border-slate-100 px-4 py-8">
        <div>
          <p className="text-xs font-bold text-teal-700">المفهوم الأصعب أولاً</p>
          <h2 className="mt-1 text-xl font-extrabold leading-snug text-ink">
            لماذا 80→100 = 25٪ وليس 20٪؟
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            حرّك. وش يصير؟
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            اسحب المقبض الأسود على العمود الأخضر. راقب النسبة في الصندوق.
            يمكنك فتح «المصيدة الشائعة».
          </p>
          <div className="mt-4">
            <VisualRenderer
              spec={{ kind: "custom", component: "percent-change-lab" }}
              onInteract={onVisual}
              compact
            />
          </div>
          <Link
            href={`/skill/${FREE_SKILL_ID}`}
            className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-teal-50 font-bold text-teal-800 ring-1 ring-teal-100"
          >
            افتح المهارة كاملة: التغيّر المئوي
          </Link>
        </div>

        <div>
          <p className="text-xs font-bold text-teal-700">وبعدها بدون حساب</p>
          <h2 className="mt-1 text-xl font-extrabold leading-snug text-ink">
            آلتان للنسب المتتالية + مثلث فيثاغورس
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            كل المهارات مجانية بحساب Google. هذه الثلاث مفتوحة للتجربة الآن —
            الروابط في أعلى الصفحة.
          </p>
          <GuestFreePath variant="panel" className="mt-4" />
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="mb-1 text-xs font-bold text-teal-700">
            طبّق الآن — سؤال على نمط الاختبار
          </p>
          <p className="mb-3 text-lg font-bold leading-snug text-ink">
            {LANDING_QUESTION.prompt_ar}
          </p>
          <ChoiceList
            choices={LANDING_QUESTION.choices_ar}
            selected={selected}
            correctIndex={LANDING_QUESTION.correct_index}
            showResult={revealed}
            onSelect={answer}
          />
          {revealed && selected === LANDING_QUESTION.correct_index && (
            <p className="mt-3 text-sm font-semibold text-green-700">تمام.</p>
          )}
          {revealed && selected !== LANDING_QUESTION.correct_index && (
            <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-950 ring-1 ring-rose-100">
              <p className="font-bold">خطأ</p>
              <p className="mt-1 leading-relaxed">
                {selected !== null
                  ? LANDING_QUESTION.trap_explanations_ar[selected]
                  : ""}
              </p>
              <Link
                href={`/skill/${FREE_SKILL_ID}`}
                className="mt-2 inline-block font-bold text-teal-700"
              >
                افتح التصوّر وجرّب السحب ←
              </Link>
            </div>
          )}
        </div>

        {configured && <RegisterBanner compact />}

        <div className="rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-sm font-bold">
            {PRODUCT_FACTS.fields} مجالات · {PRODUCT_FACTS.skills} مهارة
          </p>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
            <li>
              <span className="font-bold text-white">
                حساب · جبر · هندسة · إحصاء · مقارنات
              </span>
            </li>
            <li>
              <span className="font-bold text-white">
                {PRODUCT_FACTS.skillBankQuestions.toLocaleString("ar-SA")} سؤالاً
              </span>{" "}
              في بنك المهارات — تدريب موقوت لكل نمط
            </li>
            <li>
              <span className="font-bold text-white">
                محاكاة {PRODUCT_FACTS.mockQuestions} سؤالاً
              </span>{" "}
              · {PRODUCT_FACTS.mockMinutes} دقيقة · أسئلة جديدة كل مرة
            </li>
          </ul>
          <Link
            href="/auth"
            className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-teal-500 font-bold text-white"
          >
            ادخل بحساب Google — مجاناً
          </Link>
        </div>
      </section>
    </div>
  );
}
