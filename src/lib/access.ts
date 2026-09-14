import { getSkillById } from "@/content/arithmetic";
import type { Skill } from "@/lib/types";

/**
 * Guest free trail — three strongest labs:
 * 1) percent-change — denom trap (drag bar)
 * 2) successive-percent — +20/−20 machines
 * 3) pythagoras — interactive right triangle
 */
export const FREE_SKILL_IDS = [
  "percent-change",
  "successive-percent",
  "pythagoras",
] as const;

export type FreeSkillId = (typeof FREE_SKILL_IDS)[number];

/** First free skill — default “start here”. */
export const FREE_SKILL_ID: FreeSkillId = FREE_SKILL_IDS[0];

export const FREE_SKILL_COUNT = FREE_SKILL_IDS.length;

export function isSkillOpenWithoutAuth(skillId: string): boolean {
  return (FREE_SKILL_IDS as readonly string[]).includes(skillId);
}

export function getFreeSkills(): Skill[] {
  return FREE_SKILL_IDS.map((id) => getSkillById(id)).filter(
    (s): s is Skill => Boolean(s),
  );
}

export type FreePathItemStatus = "done" | "current" | "next" | "todo";

export type FreePathItem = {
  id: FreeSkillId;
  order: number;
  title_ar: string;
  hook_ar: string;
  href: string;
  status: FreePathItemStatus;
  started: boolean;
  completed: boolean;
};

export type FreePathState = {
  items: FreePathItem[];
  completedCount: number;
  total: number;
  allDone: boolean;
  nextId: FreeSkillId | null;
  nextHref: string;
  /** Primary CTA copy for the trail. */
  ctaLabel: string;
};

export function buildFreePathState(
  getProgress: (id: string) => { started: boolean; completed: boolean },
  currentSkillId?: string | null,
): FreePathState {
  const nextId =
    FREE_SKILL_IDS.find((id) => !getProgress(id).completed) ?? null;

  const items: FreePathItem[] = FREE_SKILL_IDS.map((id, i) => {
    const skill = getSkillById(id);
    const p = getProgress(id);
    let status: FreePathItemStatus = "todo";
    if (p.completed) status = "done";
    else if (currentSkillId === id) status = "current";
    else if (id === nextId) status = "next";

    return {
      id,
      order: i + 1,
      title_ar: skill?.title_ar ?? id,
      hook_ar: skill?.hook_ar ?? "",
      href: `/skill/${id}`,
      status,
      started: p.started,
      completed: p.completed,
    };
  });

  const completedCount = items.filter((x) => x.completed).length;
  const allDone = completedCount >= FREE_SKILL_COUNT;
  const nextHref = nextId ? `/skill/${nextId}` : "/auth";

  let ctaLabel = "ابدأ بدون حساب";
  if (allDone) ctaLabel = "كل شيء مجاني — ادخل بحساب Google";
  else if (nextId && getProgress(nextId).started) {
    ctaLabel = `كمّل: ${items.find((x) => x.id === nextId)?.title_ar ?? ""}`;
  } else if (completedCount > 0 && nextId) {
    ctaLabel = `التالي بدون حساب (${completedCount + 1} من ${FREE_SKILL_COUNT})`;
  }

  return {
    items,
    completedCount,
    total: FREE_SKILL_COUNT,
    allDone,
    nextId,
    nextHref,
    ctaLabel,
  };
}

/** Next free skill after `skillId`, or null if this was the last / not free. */
export function nextFreeSkillId(skillId: string): FreeSkillId | null {
  const i = (FREE_SKILL_IDS as readonly string[]).indexOf(skillId);
  if (i < 0) return null;
  return FREE_SKILL_IDS[i + 1] ?? null;
}

export function authHref(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `/auth?next=${encodeURIComponent(next)}`;
}

export function authHrefForSkill(skillId: string): string {
  return authHref(`/skill/${skillId}`);
}

/** Paths guests may use without an account. */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "") return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/about")) return true;
  for (const id of FREE_SKILL_IDS) {
    if (pathname === `/skill/${id}` || pathname.startsWith(`/skill/${id}/`)) {
      return true;
    }
  }
  // Skills map + coming-soon skill pages are browsable; live locked skills use SkillAccessGate
  if (pathname === "/skills" || pathname.startsWith("/skills/")) return true;
  if (pathname.startsWith("/skill/")) return true;
  return false;
}
