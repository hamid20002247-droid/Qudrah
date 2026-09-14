import type { ProgressState, RoundResult, SkillProgress } from "@/lib/types";

export type ProgressSnapshot = Pick<
  ProgressState,
  | "deviceId"
  | "skills"
  | "lastMock"
  | "bestMockScore"
  | "testDate"
  | "streakDays"
  | "lastPracticeDate"
  | "continueSkillId"
  | "mockHistory"
>;

function emptySkill(): SkillProgress {
  return {
    started: false,
    completed: false,
    bestScore: 0,
    bestAvgTimeMs: null,
    lastScore: null,
    attempts: 0,
    roundsDone: 0,
    rounds: {},
  };
}

function mergeRound(
  a?: RoundResult,
  b?: RoundResult
): RoundResult | undefined {
  if (!a) return b;
  if (!b) return a;
  return {
    lastScore: a.lastScore, // overwritten after we pick "newer" by attempts
    lastTotal: a.lastTotal,
    lastAvgTimeMs: a.lastAvgTimeMs,
    lastTotalTimeMs: a.lastTotalTimeMs,
    bestScore: Math.max(a.bestScore, b.bestScore),
    bestAvgTimeMs:
      a.bestAvgTimeMs == null
        ? b.bestAvgTimeMs
        : b.bestAvgTimeMs == null
          ? a.bestAvgTimeMs
          : Math.min(a.bestAvgTimeMs, b.bestAvgTimeMs),
    attempts: Math.max(a.attempts, b.attempts),
  };
}

function pickLatestRound(a?: RoundResult, b?: RoundResult): RoundResult | undefined {
  const merged = mergeRound(a, b);
  if (!merged) return undefined;
  // Prefer the side with more attempts for "last*" fields
  const preferA = (a?.attempts ?? 0) >= (b?.attempts ?? 0);
  const src = preferA ? a! : b!;
  return {
    ...merged,
    lastScore: src.lastScore,
    lastTotal: src.lastTotal,
    lastAvgTimeMs: src.lastAvgTimeMs,
    lastTotalTimeMs: src.lastTotalTimeMs,
  };
}

export function mergeSkillProgress(
  local?: Partial<SkillProgress>,
  remote?: Partial<SkillProgress>
): SkillProgress {
  const a = { ...emptySkill(), ...local, rounds: local?.rounds ?? {} };
  const b = { ...emptySkill(), ...remote, rounds: remote?.rounds ?? {} };
  const roundKeys = new Set([
    ...Object.keys(a.rounds).map(Number),
    ...Object.keys(b.rounds).map(Number),
  ]) as Set<1 | 2 | 3 | 4>;

  const rounds: SkillProgress["rounds"] = {};
  for (const k of roundKeys) {
    const merged = pickLatestRound(a.rounds[k], b.rounds[k]);
    if (merged) rounds[k] = merged;
  }

  const bestAvgTimeMs =
    a.bestAvgTimeMs == null
      ? b.bestAvgTimeMs
      : b.bestAvgTimeMs == null
        ? a.bestAvgTimeMs
        : Math.min(a.bestAvgTimeMs, b.bestAvgTimeMs);

  return {
    started: a.started || b.started,
    completed: a.completed || b.completed,
    bestScore: Math.max(a.bestScore, b.bestScore),
    bestAvgTimeMs,
    lastScore:
      (a.attempts >= b.attempts ? a.lastScore : b.lastScore) ??
      a.lastScore ??
      b.lastScore,
    attempts: Math.max(a.attempts, b.attempts),
    roundsDone: Math.max(a.roundsDone, b.roundsDone),
    rounds,
  };
}

export function snapshotFromState(state: ProgressSnapshot): ProgressSnapshot {
  return {
    deviceId: state.deviceId,
    skills: state.skills,
    lastMock: state.lastMock,
    bestMockScore: state.bestMockScore,
    testDate: state.testDate,
    streakDays: state.streakDays,
    lastPracticeDate: state.lastPracticeDate,
    continueSkillId: state.continueSkillId,
    mockHistory: state.mockHistory ?? {
      completedCount: 0,
      recentFingerprints: [],
      lastSlots: [],
    },
  };
}

/** Prefer richer / better progress from either side (local ↔ cloud). */
export function mergeProgressSnapshots(
  local: ProgressSnapshot,
  remote: ProgressSnapshot | null
): ProgressSnapshot {
  if (!remote) return local;

  const skillIds = new Set([
    ...Object.keys(local.skills ?? {}),
    ...Object.keys(remote.skills ?? {}),
  ]);
  const skills: Record<string, SkillProgress> = {};
  for (const id of skillIds) {
    skills[id] = mergeSkillProgress(local.skills[id], remote.skills[id]);
  }

  const bestMockScore =
    local.bestMockScore == null
      ? remote.bestMockScore
      : remote.bestMockScore == null
        ? local.bestMockScore
        : Math.max(local.bestMockScore, remote.bestMockScore);

  const lastMock =
    !local.lastMock
      ? remote.lastMock
      : !remote.lastMock
        ? local.lastMock
        : local.lastMock.completedAt >= remote.lastMock.completedAt
          ? local.lastMock
          : remote.lastMock;

  const streakDays = Math.max(local.streakDays ?? 0, remote.streakDays ?? 0);

  let lastPracticeDate = local.lastPracticeDate;
  if (
    remote.lastPracticeDate &&
    (!lastPracticeDate || remote.lastPracticeDate > lastPracticeDate)
  ) {
    lastPracticeDate = remote.lastPracticeDate;
  }

  return {
    deviceId: local.deviceId || remote.deviceId,
    skills,
    lastMock: lastMock ?? null,
    bestMockScore: bestMockScore ?? null,
    testDate: local.testDate ?? remote.testDate ?? null,
    streakDays,
    lastPracticeDate: lastPracticeDate ?? null,
    continueSkillId: local.continueSkillId ?? remote.continueSkillId ?? null,
    mockHistory: (() => {
      const a = local.mockHistory;
      const b = remote.mockHistory;
      if (!a) return b ?? { completedCount: 0, recentFingerprints: [], lastSlots: [] };
      if (!b) return a;
      return a.completedCount >= b.completedCount ? a : b;
    })(),
  };
}
