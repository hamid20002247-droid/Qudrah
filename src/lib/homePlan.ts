import { ALL_SKILLS, skillIdForSubPattern } from "@/content/arithmetic";
import { getCatalogSkill } from "@/content/catalog/fields";
import type { MockAttempt, SkillProgress } from "@/lib/types";
import { isFinalUnlocked } from "@/store/progress";

export type HomePlan = {
  /** Clear status for the hero */
  stage:
    | "fresh"
    | "continue"
    | "next_skill"
    | "path_ready_for_mock"
    | "weak_focus"
    | "mock_improve"
    | "all_clear";
  eyebrow: string;
  headline: string;
  support: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Next skills after the primary (orientation) */
  upcoming: {
    id: string;
    title_ar: string;
    hook_ar: string;
    field_ar: string;
  }[];
  stats: {
    completed: number;
    total: number;
    inProgress: number;
    streakDays: number;
    daysToExam: number | null;
    bestMockScore: number | null;
    lastMockTotal: number | null;
  };
};

function roundsHint(p: SkillProgress): string {
  const done = [1, 2, 3].filter((n) => (p.rounds[n as 1 | 2 | 3]?.attempts ?? 0) > 0)
    .length;
  if (done === 0) return "ابدأ التدريب من الجولة الأولى";
  if (done < 3) return `أكملت ${done} من 3 جولات تدريب — كمّل الباقي`;
  if (isFinalUnlocked(p.rounds) && !(p.rounds[4]?.attempts ?? 0)) {
    return "التدريب جاهز — افتح الاختبار النهائي للمهارة";
  }
  return "أكمل ما تبقّى في هذه المهارة";
}

function weakestFromMock(attempt: MockAttempt | null): {
  skillId: string;
  title_ar: string;
  correct: number;
  total: number;
} | null {
  if (!attempt) return null;
  const ranked = Object.entries(attempt.perSubPattern)
    .map(([sub, v]) => ({
      sub,
      pct: v.total ? v.correct / v.total : 1,
      ...v,
      skillId: skillIdForSubPattern(sub),
    }))
    .filter((x) => x.skillId)
    .sort((a, b) => a.pct - b.pct);
  const weak = ranked[0];
  if (!weak || !weak.skillId || weak.pct >= 0.8) return null;
  const skill = ALL_SKILLS.find((s) => s.id === weak.skillId);
  if (!skill) return null;
  return {
    skillId: weak.skillId,
    title_ar: skill.title_ar,
    correct: weak.correct,
    total: weak.total,
  };
}

function upcomingAfter(
  fromId: string | null,
  getProgress: (id: string) => SkillProgress,
  limit = 3
) {
  const start = fromId
    ? ALL_SKILLS.findIndex((s) => s.id === fromId) + 1
    : 0;
  const out: HomePlan["upcoming"] = [];
  for (let i = Math.max(0, start); i < ALL_SKILLS.length && out.length < limit; i++) {
    const s = ALL_SKILLS[i]!;
    const p = getProgress(s.id);
    if (p.completed) continue;
    const cat = getCatalogSkill(s.id);
    out.push({
      id: s.id,
      title_ar: s.title_ar,
      hook_ar: s.hook_ar,
      field_ar: cat?.field.title_ar ?? "",
    });
  }
  return out;
}

/**
 * One clear next action for the signed-in home — user should never wonder what to do.
 */
