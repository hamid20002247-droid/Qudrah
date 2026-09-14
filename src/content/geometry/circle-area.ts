import type { Skill } from "@/lib/types";

const review = {
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
};

export const circleArea: Skill = {
  id: "circle-area",
  title_ar: "الدائرة: المساحة",
  domain: "geometry",
  hook_ar: "المساحة = باي × ر² — لا تضع القطر مكان ر",
  estimated_minutes: 7,
  icon: "◎",
  visual: { kind: "custom", component: "circle-area-lab" },
  intuition_ar: [
    "مساحة الدائرة تقيس ما بداخلها، وليست طول المحيط.",
    "الصيغة: مساحة = باي × ر × ر، أي باي × ر².",
    "إن أُعطي القطر: ر = القطر ÷ 2 قبل التربيع. تربيع القطر خطأ شائع.",
  ],
  trick_ar: {
    statement: "حوّل إلى نصف قطر، ربّع، ثم اضرب في باي.",
    steps: [
      "إن أُعطي القطر: ر = القطر ÷ 2",
      "احسب ر²",
      "اضرب في باي (22/7 أو 3.14 حسب السؤال)",
    ],
    time_target_sec: 22,
    example_ar:
      "ر = 7 و باي = 22/7: المساحة = (22/7) × 49 = 154.",
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
      id: "ca-01",
      prompt_ar:
        "دائرة نصف قطرها 7 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["154 سم²", "44 سم²", "22 سم²", "49 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط بدل المساحة.",
        2: "نُسي التربيع أو الضرب في باي.",
        3: "رُبّع نصف القطر دون ضرب باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-02",
      prompt_ar:
        "حديقة دائرية نصف قطرها 5 م، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["78.5 م²", "31.4 م²", "15.7 م²", "25 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط تقريباً.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = 3.14 × 5² = 3.14 × 25 = 78.5 م².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-03",
      prompt_ar:
        "دائرة قطرها 14 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["154 سم²", "616 سم²", "44 سم²", "196 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان نصف القطر في باي×ر².",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 14 ÷ 2 = 7. المساحة = (22/7) × 49 = 154 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-04",
      prompt_ar:
        "طاولة دائرية نصف قطرها 10 سم، وباي = 3.14. كم مساحة سطحها؟",
      choices_ar: ["314 سم²", "62.8 سم²", "31.4 سم²", "100 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع أو استُخدم القطر/2 خطأ إضافي.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = 3.14 × 10² = 3.14 × 100 = 314 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-05",
      prompt_ar:
        "مرآة دائرية قطرها 20 سم، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["314 سم²", "1256 سم²", "62.8 سم²", "400 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر 20 مكان ر فصار 3.14×400.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 20 ÷ 2 = 10. المساحة = 3.14 × 100 = 314 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-06",
      prompt_ar:
        "دائرة نصف قطرها 14 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["616 سم²", "88 سم²", "44 سم²", "196 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 14² = (22/7) × 196 = 22 × 28 = 616 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-07",
      prompt_ar:
        "ملصق دائري قطره 7 سم، وباي = 22/7. كم مساحته؟",
      choices_ar: ["38.5 سم²", "154 سم²", "22 سم²", "49 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان نصف القطر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 7 ÷ 2 = 3.5. المساحة = (22/7) × (3.5)² = (22/7) × 12.25 = 38.5 سم².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-08",
      prompt_ar:
        "بركة دائرية نصف قطرها 3 م، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["28.26 م²", "18.84 م²", "9.42 م²", "9 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = 3.14 × 9 = 28.26 م².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-09",
      prompt_ar:
        "مساحة دائرة = 154 م² وباي = 22/7. كم نصف قطرها؟",
      choices_ar: ["7 م", "14 م", "11 م", "22 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي القطر بدل نصف القطر.",
        2: "قُسم المساحة على باي دون جذر.",
        3: "خُلط مع المحيط.",
      },
      solve_ar:
        "154 = (22/7) × ر² ⇒ ر² = 154 × 7/22 = 49 ⇒ ر = 7 م.",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-10",
      prompt_ar:
        "غطاء دائري قطره 10 سم، وباي = 3.14. كم مساحته؟",
      choices_ar: ["78.5 سم²", "314 سم²", "31.4 سم²", "100 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 5. المساحة = 3.14 × 25 = 78.5 سم².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-11",
      prompt_ar:
        "دائرة نصف قطرها 21 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["1386 سم²", "132 سم²", "66 سم²", "441 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 21² = (22/7) × 441 = 22 × 63 = 1386 سم².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-12",
      prompt_ar:
        "مساحة دائرة = 78.5 م² وباي = 3.14. كم نصف قطرها؟",
      choices_ar: ["5 م", "10 م", "25 م", "15.7 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي القطر بدل نصف القطر.",
        2: "تُرك ر² دون أخذ الجذر.",
        3: "قُسم المساحة على 5 خطأ.",
      },
      solve_ar:
        "78.5 = 3.14 × ر² ⇒ ر² = 25 ⇒ ر = 5 م.",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-13",
      prompt_ar:
        "نافذة دائرية قطرها 28 سم، وباي = 22/7. كم مساحة الزجاج؟",
      choices_ar: ["616 سم²", "2464 سم²", "176 سم²", "784 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 14. المساحة = (22/7) × 196 = 616 سم².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-14",
      prompt_ar:
        "حديقة دائرية قطرها 6 م، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["28.26 م²", "113.04 م²", "18.84 م²", "36 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 3. المساحة = 3.14 × 9 = 28.26 م².",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-15",
      prompt_ar:
        "دائرة نصف قطرها 1.5 م، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["7.065 م²", "9.42 م²", "4.71 م²", "2.25 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = 3.14 × (1.5)² = 3.14 × 2.25 = 7.065 م².",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-16",
      prompt_ar:
        "مساحة دائرة = 616 سم² وباي = 22/7. كم قطرها؟",
      choices_ar: ["28 سم", "14 سم", "44 سم", "7 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي نصف القطر بدل القطر.",
        2: "خُلط مع المحيط.",
        3: "أُخذ جذر جزئي خطأ.",
      },
      solve_ar:
        "616 = (22/7) × ر² ⇒ ر² = 196 ⇒ ر = 14. فالقطر = 28 سم.",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-17",
      prompt_ar:
        "سجادة دائرية نصف قطرها 35 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["3850 سم²", "220 سم²", "110 سم²", "1225 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع نصف القطر دون باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 35² = (22/7) × 1225 = 22 × 175 = 3850 سم².",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-18",
      prompt_ar:
        "أي خطأ يضاعف المساحة المحسوبة أربع مرات غالباً؟",
      choices_ar: [
        "استخدام القطر بدل نصف القطر في باي × ر²",
        "نسيان الضرب في باي",
        "قسمة القطر على 2",
        "تربيع نصف القطر",
      ],
      correct_index: 0,
      trap_explanations_ar: {
        1: "هذا يصغّر الناتج لا يضاعفه أربع مرات.",
        2: "هذا هو التحويل الصحيح.",
        3: "هذا جزء من الحل الصحيح.",
      },
      solve_ar:
        "إن وُضع القطر بدل ر فإن ر² تُستبدل بـ (2ر)² = 4ر²، فتصير المساحة أربعة أضعاف.",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
  ],
  final_extra: [
    {
      id: "ca-f01",
      prompt_ar:
        "دائرة نصف قطرها 4 سم، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["50.24 سم²", "25.12 سم²", "12.56 سم²", "16 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع دون باي.",
      },
      solve_ar:
        "المساحة = 3.14 × 16 = 50.24 سم².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f02",
      prompt_ar:
        "قرص دائري قطره 14 م، وباي = 22/7. كم مساحته؟",
      choices_ar: ["154 م²", "616 م²", "44 م²", "196 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 7. المساحة = (22/7) × 49 = 154 م².",
      trick_ref: "circle-area",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f03",
      prompt_ar:
        "مساحة دائرة = 314 سم² وباي = 3.14. كم نصف قطرها؟",
      choices_ar: ["10 سم", "20 سم", "100 سم", "31.4 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "أُعطي القطر.",
        2: "تُرك ر² دون جذر.",
        3: "قُسم المساحة على 10 خطأ.",
      },
      solve_ar:
        "314 = 3.14 × ر² ⇒ ر² = 100 ⇒ ر = 10 سم.",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f04",
      prompt_ar:
        "حوض دائري نصف قطره 28 سم، وباي = 22/7. كم مساحة قاعدته؟",
      choices_ar: ["2464 سم²", "176 سم²", "88 سم²", "784 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع دون باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 28² = (22/7) × 784 = 22 × 112 = 2464 سم².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f05",
      prompt_ar:
        "دائرة قطرها 50 سم، وباي = 3.14. كم مساحتها؟",
      choices_ar: ["1962.5 سم²", "7850 سم²", "157 سم²", "2500 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 25. المساحة = 3.14 × 625 = 1962.5 سم².",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f06",
      prompt_ar:
        "دائرة نصف قطرها 49 سم، وباي = 22/7. كم مساحتها؟",
      choices_ar: ["7546 سم²", "308 سم²", "154 سم²", "2401 سم²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "حُسب المحيط.",
        2: "نُسي التربيع.",
        3: "رُبّع دون باي.",
      },
      solve_ar:
        "المساحة = (22/7) × 49² = (22/7) × 2401 = 22 × 343 = 7546 سم².",
      trick_ref: "circle-area",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "ca-f07",
      prompt_ar:
        "إذا كان قطر دائرة = 8 م وباي = 3.14، فكم مساحتها؟",
      choices_ar: ["50.24 م²", "200.96 م²", "25.12 م²", "64 م²"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُستخدم القطر مكان ر.",
        2: "حُسب المحيط.",
        3: "رُبّع القطر دون باي.",
      },
      solve_ar:
        "ر = 4. المساحة = 3.14 × 16 = 50.24 م².",
      trick_ref: "circle-area",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
  ],
};
