import type { Question } from "@/lib/types";
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
  /** How many full exams the student finished */
  completedCount: number;
  /** Sliding window of fingerprints (anti-repeat) */
  recentFingerprints: string[];
  /** Last exam slot indices used (for variety) */
  lastSlots: number[];
};

export const EMPTY_MOCK_HISTORY: MockHistoryState = {
  completedCount: 0,
  recentFingerprints: [],
  lastSlots: [],
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
  /** 0-based blueprint index */
  slot: number;
  /** 1-based display number */
  number: number;
  title_ar: string;
  focus_ar: string;
  questions: number;
  minutes: number;
  attempted: boolean;
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

/** Catalog of the 20 visible exams for the lobby. */
export function listMockExamCards(
  history: MockHistoryState
): MockExamCard[] {
  const attempted = new Set(history.lastSlots);
  return EXAM_BLUEPRINTS.map((bp, slot) => {
    const focus = focusFromMix(bp.mix);
    return {
      slot,
      number: slot + 1,
      title_ar: `اختبار ${toArabicDigits(slot + 1)}`,
      focus_ar: `تركيز أوضح على ${focus}`,
      questions: MOCK_EXAM_SIZE,
      minutes: MOCK_EXAM_SIZE,
      attempted: attempted.has(slot),
    };
  });
}

export function nextRecommendedSlot(history: MockHistoryState): number {
  const attempted = new Set(history.lastSlots);
  for (let i = 0; i < MOCK_BANK_SIZE; i++) {
    if (!attempted.has(i)) return i;
  }
  return history.completedCount % MOCK_BANK_SIZE;
}

function toArabicDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]!);
}

/**
 * Build a specific exam from the 20-slot bank (student picks the number).
 * Still avoids recent fingerprints so retakes feel fresh.
 */
export function buildMockExamAtSlot(
  slot: number,
  history: MockHistoryState,
  deviceId: string
): BuiltMockExam {
  const safeSlot =
    ((slot % MOCK_BANK_SIZE) + MOCK_BANK_SIZE) % MOCK_BANK_SIZE;
  const avoid = new Set(history.recentFingerprints);
  const attemptsOnSlot = history.lastSlots.filter((s) => s === safeSlot).length;
  const seedBase = hashStr(
    `${deviceId}|mock|slot${safeSlot}|try${attemptsOnSlot}|n${history.completedCount}`
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

/**
 * Clever next-exam formula (auto path):
 * - Exams 1–20: walk distinct bank slots
 * - After 20: remix mode
 */
export function buildNextMockExam(
  history: MockHistoryState,
  deviceId: string
): BuiltMockExam {
  const n = history.completedCount;
  const avoid = new Set(history.recentFingerprints);
  const seedBase = hashStr(`${deviceId}|mock|${n}`);

  if (n < MOCK_REMIX_AFTER) {
    const used = new Set(history.lastSlots);
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

export function appendMockHistory(
  prev: MockHistoryState,
  fingerprints: string[],
  slot: number
): MockHistoryState {
  const recentFingerprints = [
    ...fingerprints,
    ...prev.recentFingerprints,
  ].slice(0, FINGERPRINT_WINDOW);
  const lastSlots = [slot, ...prev.lastSlots.filter((s) => s !== slot)].slice(
    0,
    MOCK_BANK_SIZE
  );
  return {
    completedCount: prev.completedCount + 1,
    recentFingerprints,
    lastSlots,
  };
}
