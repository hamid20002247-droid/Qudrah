import type { Skill } from "@/lib/types";

const review = {
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
};

export const meanMissing: Skill = {
  id: "mean-missing",
  title_ar: "العدد الناقص من المتوسط",
  domain: "statistics",
  hook_ar: "حوّل المتوسط إلى مجموع، ثم أوجد القيمة الناقصة أو المضافة",
  estimated_minutes: 8,
  icon: "؟",
  visual: { kind: "custom", component: "mean-missing-lab" },
  intuition_ar: [
    "إذا عرفت المتوسط والعدد فالمجموع = المتوسط × العدد.",
    "القيمة الناقصة = المجموع المطلوب − مجموع القيم المعروفة.",
    "عند إضافة قيمة: حدّث المجموع والعدد معاً ثم أوجد المجهول.",
  ],
  trick_ar: {
    statement: "المجموع = المتوسط × العدد، ثم اطرح المعروف أو فرّق المجاميع.",
    steps: [
      "احسب المجموع من المتوسط والعدد",
      "اطرح مجموع القيم المعروفة لإيجاد الناقص",
      "عند الإضافة: مجموع جديد − مجموع قديم = القيمة المضافة",
    ],
    time_target_sec: 22,
    example_ar:
      "متوسط 4 درجات هو 15؛ المجموع 60. ثلاث منها 10 و 12 و 15، فالرابعة = 60 − 37 = 23.",
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
      id: "mm-01",
      prompt_ar:
        "متوسط أربع درجات هو 14. ثلاث منها 10 و 12 و 15. ما الدرجة الرابعة؟",
      choices_ar: ["17", "18", "19", "20"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "طُرح مجموع غير صحيح من المجموع المطلوب.",
        1: "نُسي أحد الأعداد عند جمع المعروف.",
        3: "زِيد واحد على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع المطلوب = 14 × 4 = 56. مجموع المعروف = 10 + 12 + 15 = 37. الناقصة = 56 − 37 = 19.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-02",
      prompt_ar:
        "متوسط خمس قراءات هو 18. أربع منها 16 و 20 و 17 و 19. ما القراءة الخامسة؟",
      choices_ar: ["16", "18", "20", "22"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة من القائمة.",
        2: "اختيرت قيمة من القائمة.",
        3: "زِيدت قيمة زائدة على الفرق الصحيح.",
      },
      solve_ar:
        "المجموع المطلوب = 18 × 5 = 90. مجموع المعروف = 16 + 20 + 17 + 19 = 72. الناقصة = 90 − 72 = 18.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-03",
      prompt_ar: "متوسط ثلاث قيم هو 20. اثنتان منها 15 و 25. ما القيمة الثالثة؟",
      choices_ar: ["18", "20", "22", "40"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "طُرح فرق الطرفين بطريقة خاطئة.",
        2: "زِيد اثنان بلا أساس.",
        3: "أُخذ مجموع الطرفين بدل الناقصة.",
      },
      solve_ar:
        "المجموع المطلوب = 20 × 3 = 60. مجموع المعروف = 15 + 25 = 40. الناقصة = 60 − 40 = 20.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-04",
      prompt_ar:
        "متوسط ست نتائج هو 12. خمس منها 10 و 11 و 12 و 13 و 14. ما النتيجة السادسة؟",
      choices_ar: ["10", "12", "14", "16"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت أصغر قيمة معروفة.",
        2: "اختيرت أكبر قيمة معروفة.",
        3: "زِيدت أربعة على المتوسط بلا حساب مجموع.",
      },
      solve_ar:
        "المجموع المطلوب = 12 × 6 = 72. مجموع المعروف = 10 + 11 + 12 + 13 + 14 = 60. الناقصة = 72 − 60 = 12.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-05",
      prompt_ar: "متوسط أربع قيم هو 10. أُضيفت إليها قيمة 20. ما المتوسط الجديد؟",
      choices_ar: ["11", "12", "14", "15"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "لم يُحدَّث المجموع والعدد معاً.",
        2: "قُسم المجموع الجديد على عدد خاطئ.",
        3: "أُخذ متوسط 10 و 20 فقط.",
      },
      solve_ar:
        "المجموع القديم = 10 × 4 = 40. بعد إضافة 20: المجموع = 60 والعدد = 5. المتوسط الجديد = 60 ÷ 5 = 12.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-06",
      prompt_ar:
        "متوسط خمسة طلاب هو 16. أُضيف طالب درجته 10. ما المتوسط الجديد؟",
      choices_ar: ["14", "15", "16", "17"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم المجموع الجديد على خمسة بدل ستة.",
        2: "ظُنّ أن المتوسط لا يتغيّر.",
        3: "ظُنّ أن المتوسط يرتفع.",
      },
      solve_ar:
        "المجموع القديم = 16 × 5 = 80. بعد الإضافة: المجموع = 90 والعدد = 6. المتوسط = 90 ÷ 6 = 15.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-07",
      prompt_ar:
        "متوسط ست نتائج هو 15. أُضيفت نتيجة فأصبح المتوسط 17. ما النتيجة المضافة؟",
      choices_ar: ["27", "28", "29", "30"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "استُخدم عدد قديم أو جديد بطريقة خاطئة.",
        1: "نُقص واحد من الفرق الصحيح.",
        3: "زِيد واحد على الفرق الصحيح.",
      },
      solve_ar:
        "المجموع القديم = 15 × 6 = 90. المجموع الجديد = 17 × 7 = 119. المضافة = 119 − 90 = 29.",
      trick_ref: "mean-missing",
      difficulty: "hard",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-08",
      prompt_ar:
        "متوسط أربعة أيام عمل هو 8 ساعات. ثلاثة أيام: 7 و 9 و 6. كم ساعة اليوم الرابع؟",
      choices_ar: ["8", "9", "10", "11"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "أُخذ المتوسط نفسه دون حساب الناقصة.",
        1: "نُقص واحد من القيمة الصحيحة.",
        3: "زِيد واحد على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع المطلوب = 8 × 4 = 32. مجموع المعروف = 7 + 9 + 6 = 22. الرابع = 32 − 22 = 10.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-09",
      prompt_ar:
        "متوسط خمس مباريات هو 3 أهداف. أربع مباريات: 2 و 4 و 1 و 5. كم هدف المباراة الخامسة؟",
      choices_ar: ["2", "3", "4", "5"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة من القائمة.",
        2: "اختيرت قيمة من القائمة.",
        3: "اختيرت قيمة من القائمة.",
      },
      solve_ar:
        "المجموع المطلوب = 3 × 5 = 15. مجموع المعروف = 2 + 4 + 1 + 5 = 12. الخامسة = 15 − 12 = 3.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-10",
      prompt_ar:
        "متوسط ثلاث قراءات ضغط هو 120. قراءتان: 110 و 130. ما القراءة الثالثة؟",
      choices_ar: ["110", "120", "130", "240"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة معروفة.",
        2: "اختيرت قيمة معروفة.",
        3: "جُمعت القراءتان بدل إيجاد الناقصة.",
      },
      solve_ar:
        "المجموع المطلوب = 120 × 3 = 360. مجموع المعروف = 110 + 130 = 240. الثالثة = 360 − 240 = 120.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-11",
      prompt_ar:
        "متوسط سبعة طلاب هو 70. ستة منهم مجموع درجاتهم 400. ما درجة السابع؟",
      choices_ar: ["80", "90", "100", "110"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُقص عشرة من القيمة الصحيحة.",
        2: "زِيدت عشرة على القيمة الصحيحة.",
        3: "زِيدت عشرون على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع المطلوب = 70 × 7 = 490. درجة السابع = 490 − 400 = 90.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-12",
      prompt_ar:
        "متوسط أربع قيم هو 25. أُضيفت قيمة 5. ما المتوسط الجديد؟",
      choices_ar: ["20", "21", "22", "25"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم المجموع الجديد على أربعة.",
        2: "خطأ في تحديث المجموع.",
        3: "ظُنّ أن المتوسط لا يتغيّر.",
      },
      solve_ar:
        "المجموع القديم = 25 × 4 = 100. بعد الإضافة: المجموع = 105 والعدد = 5. المتوسط = 105 ÷ 5 = 21.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-13",
      prompt_ar:
        "متوسط خمسة أيام هو 40 كيلو متر. أُضيف يوم بمسافة 70. ما المتوسط الجديد؟",
      choices_ar: ["45", "50", "55", "60"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "قُسم المجموع الجديد على خمسة.",
        2: "أُخذ متوسط 40 و 70 فقط.",
        3: "زِيدت المسافة المضافة كاملة على المتوسط.",
      },
      solve_ar:
        "المجموع القديم = 40 × 5 = 200. بعد الإضافة: المجموع = 270 والعدد = 6. المتوسط = 270 ÷ 6 = 45.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-14",
      prompt_ar:
        "متوسط ثماني درجات هو 80. أُضيفت درجة فأصبح المتوسط 82. ما الدرجة المضافة؟",
      choices_ar: ["96", "98", "100", "102"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُقص اثنان من الفرق الصحيح.",
        2: "زِيد اثنان على الفرق الصحيح.",
        3: "زِيدت أربعة على الفرق الصحيح.",
      },
      solve_ar:
        "المجموع القديم = 80 × 8 = 640. المجموع الجديد = 82 × 9 = 738. المضافة = 738 − 640 = 98.",
      trick_ref: "mean-missing",
      difficulty: "hard",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-15",
      prompt_ar:
        "متوسط ست قيم هو 9. أربع منها 8 و 10 و 7 و 11، والخامسة 12. ما السادسة؟",
      choices_ar: ["4", "6", "8", "10"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "طُرح مجموع أكبر من الصحيح.",
        2: "نُسي طرح إحدى القيم.",
        3: "اختيرت قيمة من القائمة.",
      },
      solve_ar:
        "المجموع المطلوب = 9 × 6 = 54. مجموع الخمس المعروفة = 8 + 10 + 7 + 11 + 12 = 48. السادسة = 54 − 48 = 6.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-16",
      prompt_ar:
        "متوسط ثلاثة أسعار هو 50. سعران: 40 و 60. ما السعر الثالث؟",
      choices_ar: ["40", "50", "60", "100"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختير سعر معروف.",
        2: "اختير سعر معروف.",
        3: "جُمع السعران بدل إيجاد الثالث.",
      },
      solve_ar:
        "المجموع المطلوب = 50 × 3 = 150. مجموع المعروف = 40 + 60 = 100. الثالث = 150 − 100 = 50.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-17",
      prompt_ar:
        "متوسط أربع جولات هو 22. أُضيفت جولة بنتيجة 38. ما المتوسط الجديد؟",
      choices_ar: ["24", "25.2", "26", "30"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "قُسم المجموع الجديد على عدد خاطئ.",
        2: "قُرّب المتوسط إلى أعلى بلا حساب دقيق.",
        3: "أُخذ متوسط 22 و 38 فقط.",
      },
      solve_ar:
        "المجموع القديم = 22 × 4 = 88. بعد الإضافة: المجموع = 126 والعدد = 5. المتوسط = 126 ÷ 5 = 25.2.",
      trick_ref: "mean-missing",
      difficulty: "hard",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-18",
      prompt_ar:
        "متوسط تسع قراءات هو 40. ثمانٍ مجموعها 310. ما القراءة التاسعة؟",
      choices_ar: ["40", "50", "60", "70"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "أُخذ المتوسط نفسه دون طرح.",
        2: "زِيدت عشرة على القيمة الصحيحة.",
        3: "زِيدت عشرون على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع المطلوب = 40 × 9 = 360. التاسعة = 360 − 310 = 50.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
  ],
  final_extra: [
    {
      id: "mm-f01",
      prompt_ar:
        "متوسط خمسة اختبارات هو 72. أربعة منها 68 و 70 و 74 و 76. ما درجة الاختبار الخامس؟",
      choices_ar: ["70", "72", "74", "76"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة من القائمة.",
        2: "اختيرت قيمة من القائمة.",
        3: "اختيرت قيمة من القائمة.",
      },
      solve_ar:
        "المجموع المطلوب = 72 × 5 = 360. مجموع المعروف = 68 + 70 + 74 + 76 = 288. الخامس = 360 − 288 = 72.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f02",
      prompt_ar:
        "متوسط سبع قيم هو 11. أُضيفت قيمة فأصبح المتوسط 12. ما القيمة المضافة؟",
      choices_ar: ["18", "19", "20", "21"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "نُقص واحد من الفرق الصحيح.",
        2: "زِيد واحد على الفرق الصحيح.",
        3: "زِيد اثنان على الفرق الصحيح.",
      },
      solve_ar:
        "المجموع القديم = 11 × 7 = 77. المجموع الجديد = 12 × 8 = 96. المضافة = 96 − 77 = 19.",
      trick_ref: "mean-missing",
      difficulty: "hard",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f03",
      prompt_ar:
        "متوسط ست سلال هو 24 كيلو. خمس سلال: 20 و 22 و 25 و 26 و 27. ما وزن السادسة؟",
      choices_ar: ["22", "24", "26", "28"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة من القائمة.",
        2: "اختيرت قيمة من القائمة.",
        3: "زِيدت أربعة على المتوسط بلا حساب.",
      },
      solve_ar:
        "المجموع المطلوب = 24 × 6 = 144. مجموع المعروف = 20 + 22 + 25 + 26 + 27 = 120. السادسة = 144 − 120 = 24.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f04",
      prompt_ar:
        "متوسط عشرة موظفين هو 5000. تسعة مجموع رواتبهم 44000. ما راتب العاشر؟",
      choices_ar: ["5000", "6000", "7000", "8000"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "أُخذ المتوسط نفسه دون طرح.",
        2: "زِيد ألف على القيمة الصحيحة.",
        3: "زِيد ألفان على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع المطلوب = 5000 × 10 = 50000. راتب العاشر = 50000 − 44000 = 6000.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f05",
      prompt_ar:
        "متوسط ثلاث جولات هو 40. أُضيفت جولة بنتيجة 80. ما المتوسط الجديد؟",
      choices_ar: ["50", "55", "60", "120"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "خطأ في قسمة المجموع الجديد.",
        2: "أُخذ متوسط 40 و 80 فقط.",
        3: "جُمع المتوسطان بدل تحديث المجموع والعدد.",
      },
      solve_ar:
        "المجموع القديم = 40 × 3 = 120. بعد الإضافة: المجموع = 200 والعدد = 4. المتوسط = 200 ÷ 4 = 50.",
      trick_ref: "mean-missing",
      difficulty: "mid",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f06",
      prompt_ar:
        "متوسط أربع قيم هو 15. ثلاث منها 12 و 18 و 14. ما الرابعة؟",
      choices_ar: ["14", "16", "18", "20"],
      correct_index: 1,
      trap_explanations_ar: {
        0: "اختيرت قيمة من القائمة.",
        2: "اختيرت قيمة من القائمة.",
        3: "زِيدت أربعة على المتوسط.",
      },
      solve_ar:
        "المجموع المطلوب = 15 × 4 = 60. مجموع المعروف = 12 + 18 + 14 = 44. الرابعة = 60 − 44 = 16.",
      trick_ref: "mean-missing",
      difficulty: "easy",
      sub_pattern: "statistics",
      ...review,
    },
    {
      id: "mm-f07",
      prompt_ar:
        "متوسط خمسة أيام هو 18. أُضيف يومان بنفس القيمة س فصار المتوسط 20. ما قيمة س؟",
      choices_ar: ["22", "24", "25", "26"],
      correct_index: 2,
      trap_explanations_ar: {
        0: "حُسب يوم واحد مضاف بدل يومين.",
        1: "نُقص واحد من القيمة الصحيحة.",
        3: "زِيد واحد على القيمة الصحيحة.",
      },
      solve_ar:
        "المجموع القديم = 18 × 5 = 90. المجموع الجديد = 20 × 7 = 140. مجموع اليومين = 50. إذن س = 50 ÷ 2 = 25.",
      trick_ref: "mean-missing",
      difficulty: "hard",
      sub_pattern: "statistics",
      ...review,
    },
  ],
};
