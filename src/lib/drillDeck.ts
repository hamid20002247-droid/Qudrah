import type { Question, Skill } from "@/lib/types";
import { shuffleInPlace } from "@/lib/content";
import {
  ROUND_QUESTION_COUNT,
  type DrillRound,
} from "@/lib/timing";

/**
 * Shuffle answer order while keeping the correct choice and traps aligned.
 * Safe to call on every round entry / mock build.
 */
export function withShuffledChoices(question: Question): Question {
  const order = shuffleInPlace(
    question.choices_ar.map((_, index) => index)
  );
  const choices_ar = order.map((oldIndex) => question.choices_ar[oldIndex]!);
  const correct_index = order.indexOf(question.correct_index);

  const trap_explanations_ar: Record<number, string> = {};
  order.forEach((oldIndex, newIndex) => {
    if (newIndex === correct_index) return;
    const note = question.trap_explanations_ar[oldIndex];
    if (note) trap_explanations_ar[newIndex] = note;
  });

  return {
    ...question,
    choices_ar,
    correct_index,
    trap_explanations_ar,
  };
}

/** Fresh shuffled deck every entry — rounds 1–3 sample 6; final = full pool + extras. */
export function buildRoundDeck(skill: Skill, round: DrillRound): Question[] {
  if (round === 4) {
    return shuffleInPlace([
      ...skill.drill,
      ...(skill.final_extra ?? []),
    ]).map(withShuffledChoices);
  }
  const pool = shuffleInPlace([...skill.drill]);
  return pool
    .slice(0, Math.min(ROUND_QUESTION_COUNT, pool.length))
    .map(withShuffledChoices);
}

export function roundQuestionCount(skill: Skill, round: DrillRound): number {
  if (round === 4) {
    return skill.drill.length + (skill.final_extra?.length ?? 0);
  }
  return Math.min(ROUND_QUESTION_COUNT, skill.drill.length);
}
