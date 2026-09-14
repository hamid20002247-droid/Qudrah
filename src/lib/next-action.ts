import { ALL_SKILLS } from "@/content/arithmetic";
import type { SkillProgress } from "@/lib/types";

export function recommendNextSkill(
  getProgress: (id: string) => SkillProgress
): { id: string; title_ar: string; reason: string } {
  const first = ALL_SKILLS[0];
  for (const skill of ALL_SKILLS) {
    const p = getProgress(skill.id);
    if (!p.completed) {
      if (!p.started) {
        return {
          id: skill.id,
          title_ar: skill.title_ar,
          reason:
            skill.id === first.id
              ? "ابدأ من هنا — الأكثر تكراراً في الاختبار"
              : "التالي في مسارك",
        };
      }
      return {
        id: skill.id,
        title_ar: skill.title_ar,
        reason: "أكمل ما بدأته",
      };
    }
  }
  return {
    id: "mock",
    title_ar: "المحاكاة الموقوتة",
    reason: "أتممت المهارات — اختبر نفسك الآن",
  };
}

export const PRODUCT_FACTS = {
  /** Live skills in ALL_SKILLS */
  skills: ALL_SKILLS.length,
  /** Five quantitative fields */
  fields: 5,
  /** Catalog titles (roadmap) */
  catalogSkills: 60,
  /** Per-skill training bank (drill + final_extra) */
  questionsPerSkill: 25,
  /** Honest bank size across live skills */
  skillBankQuestions: ALL_SKILLS.reduce(
    (n, s) => n + s.drill.length + (s.final_extra?.length ?? 0),
    0
  ),
  mockQuestions: 60,
  mockMinutes: 60,
  pathMinutes: ALL_SKILLS.reduce((a, s) => a + s.estimated_minutes, 0),
};
