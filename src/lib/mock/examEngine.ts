import type { Question, MockSlotResult } from "@/lib/types";
import { shuffleInPlace } from "@/lib/content";
import { withShuffledChoices } from "@/lib/drillDeck";
import {
  EXAM_BLUEPRINTS,
  generateExamQuestions,
  generateRemixExam,
  MOCK_BANK_SIZE,
  MOCK_EXAM_SIZE,
  MOCK_REMIX_AFTER,
  type GenQ,
  type ExamMix,
} from "./generators";
import { hashStr } from "./rng";

export {
  MOCK_BANK_SIZE,
  MOCK_EXAM_SIZE,
  MOCK_REMIX_AFTER,
};

export type MockHistoryState = {
  completedCount: number;
  recentFingerprints: string[];
  /** Fully completed slot indices (derived + legacy) */
  lastSlots: number[];
  /** Best attempt per slot (partial or full) */
  slotResults: Record<string, MockSlotResult>;
};

export const EMPTY_MOCK_HISTORY: MockHistoryState = {
  completedCount: 0,
  recentFingerprints: [],
  lastSlots: [],
  slotResults: {},
};

const FINGERPRINT_WINDOW = 420;

export type BuiltMockExam = {
  questions: Question[];
  fingerprints: string[];
  slot: number;
  mode: "bank" | "remix";
  seed: number;
};

export type ExamCardStatus = "ready" | "incomplete" | "done";

export type MockExamCard = {
  slot: number;
  number: number;
  title_ar: string;
  focus_ar: string;
  questions: number;
  minutes: number;
  status: ExamCardStatus;
  /** Always shown when the student has any attempt. */
  score: number | null;
  total: number | null;
  answeredCount: number | null;
  /** Only when status === "done" (60/60 answered). */
  bestTimeMs: number | null;
};

const FOCUS_ORDER = [
  "حساب",
  "جبر",
  "هندسة",
  "إحصاء",
  "مقارنات",
] as const;

function focusFromMix(mix: ExamMix): string {
  const scores: Record<(typeof FOCUS_ORDER)[number], number> = {
    حساب:
      (mix.percent ?? 0) +
      (mix.ratio ?? 0) +
      (mix.successive ?? 0) +
      (mix.average ?? 0) +
      (mix.buy_sell ?? 0) +
      (mix.fraction ?? 0) +
      (mix.rate ?? 0) +
      (mix.number_sense ?? 0),
    جبر: mix.algebra ?? 0,
    هندسة: mix.geometry ?? 0,
    إحصاء: (mix.statistics ?? 0) + (mix.probability ?? 0),
    مقارنات: mix.comparison ?? 0,
  };
  let best: (typeof FOCUS_ORDER)[number] = "حساب";
  let bestN = -1;
  for (const k of FOCUS_ORDER) {
    if (scores[k] > bestN) {
      bestN = scores[k];
      best = k;
    }
  }
  return best;
}

/** Coerce legacy slot rows (score/total/time only) into the current shape. */
function coerceSlotResult(raw: unknown): MockSlotResult | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Partial<MockSlotResult>;
  if (typeof r.score !== "number" || typeof r.total !== "number") {
    return undefined;
  }
  const total = r.total;
  // Old rows only stored timing when all 60 were answered.
  const legacyFull =
    r.totalTimeMs != null &&
    total === MOCK_EXAM_SIZE &&
    r.answeredCount == null &&
    r.fullyAnswered == null;

  let answeredCount: number;
  if (typeof r.answeredCount === "number") {
    answeredCount = r.answeredCount;
  } else if (legacyFull || r.fullyAnswered) {
    answeredCount = MOCK_EXAM_SIZE;
  } else {
    // Unknown partial legacy row — don't invent a full 60.
    answeredCount = 0;
  }

  const fullyAnswered = Boolean(
    r.fullyAnswered === true ||
      legacyFull ||
      (answeredCount === MOCK_EXAM_SIZE &&
        total === MOCK_EXAM_SIZE &&
        r.totalTimeMs != null)
  );

  return {
    score: r.score,
    total,
    answeredCount,
    totalTimeMs: fullyAnswered ? (r.totalTimeMs ?? null) : null,
    fullyAnswered,
    completedAt:
      typeof r.completedAt === "string"
        ? r.completedAt
        : new Date(0).toISOString(),
  };
}

