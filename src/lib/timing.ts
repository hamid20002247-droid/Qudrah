export type TimeBand = "excellent" | "good" | "ok" | "slow" | "weak";
export type Difficulty = "easy" | "mid" | "hard";

export type SkillTiming = {
  /** Target after mastering the shortcut — "ممتاز" */
  excellent_sec: number;
  good_sec: number;
  ok_sec: number;
  /** Above this = ضعيف */
  slow_sec: number;
};

export const DEFAULT_TIMING: SkillTiming = {
  excellent_sec: 20,
  good_sec: 30,
  ok_sec: 40,
  slow_sec: 55,
};

/** Questions per training round (1–3). Final uses full pool + extras. */
export const ROUND_QUESTION_COUNT = 6;
export const FINAL_EXTRA_COUNT = 7;

/** Harder questions get a little more bar length — not a free pass. */
const DIFFICULTY_BUDGET: Record<Difficulty, number> = {
  easy: 1,
  mid: 1.12,
  hard: 1.25,
};

export function bandForMs(timeMs: number, timing: SkillTiming): TimeBand {
  const s = timeMs / 1000;
  if (s <= timing.excellent_sec) return "excellent";
  if (s <= timing.good_sec) return "good";
  if (s <= timing.ok_sec) return "ok";
  if (s <= timing.slow_sec) return "slow";
  return "weak";
}

export function bandLabel(band: TimeBand): string {
  switch (band) {
    case "excellent":
      return "ممتاز";
    case "good":
      return "جيد";
    case "ok":
      return "مقبول";
    case "slow":
      return "بطيء";
    case "weak":
      return "ضعيف";
  }
}

/** Per-question goal in seconds for this round. */
export function roundTargetSec(
  round: DrillRound,
  timing: SkillTiming
): number {
  if (round === 1) return timing.ok_sec;
  if (round === 2) return timing.good_sec;
  if (round === 3) return timing.excellent_sec;
  // Final exam — exam-like but after mastery
  return timing.good_sec;
}

/** Whole-test time goal (sum of per-question targets). */
export function roundTotalGoalSec(
  round: DrillRound,
  timing: SkillTiming,
  questionCount: number
): number {
  if (round === 4) return finalExamTotalSec(questionCount);
  return roundTargetSec(round, timing) * questionCount;
}

/** Final skill exam — ~60 ثانية/سؤال مثل جو القدرات */
export function finalExamTotalSec(questionCount: number): number {
  return questionCount * 60;
}

export function formatGoalClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `حتى ${s} ثانية`;
  if (s === 0) {
    if (m === 1) return "حتى دقيقة واحدة";
    if (m === 2) return "حتى دقيقتين";
    return `حتى ${m} دقائق`;
  }
  if (m === 1) return `حتى دقيقة و ${s} ثانية`;
  if (m === 2) return `حتى دقيقتين و ${s} ثانية`;
  return `حتى ${m} دقائق و ${s} ثانية`;
}

/** Short per-question target, plain Arabic — no ≤ / ≈ */
export function formatPerQuestionGoal(sec: number): string {
  return `حتى ${sec} ثانية`;
}

/**
 * How long the depleting bar lasts.
 * Round 1: to slow — accuracy
 * Round 2: to ok — balanced
 * Round 3: to good — speed
 * Round 4 (final): to good — exam rhythm
 */
export function timerBudgetMs(
  round: DrillRound,
  timing: SkillTiming,
  difficulty: Difficulty = "easy"
): number {
  const base =
    round === 1
      ? timing.slow_sec
      : round === 2
        ? timing.ok_sec
        : timing.good_sec;
  return Math.round(base * DIFFICULTY_BUDGET[difficulty] * 1000);
}

export function timerColorForElapsed(
  elapsedMs: number,
  timing: SkillTiming
): string {
  const band = bandForMs(elapsedMs, timing);
  switch (band) {
    case "excellent":
      return "#0F766E";
    case "good":
      return "#16A34A";
    case "ok":
      return "#D97706";
    case "slow":
      return "#EA580C";
    case "weak":
      return "#DC2626";
  }
}

