import type { Skill } from "@/lib/types";
import { ALGEBRA_SKILLS } from "@/content/algebra";
import { COMPARISON_SKILLS } from "@/content/comparison";
import { GEOMETRY_SKILLS } from "@/content/geometry";
import { STATISTICS_SKILLS } from "@/content/statistics";
import { percentChange } from "./percent-change";
import { percentOf } from "./percent-of";
import { successivePercent } from "./successive-percent";
import { ratios } from "./ratios";
import { directInverse } from "./direct-inverse";
import { buySell } from "./buy-sell";
import { average } from "./average";
import { fractions } from "./fractions";
import { compareFractions } from "./compare-fractions";
import { rateDistance } from "./rate-distance";
import { workRate } from "./work-rate";
import { gcdLcm } from "./gcd-lcm";
import { exponents } from "./exponents";
import { roots } from "./roots";
import { numberSense } from "./number-sense";
import { wordArith } from "./word-arith";

/**
 * Active skills across domains — guests get three free labs via FREE_SKILL_IDS.
 * Full map: 16 حساب + 12 جبر + 12 هندسة + 10 إحصاء + 10 مقارنات = 60.
 */
export const ALL_SKILLS: Skill[] = [
  percentChange,
  percentOf,
  successivePercent,
  ratios,
  directInverse,
  buySell,
  average,
  fractions,
  compareFractions,
  rateDistance,
  workRate,
  gcdLcm,
  exponents,
  roots,
  numberSense,
  wordArith,
  ...ALGEBRA_SKILLS,
  ...GEOMETRY_SKILLS,
  ...STATISTICS_SKILLS,
  ...COMPARISON_SKILLS,
];

export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find((s) => s.id === id);
}

export function skillIdForSubPattern(sub: string): string | null {
  const map: Record<string, string> = {
    percent: "percent-change",
    ratio: "ratios",
    successive: "successive-percent",
    buy_sell: "buy-sell",
    average: "average",
    fraction: "fractions",
    rate: "rate-distance",
    number_sense: "number-sense",
    algebra: "linear-eq",
    geometry: "angles",
    statistics: "mean-list",
    probability: "prob-simple",
    comparison: "cmp-numbers",
  };
  return map[sub] ?? null;
}