function isFullResult(r: MockSlotResult | undefined): boolean {
  return Boolean(
    r?.fullyAnswered &&
      r.answeredCount === MOCK_EXAM_SIZE &&
      r.total === MOCK_EXAM_SIZE &&
      r.totalTimeMs != null
  );
}

function normalizeHistory(
  history: Partial<MockHistoryState> | null | undefined
): MockHistoryState {
  const raw = history?.slotResults ?? {};
  const slotResults: Record<string, MockSlotResult> = {};
  for (const [k, v] of Object.entries(raw)) {
    const coerced = coerceSlotResult(v);
    if (coerced) slotResults[k] = coerced;
  }
  // Source of truth for "done" = slotResults with full 60 answers.
  // Ignore legacy lastSlots that have no matching full result (fixes "التالي" jumping ahead).
  const fullSlots = Object.entries(slotResults)
    .filter(([, r]) => isFullResult(r))
    .map(([k]) => Number(k))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  return {
    completedCount: fullSlots.length,
    recentFingerprints: history?.recentFingerprints ?? [],
    lastSlots: fullSlots,
    slotResults,
  };
}

/** Catalog of the 20 visible exams for the lobby. */
export function listMockExamCards(
  history: Partial<MockHistoryState>
): MockExamCard[] {
  const h = normalizeHistory(history);
  return EXAM_BLUEPRINTS.map((bp, slot) => {
    const focus = focusFromMix(bp.mix);
    const result = h.slotResults[String(slot)];
    let status: ExamCardStatus = "ready";
    if (isFullResult(result)) status = "done";
    else if (result) status = "incomplete";

    return {
      slot,
      number: slot + 1,
      title_ar: `اختبار ${slot + 1}`,
      focus_ar: `تركيز أوضح على ${focus}`,
      questions: MOCK_EXAM_SIZE,
      minutes: MOCK_EXAM_SIZE,
      status,
      score: result ? result.score : null,
      total: result ? result.total : null,
      answeredCount: result ? result.answeredCount : null,
      bestTimeMs: isFullResult(result) ? result!.totalTimeMs : null,
    };
  });
}

/** First exam that is not fully completed (60/60). */
export function nextRecommendedSlot(
  history: Partial<MockHistoryState>
): number {
  const h = normalizeHistory(history);
  for (let i = 0; i < MOCK_BANK_SIZE; i++) {
    if (!isFullResult(h.slotResults[String(i)])) return i;
  }
  return 0;
}

export function buildMockExamAtSlot(
  slot: number,
  history: Partial<MockHistoryState>,
  deviceId: string
): BuiltMockExam {
  const h = normalizeHistory(history);
  const safeSlot =
    ((slot % MOCK_BANK_SIZE) + MOCK_BANK_SIZE) % MOCK_BANK_SIZE;
  const avoid = new Set(h.recentFingerprints);
  const attemptsOnSlot = Object.keys(h.slotResults).includes(String(safeSlot))
    ? 1 + (h.lastSlots.includes(safeSlot) ? 1 : 0)
    : 0;
  const seedBase = hashStr(
    `${deviceId}|mock|v4qudurat|slot${safeSlot}|try${attemptsOnSlot}|n${h.completedCount}`
  );
  const blueprint = EXAM_BLUEPRINTS[safeSlot]!;
  const seed = seedBase ^ (safeSlot * 7919) ^ (attemptsOnSlot * 1301);
  // Exams 1–5 (slots 0–4): full Qudurat-style hard bank
  const hardBias = safeSlot < 5 ? 1 : 0.55;
  const gens = generateExamQuestions(
    seed,
    blueprint.mix,
    avoid,
    MOCK_EXAM_SIZE,
    { hardBias }
  );
  return strip(gens, safeSlot, "bank", seed);
}

export function buildNextMockExam(
  history: Partial<MockHistoryState>,
  deviceId: string
): BuiltMockExam {
  const h = normalizeHistory(history);
  const n = h.completedCount;
  const avoid = new Set(h.recentFingerprints);
  const seedBase = hashStr(`${deviceId}|mock|${n}`);

  if (n < MOCK_REMIX_AFTER) {
    const slot = nextRecommendedSlot(h);
    const blueprint = EXAM_BLUEPRINTS[slot]!;
    const seed = seedBase ^ (slot * 7919);
    const gens = generateExamQuestions(
      seed,
      blueprint.mix,
      avoid,
      MOCK_EXAM_SIZE
    );
    return strip(gens, slot, "bank", seed);
  }

  const slot = (n * 5 + hashStr(deviceId)) % MOCK_BANK_SIZE;
  const seed = seedBase ^ 0xa5a5a5a5 ^ n;
  const gens = generateRemixExam(seed, avoid, MOCK_EXAM_SIZE);
  return strip(gens, slot, "remix", seed);
}

