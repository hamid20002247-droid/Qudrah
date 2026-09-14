import type { Difficulty, Question, Skill } from "./types";

export function isApproved(status: "draft" | "approved"): boolean {
  return status === "approved";
}

export function filterApprovedQuestions(
  questions: Question[],
  includeDrafts: boolean
): Question[] {
  if (includeDrafts) return questions;
  return questions.filter((q) => q.review_status === "approved");
}

export function filterApprovedSkills(
  skills: Skill[],
  includeDrafts: boolean
): Skill[] {
  if (includeDrafts) {
    return skills.map((s) => ({
      ...s,
      drill: s.drill,
    }));
  }
  return skills
    .filter((s) => s.review_status === "approved")
    .map((s) => ({
      ...s,
      drill: s.drill.filter((q) => q.review_status === "approved"),
      final_extra: s.final_extra?.filter((q) => q.review_status === "approved"),
    }))
    .filter((s) => s.drill.length > 0);
}

const DIFF_ORDER: Record<Difficulty, number> = {
  easy: 0,
  mid: 1,
  hard: 2,
};

export function shuffleInPlace<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick ~12 questions across sub-patterns, order easy→hard with light shuffle within band. */
export function buildMockSet(
  pool: Question[],
  count = 12
): Question[] {
  const approved = pool.filter((q) => q.review_status === "approved");
  const byPattern = new Map<string, Question[]>();
  for (const q of approved) {
    const list = byPattern.get(q.sub_pattern) ?? [];
    list.push(q);
    byPattern.set(q.sub_pattern, list);
  }

  const picked: Question[] = [];
  const patterns = shuffleInPlace([...byPattern.keys()]);

  // Round-robin so each sub-pattern gets representation
  let guard = 0;
  while (picked.length < count && guard < 100) {
    guard++;
    let added = false;
    for (const p of patterns) {
      if (picked.length >= count) break;
      const list = byPattern.get(p);
      if (!list || list.length === 0) continue;
      const shuffled = shuffleInPlace(list);
      const next = shuffled.find((q) => !picked.some((x) => x.id === q.id));
      if (next) {
        picked.push(next);
        added = true;
      }
    }
    if (!added) break;
  }

  // Fill remaining from leftover
  if (picked.length < count) {
    const rest = shuffleInPlace(
      approved.filter((q) => !picked.some((x) => x.id === q.id))
    );
    for (const q of rest) {
      if (picked.length >= count) break;
      picked.push(q);
    }
  }

  // Sort easy→hard, light shuffle within same difficulty
  const easy = shuffleInPlace(picked.filter((q) => q.difficulty === "easy"));
  const mid = shuffleInPlace(picked.filter((q) => q.difficulty === "mid"));
  const hard = shuffleInPlace(picked.filter((q) => q.difficulty === "hard"));
  return [...easy, ...mid, ...hard].slice(0, count);
}

export function difficultySort(a: Question, b: Question): number {
  return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
}

export const SUB_PATTERN_LABELS: Record<string, string> = {
  percent: "النسب المئوية",
  ratio: "النسب والتناسب",
  average: "المتوسط",
  rate: "السرعة والمعدل",
  buy_sell: "البيع والشراء",
  fraction: "الكسور",
  successive: "النسب المتتالية",
  number_sense: "حس الأعداد",
  algebra: "الجبر",
  geometry: "الهندسة",
  statistics: "الإحصاء",
  probability: "الاحتمالات",
  comparison: "المقارنات",
};

/** Domain buckets for result UI (official-like sections). */
export const DOMAIN_LABELS: Record<string, string> = {
  arithmetic: "الحساب",
  algebra: "الجبر",
  geometry: "الهندسة",
  statistics: "الإحصاء والاحتمالات",
  comparison: "المقارنات",
};

export function domainForSubPattern(sub: string): keyof typeof DOMAIN_LABELS {
  switch (sub) {
    case "algebra":
      return "algebra";
    case "geometry":
      return "geometry";
    case "statistics":
    case "probability":
      return "statistics";
    case "comparison":
      return "comparison";
    default:
      return "arithmetic";
  }
}
