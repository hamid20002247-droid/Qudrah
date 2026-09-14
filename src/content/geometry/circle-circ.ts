import type { Skill } from "@/lib/types";

const review = {
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
};

export const circleCirc: Skill = {
  id: "circle-circ",
  title_ar: "الدائرة: المحيط",
  domain: "geometry",
  hook_ar: "المحيط = 2 × باي × نصف القطر — انتبه للقطر",
  estimated_minutes: 7,
  icon: "○",
  visual: { kind: "custom", component: "circle-circ-lab" },
  intuition_ar: [
    "محيط الدائرة هو طول الخط الذي يدور حولها مرة واحدة.",
    "الصيغة: محيط = 2 × باي × ر، حيث ر نصف القطر.",
    "القطر = 2 × ر. إن أُعطي القطر فحوّله إلى نصف قطر أولاً، أو استخدم محيط = باي × القطر.",
  ],
  trick_ar: {
    statement: "حدّد باي كما في السؤال، ثم ميّز: أُعطي ر أم القطر؟",
    steps: [
      "اقرأ قيمة باي: غالباً 22/7 أو 3.14",
      "إن أُعطي القطر: ر = القطر ÷ 2",
      "احسب: محيط = 2 × باي × ر",
    ],
    time_target_sec: 22,
    example_ar:
      "ر = 7 و باي = 22/7: المحيط = 2 × (22/7) × 7 = 44.",
  },
  timing: {
    excellent_sec: 22,
    good_sec: 32,
    ok_sec: 42,
    slow_sec: 56,
  },
  review_status: "approved",
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
  drill: [
    {
      id: "cc-01",
      prompt_ar:
        "دائرة نصف قطرها 7 سم، وباي = 22/7. كم محيطها؟",
      choices_ar: ["44 سم", "22 سم", "154 سم", "14 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2 أو اُستخدم القطر خطأ.",
        2: "حُسبت المساحة باي×ر² بدل المحيط.",
        3: "اُستخدم القطر فقط دون باي.",
      },
      solve_ar:
        "المحيط = 2 × (22/7) × 7 = 2 × 22 = 44 سم.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-02",
      prompt_ar:
        "عجلة نصف قطرها 14 سم، وباي = 22/7. كم محيط العجلة؟",
      choices_ar: ["88 سم", "44 سم", "616 سم", "28 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة بدل المحيط.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × (22/7) × 14 = 2 × 22 × 2 = 88 سم.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-03",
      prompt_ar:
        "دائرة قطرها 10 م، وباي = 3.14. كم محيطها؟",
      choices_ar: ["31.4 م", "15.7 م", "62.8 م", "314 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم نصف القطر مع نسيان الضرب في 2، أو قُسم الناتج على 2 خطأ.",
        2: "ضُعف المحيط بخلط القطر ونصف القطر.",
        3: "ضُرب باي في 100 خطأ.",
      },
      solve_ar:
        "القطر = 10 فالمحيط = باي × القطر = 3.14 × 10 = 31.4 م. أو ر = 5 ثم 2×3.14×5 = 31.4.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-04",
      prompt_ar:
        "بركة دائرية نصف قطرها 3 م، وباي = 3.14. كم طول السياج حولها؟",
      choices_ar: ["18.84 م", "9.42 م", "28.26 م", "6 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة تقريباً.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "طول السياج = المحيط = 2 × 3.14 × 3 = 18.84 م.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-05",
      prompt_ar:
        "دائرة قطرها 14 سم، وباي = 22/7. كم محيطها؟",
      choices_ar: ["44 سم", "88 سم", "154 سم", "28 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان نصف القطر في 2×باي×ر فصار الناتج مضاعفاً.",
        2: "حُسبت المساحة.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "ر = 14 ÷ 2 = 7. المحيط = 2 × (22/7) × 7 = 44 سم. أو باي×القطر = (22/7)×14 = 44.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-06",
      prompt_ar:
        "طوق دائري نصف قطره 21 سم، وباي = 22/7. كم طول الطوق؟",
      choices_ar: ["132 سم", "66 سم", "1386 سم", "42 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × (22/7) × 21 = 2 × 22 × 3 = 132 سم.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-07",
      prompt_ar:
        "ساعة حائط دائرية قطر واجهتها 20 سم، وباي = 3.14. كم محيط الإطار؟",
      choices_ar: ["62.8 سم", "31.4 سم", "125.6 سم", "40 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم نصف القطر مع نسيان أحد العوامل، أو قُسم المحيط على 2.",
        2: "اُستخدم القطر مكان نصف القطر في 2×باي×ر.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "المحيط = 3.14 × 20 = 62.8 سم.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-08",
      prompt_ar:
        "محيط دائرة = 44 م وباي = 22/7. كم نصف قطرها؟",
      choices_ar: ["7 م", "14 م", "22 م", "28 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي الناتج كقطر بدل نصف القطر.",
        2: "قُسم المحيط على 2 فقط.",
        3: "خُلط مع باي×ر دون حل صحيح.",
      },
      solve_ar:
        "44 = 2 × (22/7) × ر ⇒ 44 = (44/7) × ر ⇒ ر = 44 × (7/44) = 7 م.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-09",
      prompt_ar:
        "مضمار دائري نصف قطره 35 م، وباي = 22/7. كم طول لفة واحدة؟",
      choices_ar: ["220 م", "110 م", "3850 م", "70 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "لفة = المحيط = 2 × (22/7) × 35 = 2 × 22 × 5 = 220 م.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-10",
      prompt_ar:
        "دائرة قطرها 7 سم، وباي = 22/7. كم محيطها؟",
      choices_ar: ["22 سم", "44 سم", "77 سم", "14 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُعتبر القطر نصف قطر فصار المحيط مضاعفاً.",
        2: "حُسبت المساحة تقريباً أو باي×ر×ر بـ ر=7.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "ر = 7÷2 = 3.5. المحيط = 2 × (22/7) × 3.5 = (44/7) × 3.5 = 22 سم. أو (22/7)×7 = 22.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-11",
      prompt_ar:
        "حبل يلتف حول بكرة نصف قطرها 5 سم مرة واحدة، وباي = 3.14. كم طول الحبل المستخدم؟",
      choices_ar: ["31.4 سم", "15.7 سم", "78.5 سم", "10 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "الطول = المحيط = 2 × 3.14 × 5 = 31.4 سم.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-12",
      prompt_ar:
        "محيط دائرة = 62.8 م وباي = 3.14. كم قطرها؟",
      choices_ar: ["20 م", "10 م", "31.4 م", "40 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي نصف القطر بدل القطر.",
        2: "قُسم المحيط على 2 فقط.",
        3: "ضُعف الناتج خطأ.",
      },
      solve_ar:
        "المحيط = باي × القطر ⇒ القطر = 62.8 ÷ 3.14 = 20 م.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-13",
      prompt_ar:
        "طاولة دائرية نصف قطرها 28 سم، وباي = 22/7. كم محيط حافتها؟",
      choices_ar: ["176 سم", "88 سم", "2464 سم", "56 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × (22/7) × 28 = 2 × 22 × 4 = 176 سم.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-14",
      prompt_ar:
        "مسار دائري قطره 50 م، وباي = 3.14. كم طول دورة كاملة؟",
      choices_ar: ["157 م", "78.5 م", "314 م", "100 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم نصف القطر مع نسيان الضرب في 2 بشكل صحيح، أو قُسم على 2.",
        2: "اُستخدم القطر مكان نصف القطر في 2×باي×ر.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "الدورة = 3.14 × 50 = 157 م.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-15",
      prompt_ar:
        "دائرة محيطها 88 سم وباي = 22/7. كم قطرها؟",
      choices_ar: ["28 سم", "14 سم", "44 سم", "7 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي نصف القطر بدل القطر.",
        2: "قُسم المحيط على 2 فقط.",
        3: "حُسب نصف القطر ثم نُسي الضرب في 2 للقطر.",
      },
      solve_ar:
        "88 = 2 × (22/7) × ر ⇒ ر = 14. فالقطر = 28 سم. أو القطر = 88 ÷ (22/7) = 88 × 7/22 = 28.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-16",
      prompt_ar:
        "نافورة دائرية نصف قطر حوضها 1.5 م، وباي = 3.14. كم محيط الحوض؟",
      choices_ar: ["9.42 م", "4.71 م", "7.065 م", "3 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة تقريباً.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × 3.14 × 1.5 = 9.42 م.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-17",
      prompt_ar:
        "عجلة قطرها 42 سم، وباي = 22/7. بعد دورة كاملة على الأرض، كم تقطع؟",
      choices_ar: ["132 سم", "264 سم", "1386 سم", "84 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان نصف القطر فصار الناتج مضاعفاً.",
        2: "حُسبت المساحة.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "المسافة = المحيط = (22/7) × 42 = 22 × 6 = 132 سم.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-18",
      prompt_ar:
        "إذا كان نصف قطر دائرة = 4 م وباي = 3.14، فأي عبارة صحيحة عن المحيط؟",
      choices_ar: [
        "المحيط = 25.12 م",
        "المحيط = 12.56 م",
        "المحيط = 50.24 م",
        "المحيط = 8 م",
      ],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "اُستخدم القطر مكان نصف القطر في 2×باي×ر.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × 3.14 × 4 = 25.12 م.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
  ],
  final_extra: [
    {
      id: "cc-f01",
      prompt_ar:
        "خاتم دائري نصف قطره 3.5 سم، وباي = 22/7. كم محيط الخاتم؟",
      choices_ar: ["22 سم", "11 سم", "38.5 سم", "7 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × (22/7) × 3.5 = 2 × 22 × 0.5 = 22 سم.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f02",
      prompt_ar:
        "دائرة قطرها 6 م، وباي = 3.14. كم محيطها؟",
      choices_ar: ["18.84 م", "9.42 م", "37.68 م", "12 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم نصف القطر مع نسيان الضرب في 2 بشكل صحيح.",
        2: "اُستخدم القطر مكان نصف القطر في الصيغة 2×باي×ر.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "المحيط = 3.14 × 6 = 18.84 م.",
      trick_ref: "circle-circ",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f03",
      prompt_ar:
        "محيط بركة دائرية 110 م وباي = 22/7. كم نصف قطرها؟",
      choices_ar: ["17.5 م", "35 م", "55 م", "5 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي القطر بدل نصف القطر.",
        2: "قُسم المحيط على 2 فقط.",
        3: "حُسب خطأ في قلب الصيغة.",
      },
      solve_ar:
        "110 = 2 × (22/7) × ر ⇒ 110 = (44/7) × ر ⇒ ر = 110 × 7/44 = 17.5 م.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f04",
      prompt_ar:
        "إطار سيارة نصف قطره 25 سم، وباي = 3.14. كم محيط الإطار؟",
      choices_ar: ["157 سم", "78.5 سم", "1962.5 سم", "50 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "المحيط = 2 × 3.14 × 25 = 157 سم.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f05",
      prompt_ar:
        "دائرة قطرها 21 سم وباي = 22/7. كم محيطها؟",
      choices_ar: ["66 سم", "132 سم", "346.5 سم", "42 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان نصف القطر.",
        2: "حُسبت المساحة بـ ر=21 خطأ.",
        3: "ضُعف القطر فقط.",
      },
      solve_ar:
        "المحيط = (22/7) × 21 = 66 سم.",
      trick_ref: "circle-circ",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f06",
      prompt_ar:
        "محيط دائرة 25.12 م وباي = 3.14. كم نصف قطرها؟",
      choices_ar: ["4 م", "8 م", "12.56 م", "2 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي القطر بدل نصف القطر.",
        2: "قُسم المحيط على 2 فقط.",
        3: "قُسم على باي دون مراعاة العامل 2 بشكل صحيح.",
      },
      solve_ar:
        "25.12 = 2 × 3.14 × ر ⇒ 25.12 = 6.28 × ر ⇒ ر = 4 م.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "cc-f07",
      prompt_ar:
        "حديقة دائرية نصف قطرها 49 م، وباي = 22/7. كم طول السور حولها؟",
      choices_ar: ["308 م", "154 م", "7546 م", "98 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "نُسي الضرب في 2.",
        2: "حُسبت المساحة.",
        3: "ضُعف نصف القطر فقط.",
      },
      solve_ar:
        "السور = 2 × (22/7) × 49 = 2 × 22 × 7 = 308 م.",
      trick_ref: "circle-circ",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
  ],
};