function strip(
  gens: GenQ[],
  slot: number,
  mode: "bank" | "remix",
  seed: number
): BuiltMockExam {
  const ordered = shuffleInPlace([...gens]);
  const fingerprints = ordered.map((g) => g.fingerprint);
  const questions: Question[] = ordered.map(({ fingerprint: _fp, ...rest }) =>
    withShuffledChoices(rest)
  );
  return { questions, fingerprints, slot, mode, seed };
}

function pickBetterSlotResult(
  prev: MockSlotResult | undefined,
  next: MockSlotResult
): MockSlotResult {
  if (!prev) return next;
  // Full completion always beats a partial
  if (next.fullyAnswered && !prev.fullyAnswered) return next;
  if (!next.fullyAnswered && prev.fullyAnswered) return prev;
  if (next.score > prev.score) return next;
  if (next.score < prev.score) return prev;
  if (next.fullyAnswered && prev.fullyAnswered) {
    const nt = next.totalTimeMs ?? Number.POSITIVE_INFINITY;
    const pt = prev.totalTimeMs ?? Number.POSITIVE_INFINITY;
    return nt < pt ? next : prev;
  }
  // Both partial — keep more answers, then higher score already tied
  return next.answeredCount >= prev.answeredCount ? next : prev;
}

export function appendMockHistory(
  prev: Partial<MockHistoryState>,
  fingerprints: string[],
  slot: number,
  opts?: {
    fullyAnswered?: boolean;
    score?: number;
    total?: number;
    answeredCount?: number;
    totalTimeMs?: number;
  }
): MockHistoryState {
  const base = normalizeHistory(prev);
  const recentFingerprints = [
    ...fingerprints,
    ...base.recentFingerprints,
  ].slice(0, FINGERPRINT_WINDOW);

  if (
    opts?.score == null ||
    opts?.total == null ||
    opts?.answeredCount == null
  ) {
    return { ...base, recentFingerprints };
  }

  const fullyAnswered = Boolean(
    opts.fullyAnswered &&
      opts.answeredCount === MOCK_EXAM_SIZE &&
      opts.total === MOCK_EXAM_SIZE
  );

  const incoming: MockSlotResult = {
    score: opts.score,
    total: opts.total,
    answeredCount: opts.answeredCount,
    totalTimeMs: fullyAnswered ? (opts.totalTimeMs ?? null) : null,
    fullyAnswered,
    completedAt: new Date().toISOString(),
  };

  const key = String(slot);
  const mergedResult = pickBetterSlotResult(base.slotResults[key], incoming);
  const slotResults = { ...base.slotResults, [key]: mergedResult };

  const fullSlots = Object.entries(slotResults)
    .filter(([, r]) => isFullResult(r))
    .map(([k]) => Number(k))
    .filter((n) => Number.isFinite(n));

  return {
    completedCount: fullSlots.length,
    recentFingerprints,
    lastSlots: fullSlots,
    slotResults,
  };
}

export function mergeMockHistory(
  a: Partial<MockHistoryState> | null | undefined,
  b: Partial<MockHistoryState> | null | undefined
): MockHistoryState {
  const left = normalizeHistory(a);
  const right = normalizeHistory(b);
  const slotResults: Record<string, MockSlotResult> = { ...left.slotResults };
  for (const [k, v] of Object.entries(right.slotResults)) {
    slotResults[k] = pickBetterSlotResult(slotResults[k], v);
  }
  const fullSlots = Object.entries(slotResults)
    .filter(([, r]) => isFullResult(r))
    .map(([k]) => Number(k))
    .filter((n) => Number.isFinite(n));
  const recentFingerprints = [
    ...left.recentFingerprints,
    ...right.recentFingerprints,
  ].slice(0, FINGERPRINT_WINDOW);
  return {
    completedCount: fullSlots.length,
    recentFingerprints,
    lastSlots: fullSlots,
    slotResults,
  };
}
