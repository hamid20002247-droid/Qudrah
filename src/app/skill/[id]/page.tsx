import { notFound } from "next/navigation";
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

type Props = { params: Promise<{ id: string }> };

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
    return {
      title: live.title_ar,
      description: live.hook_ar,
      alternates: { canonical: `/skill/${id}` },
      openGraph: {
        title: `${live.title_ar} | قُدرة`,
        description: live.hook_ar,
      },
    };
  }
  const catalog = getCatalogSkill(id);
  if (catalog) {
    return {
      title: `${catalog.skill.title_ar} — قريباً`,
      description: catalog.skill.hook_ar,
      robots: { index: false, follow: true },
    };
  }
  return { title: "مهارة" };
}

export default async function SkillPage({ params }: Props) {
  const { id } = await params;
  const catalog = getCatalogSkill(id);

  if (isSkillLive(id)) {
    const skill = getSkillById(id)!;
    const publicSkill = {
      ...skill,
      drill: skill.drill.filter((q) => q.review_status === "approved"),
    };
    return (
      <SkillAccessGate skillId={publicSkill.id}>
        <SkillExperience skill={publicSkill} />
      </SkillAccessGate>
    );
  }

  if (catalog) {
    return <ComingSoonSkill field={catalog.field} skill={catalog.skill} />;
  }

  notFound();
}
