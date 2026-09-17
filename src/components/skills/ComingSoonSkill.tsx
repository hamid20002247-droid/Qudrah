import Link from "next/link";
import type { CatalogSkill, SkillField } from "@/content/catalog/fields";
import { isSkillLive } from "@/content/catalog/fields";

type Props = {
  field: SkillField;
  skill: CatalogSkill;
};

export function ComingSoonSkill({ field, skill }: Props) {
  const siblings = field.skills.filter(
    (s) => s.id !== skill.id && isSkillLive(s.id)
  );
  const nextInField = field.skills.find(
    (s) => s.order > skill.order && isSkillLive(s.id)
  );
  const firstLive = field.skills.find((s) => isSkillLive(s.id));
  const cta = nextInField ?? firstLive;

  return (
    <div className="relative mx-auto w-full max-w-lg overflow-x-hidden px-4 pb-28 pt-6">
      <div
        className="pointer-events-none absolute -start-20 top-10 h-52 w-52 rounded-full blur-3xl"
        style={{ background: `${field.accent.from}22` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-16 top-48 h-40 w-40 rounded-full bg-slate-400/10 blur-3xl"
        aria-hidden
      />

      <Link
        href={`/skills?field=${field.id}`}
        className="relative mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition hover:ring-teal-200"
      >
        <span aria-hidden>→</span>
        {field.title_ar}
      </Link>

      <div
        className="animate-fade-up relative overflow-hidden rounded-[2rem] text-white shadow-[0_28px_60px_-30px_rgba(15,23,42,0.55)]"
        style={{
          background: `linear-gradient(150deg, ${field.accent.from}, ${field.accent.to})`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.28), transparent 45%), radial-gradient(circle at 90% 90%, rgba(0,0,0,0.18), transparent 40%)",
          }}
          aria-hidden
        />
        <div className="relative px-6 pb-8 pt-8">
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/70">
            قريباً في قُدرة
          </p>
          <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight">
            {skill.title_ar}
          </h1>
          <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-white/85">
            {skill.hook_ar}
          </p>

          <div className="mt-6 rounded-[1.35rem] bg-black/20 p-4 ring-1 ring-white/15 backdrop-blur-sm">
            <p className="text-xs font-bold text-white/70">ماذا نجهّز؟</p>
            <ul className="mt-3 space-y-2.5 text-sm text-white/90">
              <li className="flex gap-2">
                <span className="text-teal-200">●</span>
                تصوّر تفاعلي يشرح هذا العنوان فقط
              </li>
              <li className="flex gap-2">
                <span className="text-teal-200">●</span>
                اختصار تحت الوقت + مصائد النمط
              </li>
              <li className="flex gap-2">
                <span className="text-teal-200">●</span>
                تدريب ونهائي بنفس أسلوب المهارات الجاهزة
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-up mt-5 rounded-[1.5rem] bg-white p-5 ring-1 ring-slate-100"
        style={{ animationDelay: "80ms" }}
      >
        <p className="text-xs font-bold text-slate-400">حدود المهارة</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          عند الإطلاق ستكون هذه المهارة عن «{skill.title_ar}» فقط — بدون خلط
          عناوين أخرى من مجال {field.title_ar}.
        </p>
      </div>

      {cta ? (
        <div
          className="animate-fade-up mt-4"
          style={{ animationDelay: "120ms" }}
        >
          <Link
            href={`/skill/${cta.id}`}
            className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-ink px-5 py-4 text-white shadow-lg shadow-slate-900/20 transition active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-slate-300">
                تدرّب الآن من نفس المجال
              </p>
              <p className="mt-0.5 font-bold">{cta.title_ar}</p>
            </div>
            <span className="text-xl text-teal-300">←</span>
          </Link>
        </div>
      ) : (
        <div
          className="animate-fade-up mt-4"
          style={{ animationDelay: "120ms" }}
        >
          <Link
            href="/skills"
            className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-teal-700 px-5 py-4 text-white shadow-lg shadow-teal-700/25 transition active:scale-[0.99]"
          >
            <div>
              <p className="text-[11px] font-semibold text-teal-100">
                لا مهارة جاهزة هنا بعد
              </p>
              <p className="mt-0.5 font-bold">تصفّح المجالات الأخرى</p>
            </div>
            <span className="text-xl">←</span>
          </Link>
        </div>
      )}

      {siblings.length > 1 && (
        <div
          className="animate-fade-up mt-6"
          style={{ animationDelay: "160ms" }}
        >
          <p className="mb-2 text-xs font-bold text-slate-400">
            جاهز في {field.title_ar}
          </p>
          <ul className="space-y-2">
            {siblings.slice(0, 4).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/skill/${s.id}`}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink ring-1 ring-slate-100 transition hover:ring-teal-200"
                >
                  {s.title_ar}
                  <span className="text-teal-700">←</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