export function buildHomePlan(input: {
  getProgress: (id: string) => SkillProgress;
  streakDays: number;
  daysToExam: number | null;
  bestMockScore: number | null;
  lastMock: MockAttempt | null;
}): HomePlan {
  const { getProgress, streakDays, daysToExam, bestMockScore, lastMock } =
    input;
  const total = ALL_SKILLS.length;
  const completed = ALL_SKILLS.filter((s) => getProgress(s.id).completed).length;
  const inProgress = ALL_SKILLS.filter((s) => {
    const p = getProgress(s.id);
    return p.started && !p.completed;
  }).length;

  const stats: HomePlan["stats"] = {
    completed,
    total,
    inProgress,
    streakDays,
    daysToExam,
    bestMockScore,
    lastMockTotal: lastMock?.total ?? null,
  };

  const first = ALL_SKILLS[0]!;
  const continued = ALL_SKILLS.find((s) => {
    const p = getProgress(s.id);
    return p.started && !p.completed;
  });
  const nextFresh = ALL_SKILLS.find((s) => !getProgress(s.id).started);
  const weak = weakestFromMock(lastMock);
  const pathDone = completed >= total;
  const mockPct =
    lastMock && lastMock.total > 0 ? lastMock.score / lastMock.total : null;

  // 1) Always finish what's open
  if (continued) {
    const p = getProgress(continued.id);
    return {
      stage: "continue",
      eyebrow: "خطوتك الآن",
      headline: `أكمل: ${continued.title_ar}`,
      support: roundsHint(p),
      primaryHref: `/skill/${continued.id}`,
      primaryLabel: "متابعة المهارة",
      secondaryHref: "/skills",
      secondaryLabel: "خريطة المهارات",
      upcoming: upcomingAfter(continued.id, getProgress),
      stats,
    };
  }

  // 2) Fresh start
  if (completed === 0 && !nextFresh) {
    /* unreachable if ALL_SKILLS non-empty */
  }
  if (completed === 0 && nextFresh) {
    const isFirst = nextFresh.id === first.id;
    return {
      stage: "fresh",
      eyebrow: "ابدأ المسار",
      headline: isFirst
        ? `ابدأ بـ «${nextFresh.title_ar}»`
        : `ابدأ: ${nextFresh.title_ar}`,
      support: isFirst
        ? "الأكثر تكراراً في الكمي — افهم النمط ثم تدرّب تحت الوقت"
        : nextFresh.hook_ar,
      primaryHref: `/skill/${nextFresh.id}`,
      primaryLabel: "ابدأ الآن",
      secondaryHref: "/skills",
      secondaryLabel: "استعرض الخريطة",
      upcoming: upcomingAfter(nextFresh.id, getProgress),
      stats,
    };
  }

  // 3) Path complete → mock focus
  if (pathDone) {
    if (mockPct != null && mockPct < 0.75 && weak) {
      return {
        stage: "mock_improve",
        eyebrow: "ارفع درجتك",
        headline: `قوِّ «${weak.title_ar}» ثم أعد المحاكاة`,
        support: `أضعف نقطة في آخر محاولة: ${weak.correct}/${weak.total}`,
        primaryHref: `/skill/${weak.skillId}`,
        primaryLabel: "تدرّب على النقطة الضعيفة",
        secondaryHref: "/mock",
        secondaryLabel: "أو ابدأ محاكاة جديدة",
        upcoming: [],
        stats,
      };
    }
    return {
      stage: "all_clear",
      eyebrow: "المسار مكتمل",
      headline: lastMock
        ? "أعد محاكاة كاملة وثبّت مستواك"
        : "اختبر نفسك بمحاكاة 60 سؤالاً",
      support: lastMock
        ? `آخر نتيجة: ${lastMock.score}/${lastMock.total} — كل محاولة بأسئلة جديدة`
        : "مؤقت واحد، جوّ يوم الاختبار، وأسئلة جديدة كل مرة",
      primaryHref: "/mock",
      primaryLabel: lastMock ? "محاكاة جديدة" : "ابدأ المحاكاة",
      secondaryHref: "/skills",
      secondaryLabel: "راجع مهارة",
      upcoming: [],
      stats,
    };
  }

  // 4) Enough skills + weak mock → optional focus (after at least 3 skills)
  if (completed >= 3 && weak && mockPct != null && mockPct < 0.7) {
    return {
      stage: "weak_focus",
      eyebrow: "من آخر محاكاة",
      headline: `حسّن: ${weak.title_ar}`,
      support: `ضعفت هنا (${weak.correct}/${weak.total}) — ثبّت النمط ثم كمّل المسار`,
      primaryHref: `/skill/${weak.skillId}`,
      primaryLabel: "تدرّب على الضعف",
      secondaryHref: nextFresh ? `/skill/${nextFresh.id}` : "/skills",
      secondaryLabel: nextFresh
        ? `أو التالي: ${nextFresh.title_ar}`
        : "خريطة المهارات",
      upcoming: upcomingAfter(weak.skillId, getProgress),
      stats,
    };
  }

  // 5) Mid-path: after ~8 skills, gently offer mock as secondary
  if (nextFresh) {
    const offerMock = completed >= 8 && !lastMock;
    return {
      stage: "next_skill",
      eyebrow: "التالي في مسارك",
      headline: nextFresh.title_ar,
      support: nextFresh.hook_ar,
      primaryHref: `/skill/${nextFresh.id}`,
      primaryLabel: "ابدأ هذه المهارة",
      secondaryHref: offerMock ? "/mock" : "/skills",
      secondaryLabel: offerMock
        ? "أو جرّب محاكاة الآن"
        : "خريطة المهارات",
      upcoming: upcomingAfter(nextFresh.id, getProgress),
      stats,
    };
  }

  // Fallback
  return {
    stage: "path_ready_for_mock",
    eyebrow: "خطوتك الآن",
    headline: "المحاكاة الموقوتة",
    support: "أتممت المهارات المتاحة — اختبر نفسك بستين سؤالاً",
    primaryHref: "/mock",
    primaryLabel: "ابدأ المحاكاة",
    secondaryHref: "/skills",
    secondaryLabel: "خريطة المهارات",
    upcoming: [],
    stats,
  };
}
