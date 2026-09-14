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

const FINGERPRINT_WINDOW = 420; // ~7 exams of memory

export type BuiltMockExam = {
  questions: Question[];
  fingerprints: string[];
  slot: number;
  mode: "bank" | "remix";
  seed: number;
};

/**
 * Clever next-exam formula:
 * - Exams 1–10: walk distinct bank slots (15 available) with fresh seeds
 * - After 10: remix mode — blend blueprints + avoid recent fingerprints
 *   so repeats feel like new numbers/contexts, not déjà vu
 */
export function buildNextMockExam(
  history: MockHistoryState,
  deviceId: string
): BuiltMockExam {
  const n = history.completedCount;
  const avoid = new Set(history.recentFingerprints);
  const seedBase = hashStr(`${deviceId}|mock|${n}`);

  if (n < MOCK_REMIX_AFTER) {
    // Prefer unused slots among the 15
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
    const gens = generateExamQuestions(seed, blueprint.mix, avoid, MOCK_EXAM_SIZE);
    return strip(gens, slot, "bank", seed);
  }

  // Endless remix — rotate slot hint but always remix
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
  // Fresh question order + choice order on every exam entrance
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
  const lastSlots = [slot, ...prev.lastSlots].slice(0, MOCK_BANK_SIZE);
  return {
    completedCount: prev.completedCount + 1,
    recentFingerprints,
    lastSlots,
  };
}
