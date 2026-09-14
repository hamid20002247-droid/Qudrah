import type { Skill } from "@/lib/types";
import { linearEq } from "./linear-eq";
import { twoStepEq } from "./two-step-eq";
import { evalExpr } from "./eval-expr";
import { simplify } from "./simplify";
import { inequalities } from "./inequalities";
import { arithSeq } from "./arith-seq";
import { squarePatterns } from "./square-patterns";
import { ages } from "./ages";
import { wordToAlgebra } from "./word-to-algebra";
import { algebraRelations } from "./algebra-relations";
import { balanceSides } from "./balance-sides";
import { checkBySub } from "./check-by-sub";

/**
 * جبر — 12 مهارة حسب docs/KAMI_SKILLS_ROADMAP.md
 * مدمجة في ALL_SKILLS عبر src/content/arithmetic/index.ts
 */
export const ALGEBRA_SKILLS: Skill[] = [
  linearEq,
  twoStepEq,
  evalExpr,
  simplify,
  inequalities,
  arithSeq,
  squarePatterns,
  ages,
  wordToAlgebra,
  algebraRelations,
  balanceSides,
  checkBySub,
];

export {
  linearEq,
  twoStepEq,
  evalExpr,
  simplify,
  inequalities,
  arithSeq,
  squarePatterns,
  ages,
  wordToAlgebra,
  algebraRelations,
  balanceSides,
  checkBySub,
};

export function getAlgebraSkillById(id: string): Skill | undefined {
  return ALGEBRA_SKILLS.find((skill) => skill.id === id);
}
