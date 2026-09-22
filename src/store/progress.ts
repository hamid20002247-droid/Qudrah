"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MockAttempt,
  ProgressState,
  RoundResult,
  SkillProgress,
} from "@/lib/types";
import { appendMockHistory, mergeMockHistory } from "@/lib/mock/examEngine";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `d_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const emptySkill = (): SkillProgress => ({
  started: false,
  completed: false,
  bestScore: 0,
  bestAvgTimeMs: null,
  lastScore: null,
  attempts: 0,
  roundsDone: 0,
  rounds: {},
});

function mergeSkill(raw?: Partial<SkillProgress>): SkillProgress {
  const base = emptySkill();
  if (!raw) return base;
  return {
    ...base,
    ...raw,
    roundsDone: raw.roundsDone ?? 0,
    rounds: raw.rounds ?? {},
  };
}

type ProgressActions = {
  markPracticedToday: () => void;
  startSkill: (skillId: string) => void;
  completeSkill: (
    skillId: string,
    score: number,
    total: number,
    avgTimeMs: number,
    round?: number,
    totalTimeMs?: number
  ) => void;
  saveMock: (attempt: MockAttempt) => void;
  setTestDate: (isoDate: string | null) => void;
  setContinueSkill: (skillId: string | null) => void;
  getSkillProgress: (skillId: string) => SkillProgress;
  daysUntilTest: () => number | null;
  recordMockExam: (
    fingerprints: string[],
    slot: number,
    opts?: {
      fullyAnswered?: boolean;
      score?: number;
      total?: number;
      answeredCount?: number;
      totalTimeMs?: number;
    }
  ) => void;
};

export function isFinalUnlocked(
  rounds: SkillProgress["rounds"] | undefined
): boolean {
  const r = rounds ?? {};
  return [1, 2, 3].every((n) => (r[n as 1 | 2 | 3]?.attempts ?? 0) > 0);
}

export const useProgress = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      deviceId: createDeviceId(),
      skills: {},
      lastMock: null,
      bestMockScore: null,
      testDate: null,
      streakDays: 0,
      lastPracticeDate: null,
      continueSkillId: null,
      mockHistory: {
        completedCount: 0,
        recentFingerprints: [],
        lastSlots: [],
        slotResults: {},
      },

      markPracticedToday: () => {
        const today = todayKey();
        const { lastPracticeDate, streakDays } = get();
        if (lastPracticeDate === today) return;

        let next = 1;
        if (lastPracticeDate) {
          const prev = new Date(lastPracticeDate + "T12:00:00");
          const now = new Date(today + "T12:00:00");
          const diff = Math.round(
            (now.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
          );
          next = diff === 1 ? streakDays + 1 : 1;
        }
        set({ lastPracticeDate: today, streakDays: next });
      },

      startSkill: (skillId) => {
        const current = mergeSkill(get().skills[skillId]);
        set({
          skills: {
            ...get().skills,
            [skillId]: { ...current, started: true },
          },
          continueSkillId: skillId,
        });
        get().markPracticedToday();
      },

      completeSkill: (
        skillId,
        score,
        total,
        avgTimeMs,
        round = 1,
        totalTimeMs
      ) => {
        const current = mergeSkill(get().skills[skillId]);
        const pct = total > 0 ? score / total : 0;
        const bestScore = Math.max(current.bestScore, pct);
        const bestAvgTimeMs =
          current.bestAvgTimeMs == null
            ? avgTimeMs
            : Math.min(current.bestAvgTimeMs, avgTimeMs);

        const r = round as 1 | 2 | 3 | 4;
        const prev = current.rounds[r];
        const totalMs = totalTimeMs ?? avgTimeMs * total;
        const roundResult: RoundResult = {
          lastScore: score,
          lastTotal: total,
          lastAvgTimeMs: avgTimeMs,
          lastTotalTimeMs: totalMs,
          bestScore: Math.max(prev?.bestScore ?? 0, score),
          bestAvgTimeMs:
            prev?.bestAvgTimeMs == null
              ? avgTimeMs
              : Math.min(prev.bestAvgTimeMs, avgTimeMs),
          attempts: (prev?.attempts ?? 0) + 1,
        };
        const rounds = { ...current.rounds, [r]: roundResult };
        const coreDone = [1, 2, 3].filter(
          (n) => (rounds[n as 1 | 2 | 3]?.attempts ?? 0) > 0
        ).length;

        set({
          skills: {
            ...get().skills,
            [skillId]: {
              ...current,
              started: true,
              completed: coreDone >= 1 || (rounds[4]?.attempts ?? 0) > 0,
              bestScore,
              bestAvgTimeMs,
              lastScore: pct,
              attempts: current.attempts + 1,
              roundsDone: Math.max(current.roundsDone, coreDone),
              rounds,
            },
          },
          continueSkillId: skillId,
        });
        get().markPracticedToday();
      },

      saveMock: (attempt) => {
        const best =
          get().bestMockScore == null
            ? attempt.score
            : Math.max(get().bestMockScore!, attempt.score);
        set({ lastMock: attempt, bestMockScore: best });
        get().markPracticedToday();
      },

      setTestDate: (isoDate) => set({ testDate: isoDate }),

      setContinueSkill: (skillId) => set({ continueSkillId: skillId }),

      getSkillProgress: (skillId) => mergeSkill(get().skills[skillId]),

      daysUntilTest: () => {
        const { testDate } = get();
        if (!testDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(testDate + "T00:00:00");
        const diff = Math.ceil(
          (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diff;
      },

      recordMockExam: (fingerprints, slot, opts) => {
        const prev = get().mockHistory ?? {
          completedCount: 0,
          recentFingerprints: [],
          lastSlots: [],
          slotResults: {},
        };
        set({
          mockHistory: appendMockHistory(prev, fingerprints, slot, {
            fullyAnswered: opts?.fullyAnswered,
            score: opts?.score,
            total: opts?.total,
            answeredCount: opts?.answeredCount,
            totalTimeMs: opts?.totalTimeMs,
          }),
        });
      },
    }),
    {
      name: "qudrah-progress-v2",
      skipHydration: true,
      partialize: (state) => ({
        deviceId: state.deviceId,
        skills: state.skills,
        lastMock: state.lastMock,
        bestMockScore: state.bestMockScore,
        testDate: state.testDate,
        streakDays: state.streakDays,
        lastPracticeDate: state.lastPracticeDate,
        continueSkillId: state.continueSkillId,
        mockHistory: state.mockHistory,
      }),
    }
  )
);
