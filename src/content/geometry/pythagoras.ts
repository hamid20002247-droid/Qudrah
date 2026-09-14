import type { Skill } from "@/lib/types";

const review = {
  source: "style-modeled-practice-2024",
  review_status: "approved" as const,
  reviewed_by: "founder",
  reviewed_at: "2026-09-13T00:00:00.000Z",
};

export const pythagoras: Skill = {
  id: "pythagoras",
  title_ar: "فيثاغورس",
  domain: "geometry",
  hook_ar: "في المثلث القائم: مربّعا الضلعين = مربّع الوتر",
  estimated_minutes: 8,
  icon: "△",
  visual: { kind: "custom", component: "pythagoras-lab" },
  intuition_ar: [
    "المثلث القائم فيه زاوية قائمة واحدة. الضلع المقابل لها هو الوتر — أطول الأضلاع.",
    "مربّع الوتر يساوي مجموع مربّعي الضلعين الآخرين.",
    "إن عرفت الوتر وضلعاً واحداً: اطرح مربّع الضلع من مربّع الوتر، ثم خذ الجذر.",
  ],
  trick_ar: {
    statement: "حدّد الوتر أولاً، ثم طبّق: مربّع وتر = مربّع + مربّع.",
    steps: [
      "عيّن الوتر: أطول ضلع، مقابل الزاوية القائمة",
      "للإيجاد: وتر² = ضلع² + ضلع² · أو ضلع² = وتر² − ضلع²",
      "خذ الجذر التربيعي للناتج",
    ],
    time_target_sec: 24,
    example_ar:
      "ضلعان 5 و 12: وتر² = 25 + 144 = 169، فالوتر = 13.",
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
      id: "py-01",
      prompt_ar:
        "مثلث قائم ضلعاه القائمَان 7 سم و 24 سم. كم طول الوتر؟",
      choices_ar: ["25 سم", "31 سم", "17 سم", "14 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الضلعان دون تربيع.",
        2: "طُرح 24 − 7 دون تربيع.",
        3: "أُخذ متوسط الضلعين.",
      },
      solve_ar:
        "الوتر² = 7² + 24² = 49 + 576 = 625. إذن الوتر = √625 = 25 سم.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-02",
      prompt_ar:
        "سُلّم يرتكز على حائط، بعده عن القاعدة 5 م وارتفاعه على الحائط 12 م. كم طول السُلّم؟",
      choices_ar: ["13 م", "17 م", "10 م", "15 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع 5 و 12.",
        2: "طُرح 12 − 5 دون تربيع.",
        3: "حُسب 5+12−2 خطأ.",
      },
      solve_ar:
        "السُلّم هو الوتر. الوتر² = 5² + 12² = 25 + 144 = 169. فالطول = √169 = 13 م.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-03",
      prompt_ar:
        "مثلث قائم وتره 13 سم وأحد ضلعيه القائمين 5 سم. كم طول الضلع الآخر؟",
      choices_ar: ["12 سم", "8 سم", "18 سم", "10 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 13 − 5 دون تربيع.",
        2: "جُمع 13 و 5.",
        3: "أُخذ نصف الوتر تقريباً.",
      },
      solve_ar:
        "الضلع² = 13² − 5² = 169 − 25 = 144. فالضلع = √144 = 12 سم.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-04",
      prompt_ar:
        "ملعب مستطيل طوله 20 م وعرضه 21 م. كم طول القطر؟",
      choices_ar: ["29 م", "41 م", "20.5 م", "420 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الطول والعرض.",
        2: "أُخذ متوسط الطول والعرض.",
        3: "ضُرب الطول في العرض (مساحة).",
      },
      solve_ar:
        "القطر وتر لمثلث قائم. القطر² = 20² + 21² = 400 + 441 = 841. فالقطر = √841 = 29 م.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-05",
      prompt_ar:
        "مثلث قائم ضلعاه القائمَان 8 سم و 15 سم. كم طول الوتر؟",
      choices_ar: ["17 سم", "23 سم", "7 سم", "120 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الضلعان.",
        2: "طُرح 15 − 8.",
        3: "ضُرب الضلعان.",
      },
      solve_ar:
        "الوتر² = 8² + 15² = 64 + 225 = 289. فالوتر = √289 = 17 سم.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-06",
      prompt_ar:
        "حبل مشدود من رأس سارية ارتفاعها 9 م إلى نقطة على الأرض تبعد 40 م عن القاعدة. كم طول الحبل؟",
      choices_ar: ["41 م", "49 م", "31 م", "360 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الارتفاع والبُعد.",
        2: "طُرح دون تربيع.",
        3: "ضُرب العددان (مساحة المثلث تقريباً).",
      },
      solve_ar:
        "الحبل وتر. الوتر² = 9² + 40² = 81 + 1600 = 1681. فالطول = √1681 = 41 م.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-07",
      prompt_ar:
        "مثلث قائم وتره 37 م وأحد ضلعيه 12 م. كم طول الضلع القائم الآخر؟",
      choices_ar: ["35 م", "25 م", "49 م", "√1513 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 37 − 12 دون تربيع.",
        2: "جُمع 37 و 12.",
        3: "جُمع المربعين بدل طرحهما.",
      },
      solve_ar:
        "الضلع² = 37² − 12² = 1369 − 144 = 1225. فالضلع = √1225 = 35 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-08",
      prompt_ar:
        "طاولة مربّعة طول ضلعها 7 سم. كم طول قطر سطحها؟",
      choices_ar: ["7√2 سم", "14 سم", "49 سم", "√7 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "ضُعف الضلع دون جذر.",
        2: "رُبّع الضلع فقط.",
        3: "أُخذ جذر الضلع بدل جذر مجموع المربعين.",
      },
      solve_ar:
        "القطر² = 7² + 7² = 49 + 49 = 98. فالقطر = √98 = √(49×2) = 7√2 سم.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-09",
      prompt_ar:
        "شاحنة ارتفاع صندوقها 8 م، ويمرّ أنبوب بطول 17 م من زاوية الأرض إلى أعلى الحافة المقابلة للعرض. إن كان الارتفاع 8 م، فكم عرض الصندوق؟",
      choices_ar: ["15 م", "25 م", "9 م", "√353 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الارتفاع وطول الأنبوب.",
        2: "طُرح 17 − 8 دون تربيع.",
        3: "جُمع المربعين بدل طرحهما.",
      },
      solve_ar:
        "العرض² = 17² − 8² = 289 − 64 = 225. فالعرض = √225 = 15 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-10",
      prompt_ar:
        "مثلث قائم ضلعاه القائمَان 20 سم و 21 سم. كم طول الوتر؟",
      choices_ar: ["29 سم", "41 سم", "28 سم", "25 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الضلعان.",
        2: "قُرّب الناتج ناقصاً واحداً.",
        3: "تقدير تقريبي غير دقيق.",
      },
      solve_ar:
        "الوتر² = 20² + 21² = 400 + 441 = 841. فالوتر = √841 = 29 سم.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-11",
      prompt_ar:
        "مسار مشاة يقطع حديقة مستطيلة من ركن إلى الركن المقابل. إن كان طول الحديقة 16 م وعرضها 30 م، فكم طول المسار؟",
      choices_ar: ["34 م", "46 م", "√1056 م", "240 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الطول والعرض.",
        2: "خُلط مجموع المربعات (مثلاً 256+800) وتُرك تحت الجذر.",
        3: "ضُرب البُعدان.",
      },
      solve_ar:
        "المسار وتر. المسار² = 16² + 30² = 256 + 900 = 1156. فالمسار = √1156 = 34 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-12",
      prompt_ar:
        "مثلث قائم وتره 25 سم وأحد ضلعيه 7 سم. كم طول الضلع الآخر؟",
      choices_ar: ["24 سم", "18 سم", "32 سم", "√674 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 25 − 7.",
        2: "جُمع 25 و 7.",
        3: "جُمع المربعين بدل طرحهما.",
      },
      solve_ar:
        "الضلع² = 25² − 7² = 625 − 49 = 576. فالضلع = √576 = 24 سم.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-13",
      prompt_ar:
        "عمود إنارة عمودي طوله 15 م، وسلك تثبيته يصل من رأسه إلى نقطة تبعد 8 م عن القاعدة. كم طول السلك؟",
      choices_ar: ["17 م", "23 م", "7 م", "19 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع 15 و 8.",
        2: "طُرح دون تربيع.",
        3: "خُلط مع 15² − 8² ثم جذر خاطئ.",
      },
      solve_ar:
        "السلك وتر. السلك² = 15² + 8² = 225 + 64 = 289. فالطول = 17 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-14",
      prompt_ar:
        "أي القيم التالية يمكن أن تكون أطوال أضلاع مثلث قائم؟",
      choices_ar: [
        "5 و 12 و 13",
        "5 و 6 و 7",
        "4 و 5 و 6",
        "8 و 10 و 12",
      ],
      correct_index: 0,
      trap_explanations_ar: {
        1: "5² + 6² = 61 ≠ 49.",
        2: "4² + 5² = 41 ≠ 36.",
        3: "8² + 10² = 164 ≠ 144.",
      },
      solve_ar:
        "تحقق: 5² + 12² = 25 + 144 = 169 = 13². إذن يحقق فيثاغورس. الباقي لا يحقق.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-15",
      prompt_ar:
        "شاشة تلفاز مربّعة قطرها 50 سم. كم طول ضلع الشاشة تقريباً إن كان الضلع = القطر ÷ √2؟",
      choices_ar: ["25√2 سم", "50 سم", "100 سم", "25 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "اُعتبر الضلع مساوياً للقطر.",
        2: "ضُعف القطر.",
        3: "نُصف القطر دون مراعاة √2.",
      },
      solve_ar:
        "في المربع: القطر = ضلع × √2، فالضلع = 50 ÷ √2 = 50√2 ÷ 2 = 25√2 سم.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-16",
      prompt_ar:
        "مثلث قائم وتره 26 م وأحد ضلعيه القائمين 10 م. كم طول الضلع الآخر؟",
      choices_ar: ["24 م", "16 م", "36 م", "√776 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 26 − 10.",
        2: "جُمع 26 و 10.",
        3: "جُمع المربعين بدل طرحهما.",
      },
      solve_ar:
        "الضلع² = 26² − 10² = 676 − 100 = 576. فالضلع = √576 = 24 م.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-17",
      prompt_ar:
        "منارة ارتفاعها 16 م، ومرصد يبعد أفقياً 63 م عن قاعدتها. كم المسافة المستقيمة من المرصد إلى رأس المنارة؟",
      choices_ar: ["65 م", "79 م", "47 م", "63 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الارتفاع والبُعد.",
        2: "طُرح دون تربيع.",
        3: "اُعتبر البُعد الأفقي هو المسافة.",
      },
      solve_ar:
        "المسافة وتر. المسافة² = 16² + 63² = 256 + 3969 = 4225. فالمسافة = √4225 = 65 م.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-18",
      prompt_ar:
        "مثلث قائم ضلعاه القائمَان 12 سم و 35 سم. كم طول الوتر؟",
      choices_ar: ["37 سم", "47 سم", "23 سم", "35 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الضلعان.",
        2: "طُرح 35 − 12.",
        3: "اُعتبر الوتر مساوياً لأحد الضلعين.",
      },
      solve_ar:
        "الوتر² = 12² + 35² = 144 + 1225 = 1369. فالوتر = √1369 = 37 سم.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
  ],
  final_extra: [
    {
      id: "py-f01",
      prompt_ar:
        "باب ارتفاعه 2.5 م وعرضه 6 م. كم أطول لوح خشبي يمكن إمراره قطرياً داخل إطار الباب؟",
      choices_ar: ["6.5 م", "8.5 م", "3.5 م", "15 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الارتفاع والعرض.",
        2: "طُرح دون تربيع.",
        3: "ضُرب البُعدان.",
      },
      solve_ar:
        "اللوح وتر. اللوح² = 2.5² + 6² = 6.25 + 36 = 42.25. فالطول = √42.25 = 6.5 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f02",
      prompt_ar:
        "مثلث قائم وتره 41 سم وأحد ضلعيه 9 سم. كم طول الضلع الآخر؟",
      choices_ar: ["40 سم", "32 سم", "50 سم", "√1762 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 41 − 9.",
        2: "جُمع 41 و 9.",
        3: "جُمع المربعين.",
      },
      solve_ar:
        "الضلع² = 41² − 9² = 1681 − 81 = 1600. فالضلع = √1600 = 40 سم.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f03",
      prompt_ar:
        "طائرة ورقية مربوطة بخيط طوله 25 م، وارتفاعها عن الأرض 7 م. كم تبعد نقطة الربط أفقياً عن المسقط العمودي للطائرة؟",
      choices_ar: ["24 م", "18 م", "32 م", "√674 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 25 − 7.",
        2: "جُمع 25 و 7.",
        3: "جُمع المربعين.",
      },
      solve_ar:
        "البُعد الأفقي ضلع قائم. البُعد² = 25² − 7² = 625 − 49 = 576. فالبُعد = 24 م.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f04",
      prompt_ar:
        "مثلث قائم متساوي الساقين طول كل ساق فيه 6 سم. كم طول الوتر؟",
      choices_ar: ["6√2 سم", "12 سم", "36 سم", "√6 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "ضُعف الساق.",
        2: "رُبّع الساق فقط.",
        3: "أُخذ جذر الساق.",
      },
      solve_ar:
        "الوتر² = 6² + 6² = 72. فالوتر = √72 = √(36×2) = 6√2 سم.",
      trick_ref: "pythagoras",
      difficulty: "mid",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f05",
      prompt_ar:
        "منحدر صعود ارتفاعه 9 م وأرضيته الأفقية 40 م. كم طول سطح المنحدر؟",
      choices_ar: ["41 م", "49 م", "31 م", "39 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع 9 و 40.",
        2: "طُرح 40 − 9.",
        3: "قُرّب الناتج ناقصاً.",
      },
      solve_ar:
        "السطح وتر. السطح² = 9² + 40² = 81 + 1600 = 1681. فالطول = 41 م.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f06",
      prompt_ar:
        "وتر مثلث قائم = 29 سم، وأحد الضلعين القائمين = 20 سم. كم الضلع الآخر؟",
      choices_ar: ["21 سم", "9 سم", "49 سم", "√1241 سم"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "طُرح 29 − 20.",
        2: "جُمع 29 و 20.",
        3: "جُمع المربعين.",
      },
      solve_ar:
        "الضلع² = 29² − 20² = 841 − 400 = 441. فالضلع = √441 = 21 سم.",
      trick_ref: "pythagoras",
      difficulty: "hard",
      sub_pattern: "geometry",
      ...review,
    },
    {
      id: "py-f07",
      prompt_ar:
        "غرفة مستطيلة طولها 20 م وعرضها 48 م. يريد فني مدّ كيبل من ركن إلى الركن المقابل على الأرض. كم طول الكيبل؟",
      choices_ar: ["52 م", "68 م", "28 م", "960 م"],
      correct_index: 0,
      trap_explanations_ar: {
        1: "جُمع الطول والعرض.",
        2: "طُرح دون تربيع.",
        3: "ضُرب البُعدان.",
      },
      solve_ar:
        "الكيبل وتر. الكيبل² = 20² + 48² = 400 + 2304 = 2704. فالطول = √2704 = 52 م.",
      trick_ref: "pythagoras",
      difficulty: "easy",
      sub_pattern: "geometry",
      ...review,
    },
  ],
};
