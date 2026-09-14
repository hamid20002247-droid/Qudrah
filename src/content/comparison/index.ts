import type { Skill } from "@/lib/types";
import { cmpNumbers } from "./cmp-numbers";
import { cmpPercent } from "./cmp-percent";
import { cmpFrac } from "./cmp-frac";
import { cmpArea } from "./cmp-area";
import { cmpPeriArea } from "./cmp-peri-area";
import { cmpAlgebra } from "./cmp-algebra";
import { cmpRootsExp } from "./cmp-roots-exp";
import { cmpRates } from "./cmp-rates";
import { cmpMeans } from "./cmp-means";
import { cmpInsufficient } from "./cmp-insufficient";

/**
 * مقارنات — 10 مهارات حسب docs/KAMI_SKILLS_ROADMAP.md
 * مدمجة في ALL_SKILLS عبر src/content/arithmetic/index.ts
 */
export const COMPARISON_SKILLS: Skill[] = [
  cmpNumbers,
  cmpPercent,
  cmpFrac,
  cmpArea,
  cmpPeriArea,
  cmpAlgebra,
  cmpRootsExp,
  cmpRates,
  cmpMeans,
  cmpInsufficient,
];

export {
  cmpNumbers,
  cmpPercent,
  cmpFrac,
  cmpArea,
  cmpPeriArea,
  cmpAlgebra,
  cmpRootsExp,
  cmpRates,
  cmpMeans,
  cmpInsufficient,
};

export function getComparisonSkillById(id: string): Skill | undefined {
  return COMPARISON_SKILLS.find((skill) => skill.id === id);
}
