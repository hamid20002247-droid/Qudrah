import type { Metadata } from "next";
import { getSkillById, ALL_SKILLS } from "@/content/arithmetic";
import {
  allCatalogSkillIds,
  getCatalogSkill,
  isSkillLive,
} from "@/content/catalog/fields";
import { SkillAccessGate } from "@/components/auth/SkillAccessGate";
import { SkillExperience } from "@/components/skill/SkillExperience";
import { ComingSoonSkill } from "@/components/skills/ComingSoonSkill";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { authHrefForSkill } from "@/lib/access";

type Props = { params: Promise<{ id: string }> };

/** Allow any catalog / live id even if not in the last static build. */
export const dynamicParams = true;

export function generateStaticParams() {
  const ids = new Set([
    ...ALL_SKILLS.map((s) => s.id),
    ...allCatalogSkillIds(),
  ]);
  return [...ids].map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const live = getSkillById(id);
  if (live) {
    return buildPageMetadata({
      title: live.title_ar,
      description: live.hook_ar,
      path: `/skill/${id}`,
    });
  }
  const catalog = getCatalogSkill(id);
  if (catalog) {
    return buildPageMetadata({
      title: `${catalog.skill.title_ar} — قريباً`,
      description: catalog.skill.hook_ar,
      path: `/skill/${id}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: "مهارة",
    description: "تدريب مهارة من القسم الكمي في اختبار القدرات.",
    path: `/skill/${id}`,
    noIndex: true,
  });
}

/** Unknown skill id — Arabic gate, never English Next.js 404. */
function UnknownSkillFallback({ id }: { id: string }) {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.2),_transparent_60%)]"
        aria-hidden
      />
      <div className="overflow-hidden rounded-[2rem] bg-ink px-6 py-9 text-white shadow-2xl shadow-teal-900/20">
        <p className="font-display text-3xl font-extrabold text-teal-300">
          قُدرة
        </p>
        <h1 className="mt-4 text-2xl font-extrabold leading-snug">
          سجّل دخولك
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          هذه المهارة غير متاحة بهذا الرابط. سجّل دخولك أو افتح خريطة المهارات.
        </p>
        <Link
          href={authHrefForSkill(id)}
          className="mt-7 flex min-h-14 items-center justify-center rounded-2xl bg-teal-500 text-base font-extrabold text-white transition hover:bg-teal-400"
        >
          سجّل دخولك مع Google — مجاناً
        </Link>
        <Link
          href="/skills"
          className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-slate-400 hover:text-white"
        >
          خريطة المهارات
        </Link>
      </div>
    </div>
  );
}

export default async function SkillPage({ params }: Props) {
  const { id } = await params;
  const catalog = getCatalogSkill(id);

  if (isSkillLive(id)) {
    const skill = getSkillById(id);
    if (!skill) {
      return <UnknownSkillFallback id={id} />;
    }
    const publicSkill = {
      ...skill,
      drill: skill.drill.filter((q) => q.review_status === "approved"),
    };
    return (
      <SkillAccessGate
        skillId={publicSkill.id}
        skillTitle={publicSkill.title_ar}
      >
        <SkillExperience skill={publicSkill} />
      </SkillAccessGate>
    );
  }

  if (catalog) {
    return <ComingSoonSkill field={catalog.field} skill={catalog.skill} />;
  }

  return <UnknownSkillFallback id={id} />;
}
