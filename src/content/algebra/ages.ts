import type { Skill } from "@/lib/types";

const review = {
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
};

export const ages: Skill = {
  id: "ages",
  title_ar: "مسائل الأعمار",
  domain: "algebra",
  hook_ar: "أمثال العمر ومجموع العمرين — أوجد عمر الأب أو الابن",
  estimated_minutes: 8,
  icon: "⌚",
  visual: { kind: "custom", component: "ages-lab" },
  intuition_ar: [
    "اجعل عمر الأصغر س، ثم عبّر عن عمر الأكبر بدلالة س.",
    "مجموع العمرين أو الفرق يعطي معادلة واحدة تُحل بسرعة.",
    "بعد إيجاد س تحقّق: هل مجموع الأعمار أو الأمثال يطابق المعطى؟",
  ],
  trick_ar: {
    statement: "س للأصغر، الأكبر = أمثال × س، ثم اجمع أو ساوِ حسب النص.",
    steps: [
      "عمر الابن = س",
      "عمر الأب = عدد الأمثال × س (أو مجموع − س)",
      "حلّ المعادلة ثم اقرأ المطلوب",
    ],
    time_target_sec: 24,
    example_ar:
      "أب ثلاثة أمثال ابنه ومجموعهما 48: س + 3س = 48 → 4س = 48 → س = 12، والأب 36.",
  },
  timing: {
    excellent_sec: 24,
    good_sec: 34,
    ok_sec: 45,
    slow_sec: 60,
  },
  review_status: "approved",
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
  drill: [
    {
      id: "ages-01",
      prompt_ar:
        "عمر الأب ثلاثة أمثال عمر ابنه، ومجموع عمرهما 48 سنة. كم عمر الابن؟",
      choices_ar: ["10 سنوات", "12 سنة", "16 سنة", "36 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم 48 على 5 تقريباً.",
        2: "قُسم 48 على 3.",
        3: "حُسب عمر الأب بدل الابن.",
      },
      solve_ar: "س + 3س = 48 → 4س = 48 → س = 12 سنة.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-02",
      prompt_ar:
        "عمر الأم ضعف عمر ابنتها، والمجموع 45 سنة. كم عمر الأم؟",
      choices_ar: ["15 سنة", "22.5 سنة", "30 سنة", "40 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب عمر الابنة.",
        1: "قُسم المجموع على 2 دون الأمثال.",
        3: "طرح أو تقدير بعيد.",
      },
      solve_ar: "س + 2س = 45 → 3س = 45 → س = 15، الأم = 30.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-03",
      prompt_ar:
        "عمر الأب ثلاثة أمثال عمر ابنه، والفرق بينهما 24 سنة. كم عمر الابن؟",
      choices_ar: ["8 سنوات", "12 سنة", "16 سنة", "24 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم 24 على 3.",
        2: "قُسم 24 على 1.5.",
        3: "أُخذ الفرق كما هو.",
      },
      solve_ar: "3س − س = 24 → 2س = 24 → س = 12.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-04",
      prompt_ar:
        "مجموع عمري أخوين 26 سنة، والكبير أكبر بـ 4 سنوات. كم عمر الصغير؟",
      choices_ar: ["9 سنوات", "11 سنة", "13 سنة", "15 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "طُرح 4 ثم قُسم خطأ.",
        2: "أُخذ نصف المجموع دون الفرق.",
        3: "حُسب عمر الكبير.",
      },
      solve_ar:
        "ليكن الصغير س والكبير س+4: 2س+4=26 → 2س=22 → س=11.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-05",
      prompt_ar:
        "عمر جدّ أربعة أمثال عمر حفيده، والمجموع 70. كم عمر الحفيد؟",
      choices_ar: ["10 سنوات", "14 سنة", "17.5 سنة", "56 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم على 7.",
        2: "قُسم على 4.",
        3: "حُسب عمر الجد.",
      },
      solve_ar: "س + 4س = 70 → 5س = 70 → س = 14.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-06",
      prompt_ar:
        "الآن عمر الأب 40 وعمر الابن 10. بعد كم سنة يصير عمر الأب ثلاثة أمثال عمر الابن؟",
      choices_ar: ["2 سنة", "5 سنوات", "10 سنوات", "15 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "تقدير ناقص.",
        2: "حُسب حتى يتساوى الفرق فقط.",
        3: "زِيد كثيراً.",
      },
      solve_ar:
        "بعد س سنة: 40+س = 3(10+س) → 40+س = 30+3س → 10 = 2س → س = 5.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-07",
      prompt_ar:
        "عمر أم ضعف عمر ابنها، وعمر الأب يزيد عن الأم بـ 6، ومجموع الثلاثة 66. كم عمر الابن؟",
      choices_ar: ["10 سنوات", "12 سنة", "15 سنة", "18 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُسي إضافة 6.",
        2: "قُسم المجموع على 4.4 تقريباً.",
        3: "حُسب عمر الأم.",
      },
      solve_ar:
        "ابن س، أم 2س، أب 2س+6: س+2س+2س+6=66 → 5س=60 → س=12.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-08",
      prompt_ar:
        "عمر شخص ضعف عمر أخيه، ومجموعهما 39. كم عمر الأخ الأكبر؟",
      choices_ar: ["13 سنة", "19.5 سنة", "26 سنة", "30 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب الأصغر.",
        1: "نُصف المجموع.",
        3: "تقدير زائد.",
      },
      solve_ar: "س + 2س = 39 → س = 13، الأكبر = 26.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-09",
      prompt_ar:
        "قبل 5 سنوات كان عمر الأب ثلاثة أمثال عمر الابن. الآن عمر الابن 17 سنة. كم عمر الأب الآن؟",
      choices_ar: ["36 سنة", "41 سنة", "46 سنة", "51 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُسي إضافة 5 لعمر الأب.",
        2: "أُضيف 5 مرتين أو حُسب خطأ.",
        3: "ضُرب 17×3 دون الرجوع للماضي.",
      },
      solve_ar:
        "قبل 5 سنوات عمر الابن 12، فالأب كان 36. الآن الأب = 36 + 5 = 41.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-10",
      prompt_ar:
        "عمر معلّمة يزيد عن عمر طالبة بـ 28 سنة، والمجموع 44. كم عمر الطالبة؟",
      choices_ar: ["8 سنوات", "12 سنة", "16 سنة", "28 سنة"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "قُسم الفرق أو المجموع خطأ.",
        2: "نُصف المجموع.",
        3: "أُخذ الفرق كما هو.",
      },
      solve_ar: "س + (س+28) = 44 → 2س = 16 → س = 8.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-11",
      prompt_ar:
        "عمر أب خمسة أمثال عمر ابنه، والفرق بينهما 36 سنة. كم عمر الأب؟",
      choices_ar: ["9 سنوات", "36 سنة", "45 سنة", "54 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب عمر الابن: 36÷4.",
        1: "أُخذ الفرق كما هو.",
        3: "زِيد على الناتج.",
      },
      solve_ar: "5س − س = 36 → 4س = 36 → س = 9، الأب = 45.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-12",
      prompt_ar:
        "مجموع أعمار ثلاثة أبناء متساوين في العمر وأبيهم 70، والأب ضعف أحدهم. كم عمر كل ابن؟",
      choices_ar: ["10 سنوات", "14 سنة", "17.5 سنة", "20 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم على 7.",
        2: "قُسم على 4.",
        3: "حُسب عمر الأب.",
      },
      solve_ar: "3س + 2س = 70 → 5س = 70 → س = 14.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-13",
      prompt_ar:
        "عمر خالة ضعف عمر ابنة أختها، وبعد 4 سنوات يصير مجموعهما 44. كم عمر الابنة الآن؟",
      choices_ar: ["10 سنوات", "12 سنة", "14 سنة", "20 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُسي السنوات المضافة.",
        2: "زِيد على الناتج.",
        3: "حُسب عمر الخالة.",
      },
      solve_ar:
        "الآن: س و 2س. بعد 4: (س+4)+(2س+4)=44 → 3س+8=44 → 3س=36 → س=12.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-14",
      prompt_ar:
        "عمر رجل 48 وعمر ابنه 18. منذ كم سنة كان عمر الرجل أربعة أمثال عمر ابنه؟",
      choices_ar: ["6 سنوات", "8 سنوات", "10 سنوات", "12 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "تقدير ناقص.",
        2: "حُسب للمستقبل لا الماضي.",
        3: "زِيد.",
      },
      solve_ar:
        "قبل س سنة: 48−س = 4(18−س) → 48−س = 72−4س → 3س = 24 → س = 8.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-15",
      prompt_ar:
        "عمر أم ثلاثة أمثال عمر طفلتها، والمجموع 52. كم عمر الأم؟",
      choices_ar: ["13 سنة", "26 سنة", "39 سنة", "42 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب عمر الطفلة.",
        1: "نُصف أو ضعف الطفلة فقط.",
        3: "تقدير زائد.",
      },
      solve_ar: "س + 3س = 52 → س = 13، الأم = 39.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-16",
      prompt_ar:
        "عمر أخوين مجموعهما 30، والكبير يساوي مرة ونصف الصغير. كم عمر الكبير؟",
      choices_ar: ["12 سنة", "15 سنة", "18 سنة", "20 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب الصغير.",
        1: "نُصف المجموع.",
        3: "قُرب زائد.",
      },
      solve_ar:
        "صغير س وكبير (3/2)س: س+(3/2)س=30 → (5/2)س=30 → س=12، الكبير=18.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-17",
      prompt_ar:
        "عمر أب 35 وعمر ابن 7. بعد كم سنة يصبح مجموع عمرهما 56؟",
      choices_ar: ["5 سنوات", "7 سنوات", "9 سنوات", "14 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "تقدير ناقص.",
        2: "زِيد.",
        3: "حُسب فرقاً آخر.",
      },
      solve_ar:
        "الآن المجموع 42. نحتاج زيادة 14 على الشخصين معاً أي 7 لكلٍّ → بعد 7 سنوات.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-18",
      prompt_ar:
        "عمر جدة ستة أمثال عمر حفيد، والفرق 50 سنة. كم عمر الجدة؟",
      choices_ar: ["10 سنوات", "50 سنة", "60 سنة", "70 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب عمر الحفيد: 50÷5.",
        1: "أُخذ الفرق.",
        3: "زِيد على الناتج.",
      },
      solve_ar: "6س − س = 50 → 5س = 50 → س = 10، الجدة = 60.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
  ],
  final_extra: [
    {
      id: "ages-f01",
      prompt_ar:
        "عمر الأب أربعة أمثال عمر ابنه، والمجموع 55. كم عمر الأب؟",
      choices_ar: ["11 سنة", "33 سنة", "44 سنة", "50 سنة"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب الابن.",
        1: "حُسب ثلاثة أمثال.",
        3: "تقدير.",
      },
      solve_ar: "س + 4س = 55 → س = 11، الأب = 44.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f02",
      prompt_ar:
        "عمر أم 32 وعمر ابنة 8. بعد كم سنة يكون عمر الأم ثلاثة أمثال عمر الابنة؟",
      choices_ar: ["2 سنة", "4 سنوات", "6 سنوات", "8 سنوات"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "تقدير ناقص.",
        2: "زِيد.",
        3: "حُسب حتى يتضاعف فقط.",
      },
      solve_ar:
        "32+س = 3(8+س) → 32+س = 24+3س → 8 = 2س → س = 4.",
      trick_ref: "ages",
      difficulty: "hard",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f03",
      prompt_ar:
        "مجموع عمري زوجين 70، وعمر الزوج يزيد عن الزوجة بـ 6. كم عمر الزوجة؟",
      choices_ar: ["28 سنة", "32 سنة", "36 سنة", "38 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "طُرح زيادة.",
        2: "حُسب عمر الزوج.",
        3: "نُصف تقريباً مع خطأ.",
      },
      solve_ar: "س + (س+6) = 70 → 2س = 64 → س = 32.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f04",
      prompt_ar:
        "عمر طفل س سنة، وعمر أبيه 7س، ومجموعهما 48. كم س؟",
      choices_ar: ["5", "6", "7", "8"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم على 9.6 تقريباً.",
        2: "قُسم على 7.",
        3: "قُسم على 6.",
      },
      solve_ar: "س + 7س = 48 → 8س = 48 → س = 6.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f05",
      prompt_ar:
        "قبل 3 سنوات كان مجموع عمري أب وابن 44. الآن كم مجموعهما؟",
      choices_ar: ["44", "47", "50", "53"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "نُسي مرور السنوات.",
        1: "أُضيفت 3 لشخص واحد فقط.",
        3: "أُضيفت 3 ثلاث مرات.",
      },
      solve_ar: "كلٌّ زاد 3، فالمجموع يزيد 6 → 44 + 6 = 50.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f06",
      prompt_ar:
        "عمر أختين: الكبرى ضعف الصغرى زائد 3، والمجموع 33. كم عمر الصغرى؟",
      choices_ar: ["8 سنوات", "10 سنوات", "12 سنة", "15 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُسي الـ 3 عند الحل.",
        2: "حُسب الكبرى.",
        3: "نُصف المجموع.",
      },
      solve_ar: "س + (2س+3) = 33 → 3س = 30 → س = 10.",
      trick_ref: "ages",
      difficulty: "mid",
      sub_pattern: "algebra",
      ...review,
    },
    {
      id: "ages-f07",
      prompt_ar:
        "عمر أب 45 وعمر ابنين توأم مجموعهما مع الأب 75. كم عمر كل ابن؟",
      choices_ar: ["10 سنوات", "15 سنة", "20 سنة", "30 سنة"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم الباقي على 3.",
        2: "أُخذ مجموع التوأم.",
        3: "نُصف عمر الأب.",
      },
      solve_ar: "عمر الابنين معاً = 75 − 45 = 30، فكلٌّ = 15.",
      trick_ref: "ages",
      difficulty: "easy",
      sub_pattern: "algebra",
      ...review,
    },
  ],
};