export function timingNote(
  band: TimeBand,
  round: DrillRound,
  correct: boolean
): string {
  if (!correct) {
    return "ركّز أولاً على فهم الحل، ثم أعد السؤال بسرعة أفضل.";
  }
  if (round === 1) {
    switch (band) {
      case "excellent":
      case "good":
        return "إجابة صحيحة. الوقت مناسب لهذه الجولة.";
      case "ok":
        return "إجابة صحيحة. الوقت مقبول؛ في الجولة التالية حاول تختصر قليلاً.";
      case "slow":
      case "weak":
        return "إجابة صحيحة. الوقت طويل — راجع الاختصار قبل الجولة التالية.";
    }
  }
  if (round === 2) {
    switch (band) {
      case "excellent":
        return "صحيح وسريع. هذا إيقاع قوي.";
      case "good":
        return "صحيح ضمن الوقت الجيد.";
      case "ok":
        return "صحيح، لكن أبطأ من المستوى الجيد بقليل.";
      case "slow":
      case "weak":
        return "صحيح، لكن الوقت أبطأ من هدف هذه الجولة.";
    }
  }
  if (round === 4) {
    switch (band) {
      case "excellent":
        return "صحيح وبإيقاع اختبار قوي.";
      case "good":
        return "صحيح ضمن هدف الاختبار النهائي.";
      case "ok":
        return "صحيح، لكن أبطأ قليلاً عن إيقاع الاختبار.";
      case "slow":
      case "weak":
        return "صحيح، لكن الوقت أطول من هدف الاختبار النهائي.";
    }
  }
  switch (band) {
    case "excellent":
      return "صحيح وبسرعة ممتازة لهذا النمط.";
    case "good":
      return "صحيح وقريب من الممتاز.";
    case "ok":
      return "صحيح، لكن أبطأ من هدف السرعة في هذه الجولة.";
    case "slow":
    case "weak":
      return "صحيح، لكن أبطأ كثيراً عن هدف السرعة. أعد الاختصار ثم حاول مرة أخرى.";
  }
}

export type DrillRound = 1 | 2 | 3 | 4;

export function roundMeta(
  round: DrillRound,
  timing?: SkillTiming
): {
  title: string;
  focus: string;
  goal: string;
  accent: "teal" | "amber" | "rose" | "ink";
} {
  const target = timing ? roundTargetSec(round, timing) : null;
  if (round === 1) {
    return {
      title: "تدريب ١ — الصحة",
      focus: "هدف هذه الجولة: الإجابة الصحيحة فقط.",
      goal: target
        ? `مرجع لكل سؤال نحو ${target} ث · لا تضغط على السرعة الآن.`
        : "لا تهتم بالسرعة الآن.",
      accent: "teal",
    };
  }
  if (round === 2) {
    return {
      title: "تدريب ٢ — صحة مع وقت",
      focus: "الصحة أولاً، ثم اقترب من الوقت الجيد.",
      goal: target
        ? `هدف لكل سؤال: ${target} ثانية أو أقل.`
        : "حاول تبقي تحت مستوى «جيد».",
      accent: "amber",
    };
  }
  if (round === 3) {
    return {
      title: "تدريب ٣ — صحة وسرعة",
      focus: "إجابة صحيحة وبسرعة قريبة من «ممتاز».",
      goal: target
        ? `ادفع نحو ${target} ثانية أو أقل — مع صحة الإجابة.`
        : "إيقاع قريب من الممتاز.",
      accent: "rose",
    };
  }
  return {
    title: "الاختبار النهائي",
    focus: "25 سؤالاً · مؤقت واحد للاختبار كله · بلا تصحيح أثناء الحل.",
    goal: target
      ? `وقت الاختبار نحو دقيقة لكل سؤال · تنقّل بحرية ثم سلّم.`
      : "جو قريب من يوم الاختبار.",
    accent: "ink",
  };
}

/** Kept for summaries; hub uses ResultStrip instead. */
export function challengeLine(
  lastScore: number,
  lastTotal: number,
  lastAvgTimeMs: number,
  _bestScore: number,
  _bestAvgTimeMs: number | null
): string {
  const perfect = lastScore === lastTotal;
  const avgSec = Math.round(lastAvgTimeMs / 1000);
  if (!perfect) {
    return `${lastScore}/${lastTotal} — ارفع درجتك.`;
  }
  return `${lastScore}/${lastTotal} · متوسط ${avgSec} ث — اكسر وقتك.`;
}
