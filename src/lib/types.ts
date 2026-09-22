import type { SkillTiming } from "./timing";

export type Difficulty = "easy" | "mid" | "hard";
export type ReviewStatus = "draft" | "approved";
export type SubPattern =
  | "percent"
  | "ratio"
  | "average"
  | "rate"
  | "buy_sell"
  | "fraction"
  | "successive"
  | "number_sense"
  | "algebra"
  | "geometry"
  | "statistics"
  | "probability"
  | "comparison";

export type Question = {
  id: string;
  prompt_ar: string;
  choices_ar: string[];
  correct_index: number;
  trap_explanations_ar: Record<number, string>;
  /** Plain how-to for summary — very easy Arabic (required for active skills) */
  solve_ar?: string;
  trick_ref?: string;
  difficulty: Difficulty;
  sub_pattern: SubPattern;
  source: string;
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
};

export type VisualSpec =
  | { kind: "percent_bar"; base: number; min: number; max: number }
  | { kind: "ratio_split"; parts: number[] }
  | { kind: "number_line"; from: number; to: number }
  | { kind: "weighted_avg"; values: number[]; weights: number[] }
  | { kind: "rate_work"; distance: number }
  | { kind: "buy_sell"; cost: number }
  | { kind: "fraction_bars"; fractions: [number, number][] }
  | { kind: "successive_percent"; base: number }
  | {
      kind: "custom";
      component:
        | "percent-change-lab"
        | "percent-of-lab"
        | "ratio-lab"
        | "successive-lab"
        | "direct-inverse-lab"
        | "buy-sell-lab"
        | "average-lab"
        | "fractions-lab"
        | "compare-fractions-lab"
        | "rate-distance-lab"
        | "work-rate-lab"
        | "gcd-lcm-lab"
        | "exponents-lab"
        | "roots-lab"
        | "number-sense-lab"
        | "word-arith-lab"
        | "angles-lab"
        | "perimeter-lab"
        | "rect-area-lab"
        | "triangle-area-lab"
        | "pythagoras-lab"
        | "circle-circ-lab"
        | "circle-area-lab"
        | "volume-lab"
        | "surface-area-lab"
        | "special-triangles-lab"
        | "parallel-lines-lab"
        | "units-measure-lab"
        | "linear-eq-lab"
        | "two-step-eq-lab"
        | "eval-expr-lab"
        | "simplify-lab"
        | "inequalities-lab"
        | "arith-seq-lab"
        | "square-patterns-lab"
        | "ages-lab"
        | "word-to-algebra-lab"
        | "algebra-relations-lab"
        | "balance-sides-lab"
        | "check-by-sub-lab"
        | "mean-list-lab"
        | "mean-missing-lab"
        | "median-lab"
        | "mode-lab"
        | "range-lab"
        | "tables-lab"
        | "charts-lab"
        | "prob-simple-lab"
        | "prob-without-replace-lab"
        | "data-percent-lab"
        | "cmp-numbers-lab"
        | "cmp-percent-lab"
        | "cmp-frac-lab"
        | "cmp-area-lab"
        | "cmp-peri-area-lab"
        | "cmp-algebra-lab"
        | "cmp-roots-exp-lab"
        | "cmp-rates-lab"
        | "cmp-means-lab"
        | "cmp-insufficient-lab";
    };

export type Skill = {
  id: string;
  title_ar: string;
  domain: "arithmetic" | "algebra" | "geometry" | "statistics" | "comparison";
  hook_ar: string;
  estimated_minutes: number;
  icon: string;
  visual: VisualSpec;
  intuition_ar: string[];
  trick_ar: {
    statement: string;
    steps: string[];
    time_target_sec: number;
    example_ar: string;
  };
  /** Required for active skills shown in the app */
  timing?: SkillTiming;
  /** Pool for trainings 1–3 (target 18). Each round samples ROUND_SIZE shuffled. */
  drill: Question[];
  /** Extra questions for the locked final exam only (target 7). Final = drill + final_extra. */
  final_extra?: Question[];
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
};

/** Per-round best/last for challenge UX */
export type RoundResult = {
  lastScore: number;
  lastTotal: number;
  lastAvgTimeMs: number;
  lastTotalTimeMs: number;
  bestScore: number;
  bestAvgTimeMs: number | null;
  attempts: number;
};

export type SkillProgress = {
  started: boolean;
  completed: boolean;
  bestScore: number;
  bestAvgTimeMs: number | null;
  lastScore: number | null;
  attempts: number;
  /** @deprecated use rounds — kept for migration */
  roundsDone: number;
  /** Results keyed by round 1–4 */
  rounds: Partial<Record<1 | 2 | 3 | 4, RoundResult>>;
};

export type MockAttempt = {
  score: number;
  total: number;
  totalTimeMs: number;
  perSubPattern: Record<string, { correct: number; total: number }>;
  avgTimeMs: number;
  completedAt: string;
  questionIds: string[];
  answers: (number | null)[];
};

/** Per-question review shown on /result (session only — not persisted long-term). */
export type MockReviewItem = {
  prompt_ar: string;
  choices_ar: string[];
  chosen: number | null;
  correct_index: number;
  correct: boolean;
};

export type ProgressState = {
  deviceId: string;
  skills: Record<string, SkillProgress>;
  lastMock: MockAttempt | null;
  bestMockScore: number | null;
  testDate: string | null;
  streakDays: number;
  lastPracticeDate: string | null;
  continueSkillId: string | null;
  /** Anti-repeat history for full mock exams.
   * `lastSlots` = exams fully answered (all 60 questions). */
  mockHistory: {
    completedCount: number;
    recentFingerprints: string[];
    lastSlots: number[];
  };
};
