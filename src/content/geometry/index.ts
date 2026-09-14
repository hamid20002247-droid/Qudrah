import type { Skill } from "@/lib/types";
import { angles } from "./angles";
import { perimeter } from "./perimeter";
import { rectArea } from "./rect-area";
import { triangleArea } from "./triangle-area";
import { pythagoras } from "./pythagoras";
import { circleCirc } from "./circle-circ";
import { circleArea } from "./circle-area";
import { volume } from "./volume";
import { surfaceArea } from "./surface-area";
import { specialTriangles } from "./special-triangles";
import { parallelLines } from "./parallel-lines";
import { unitsMeasure } from "./units-measure";

/**
 * هندسة — 12 مهارة حسب docs/KAMI_SKILLS_ROADMAP.md
 * مدمجة في ALL_SKILLS عبر src/content/arithmetic/index.ts
 */
export const GEOMETRY_SKILLS: Skill[] = [
  angles,
  perimeter,
  rectArea,
  triangleArea,
  pythagoras,
  circleCirc,
  circleArea,
  volume,
  surfaceArea,
  specialTriangles,
  parallelLines,
  unitsMeasure,
];

export {
  angles,
  perimeter,
  rectArea,
  triangleArea,
  pythagoras,
  circleCirc,
  circleArea,
  volume,
  surfaceArea,
  specialTriangles,
  parallelLines,
  unitsMeasure,
};

export function getGeometrySkillById(id: string): Skill | undefined {
  return GEOMETRY_SKILLS.find((skill) => skill.id === id);
}
