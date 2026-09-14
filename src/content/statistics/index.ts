/**
 * إحصاء واحتمالات — 10 مهارات حسب docs/KAMI_SKILLS_ROADMAP.md
 * مدمجة في ALL_SKILLS عبر src/content/arithmetic/index.ts
 */
import type { Skill } from "@/lib/types";
import { meanList } from "./mean-list";
import { meanMissing } from "./mean-missing";
import { median } from "./median";
import { mode } from "./mode";
import { rangeSkill } from "./range";
import { tables } from "./tables";
import { charts } from "./charts";
import { probSimple } from "./prob-simple";
import { probWithoutReplace } from "./prob-without-replace";
import { dataPercent } from "./data-percent";

export const STATISTICS_SKILLS: Skill[] = [
  meanList,
  meanMissing,
  median,
  mode,
  rangeSkill,
  tables,
  charts,
  probSimple,
  probWithoutReplace,
  dataPercent,
];

export {
  meanList,
  meanMissing,
  median,
  mode,
  rangeSkill,
  tables,
  charts,
  probSimple,
  probWithoutReplace,
  dataPercent,
};

export function getStatisticsSkillById(id: string): Skill | undefined {
  return STATISTICS_SKILLS.find((skill) => skill.id === id);
}
