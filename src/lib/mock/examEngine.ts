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
  /** How many full exams the student finished (all 60 answered) */
  completedCount: number;
  /** Sliding window of fingerprints (anti-repeat) */
  recentFingerprints: string[];
  /** Fully completed slot indices */
  lastSlots: number[];
  /** Best full result per slot (key = String(slot)) */
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

export type MockExamCard = {
  slot: number;
  number: number;
  title_ar: string;
  focus_ar: string;
  questions: number;
  minutes: number;
  /** True only when the student answered all 60 questions. */
  completed: boolean;
  /** Best full-run score — only when completed. */
  bestScore: number | null;
  bestTotal: number | null;
  /** Best full-run total time (ms) — only when completed. */
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

function normalizeHistory(
  history: Partial<MockHistoryState> | null | undefined
): MockHistoryState {
  return {
    completedCount: history?.completedCount ?? 0,
    recentFingerprints: history?.recentFingerprints ?? [],
    lastSlots: history?.lastSlots ?? [],
    slotResults: history?.slotResults ?? {},
  };
}

/** Catalog of the 20 visible exams for the lobby. */
export function listMockExamCards(
  history: Partial<MockHistoryState>
): MockExamCard[] {
  const h = normalizeHistory(history);
  const completed = new Set(h.lastSlots);
  return EXAM_BLUEPRINTS.map((bp, slot) => {
    const focus = focusFromMix(bp.mix);
    const result = h.slotResults[String(slot)];
    const isDone = completed.has(slot) && Boolean(result);
    return {
      slot,
      number: slot + 1,
      title_ar: `اختبار ${slot + 1}`,
      focus_ar: `تركيز أوضح على ${focus}`,
      questions: MOCK_EXAM_SIZE,
      minutes: MOCK_EXAM_SIZE,
      completed: isDone,
      bestScore: isDone ? result!.score : null,
      bestTotal: isDone ? result!.total : null,
      bestTimeMs: isDone ? result!.totalTimeMs : null,
    };
  });
}

export function nextRecommendedSlot(
  history: Partial<MockHistoryState>
): number {
  const h = normalizeHistory(history);
  const completed = new Set(h.lastSlots);
  for (let i = 0; i < MOCK_BANK_SIZE; i++) {
    if (!completed.has(i)) return i;
  }
  return h.completedCount % MOCK_BANK_SIZE;
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
  const attemptsOnSlot = h.lastSlots.filter((s) => s === safeSlot).length;
  const seedBase = hashStr(
    `${deviceId}|mock|slot${safeSlot}|try${attemptsOnSlot}|n${h.completedCount}`
  );
  const blueprint = EXAM_BLUEPRINTS[safeSlot]!;
  const seed = seedBase ^ (safeSlot * 7919) ^ (attemptsOnSlot * 1301);
  const gens = generateExamQuestions(
    seed,
    blueprint.mix,
    avoid,
    MOCK_EXAM_SIZE
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
    const used = new Set(h.lastSlots);
    let slot = n % MOCK_BANK_SIZE;
    for (let i = 0; i < MOCK_BANK_SIZE; i++) {
      const cand = (n + i * 3) % MOCK_BANK_SIZE;
      if (!used.has(cand)) {
        slot = cand;
        break;
      }
    }
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
  if (next.score > prev.score) return next;
  if (next.score < prev.score) return prev;
  // Same score → keep the faster run
  return next.totalTimeMs < prev.totalTimeMs ? next : prev;
}

export function appendMockHistory(
  prev: Partial<MockHistoryState>,
  fingerprints: string[],
  slot: number,
  opts?: {
    fullyAnswered?: boolean;
    result?: Omit<MockSlotResult, "completedAt"> & { completedAt?: string };
  }
): MockHistoryState {
  const base = normalizeHistory(prev);
  const recentFingerprints = [
    ...fingerprints,
    ...base.recentFingerprints,
  ].slice(0, FINGERPRINT_WINDOW);

  const fullyAnswered = opts?.fullyAnswered ?? true;
  if (!fullyAnswered || !opts?.result) {
    return {
      ...base,
      recentFingerprints,
    };
  }

  const key = String(slot);
  const incoming: MockSlotResult = {
    score: opts.result.score,
    total: opts.result.total,
    totalTimeMs: opts.result.totalTimeMs,
    completedAt: opts.result.completedAt ?? new Date().toISOString(),
  };
  const wasNew = !base.lastSlots.includes(slot);
  const lastSlots = [slot, ...base.lastSlots.filter((s) => s !== slot)].slice(
    0,
    MOCK_BANK_SIZE
  );

  return {
    completedCount: wasNew ? base.completedCount + 1 : base.completedCount,
    recentFingerprints,
    lastSlots,
    slotResults: {
      ...base.slotResults,
      [key]: pickBetterSlotResult(base.slotResults[key], incoming),
    },
  };
}

/** Merge two mock histories (local ↔ cloud). */
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
  const lastSlots = [
    ...new Set([...left.lastSlots, ...right.lastSlots]),
  ].slice(0, MOCK_BANK_SIZE);
  const recentFingerprints = [
    ...left.recentFingerprints,
    ...right.recentFingerprints,
  ].slice(0, FINGERPRINT_WINDOW);
  return {
    completedCount: Math.max(left.completedCount, right.completedCount, lastSlots.length),
    recentFingerprints,
    lastSlots,
    slotResults,
  };
}
