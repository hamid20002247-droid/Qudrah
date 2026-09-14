import { ALL_SKILLS, getSkillById } from "@/content/arithmetic";

export type FieldId =
  | "arithmetic"
  | "algebra"
  | "geometry"
  | "statistics"
  | "comparison";

export type CatalogSkill = {
  id: string;
  title_ar: string;
  hook_ar: string;
  order: number;
};

export type SkillField = {
  id: FieldId;
  title_ar: string;
  subtitle_ar: string;
  blurb_ar: string;
  /** Short mark shown on the field tile */
  mark: string;
  /** Share of typical scientific quantitative mix */
  share_label: string;
  accent: {
    from: string;
    to: string;
    soft: string;
    ring: string;
    text: string;
  };
  skills: CatalogSkill[];
};

/**
 * Full كمي map — titles from docs/KAMI_SKILLS_ROADMAP.md
 * Live skills = present in ALL_SKILLS with approved content.
 */
export const SKILL_FIELDS: SkillField[] = [
  {
    id: "arithmetic",
    title_ar: "حساب",
    subtitle_ar: "الأكثر أسئلة في الكمي",
    blurb_ar: "نسب، نسب مئوية، متوسط، كسور، ومعدلات — أساس الدرجة.",
    mark: "٪",
    share_label: "~40٪",
    accent: {
      from: "#0f766e",
      to: "#115e59",
      soft: "#f0fdfa",
      ring: "rgba(13,148,136,0.35)",
      text: "#0f766e",
    },
    skills: [
      {
        id: "percent-change",
        title_ar: "التغيّر المئوي",
        hook_ar: "اقسم على الأصل — لا على الجديد",
        order: 1,
      },
      {
        id: "percent-of",
        title_ar: "النسبة من العدد",
        hook_ar: "كم يساوي س٪ من كمية؟",
        order: 2,
      },
      {
        id: "successive-percent",
        title_ar: "النسب المتتالية",
        hook_ar: "زيادة ثم نقص لا يلغيان بعض",
        order: 3,
      },
      {
        id: "ratios",
        title_ar: "النسب والتناسب",
        hook_ar: "اقسم على مجموع الأجزاء ثم وزّع",
        order: 4,
      },
      {
        id: "direct-inverse",
        title_ar: "التناسب الطردي والعكسي",
        hook_ar: "متى يزيدان معاً؟ ومتى يتعاكسان؟",
        order: 5,
      },
      {
        id: "buy-sell",
        title_ar: "الربح والخصم",
        hook_ar: "حدد الأساس قبل أن تضرب بالنسبة",
        order: 6,
      },
      {
        id: "average",
        title_ar: "المتوسط الحسابي",
        hook_ar: "المجموع هو المفتاح — لا المتوسط وحده",
        order: 7,
      },
      {
        id: "fractions",
        title_ar: "الكسور في المسائل",
        hook_ar: "جزء من كل، ثم ما تبقى",
        order: 8,
      },
      {
        id: "compare-fractions",
        title_ar: "مقارنة الكسور",
        hook_ar: "أيّهما أكبر بدون آلة؟",
        order: 9,
      },
      {
        id: "rate-distance",
        title_ar: "السرعة والمسافة والزمن",
        hook_ar: "مثلث س / م / ز تحت الوقت",
        order: 10,
      },
      {
        id: "work-rate",
        title_ar: "العمل والإنجاز",
        hook_ar: "عمال وأيام — تناسب عكسي",
        order: 11,
      },
      {
        id: "gcd-lcm",
        title_ar: "القواسم والمضاعفات",
        hook_ar: "أكبر قاسم وأصغر مضاعف في سياق حي",
        order: 12,
      },
      {
        id: "exponents",
        title_ar: "الأسس والقوى",
        hook_ar: "ضرب وقسمة أسس متشابهة القاعدة",
        order: 13,
      },
      {
        id: "roots",
        title_ar: "الجذور والتقدير",
        hook_ar: "بسّط وقارن دون آلة حاسبة",
        order: 14,
      },
      {
        id: "number-sense",
        title_ar: "الحس العددي",
        hook_ar: "قدّر وقارن قبل أن تحسب بالطول",
        order: 15,
      },
      {
        id: "word-arith",
        title_ar: "المسائل اللفظية الحسابية",
        hook_ar: "حوّل النص إلى خطوات حساب واضحة",
        order: 16,
      },
    ],
  },
  {
    id: "algebra",
    title_ar: "جبر",
    subtitle_ar: "أوجد المجهول بسرعة",
    blurb_ar: "معادلات، مقادير، متتاليات، وترجمة اللفظي إلى رموز.",
    mark: "س",
    share_label: "~23٪",
    accent: {
      from: "#1e3a5f",
      to: "#0f2744",
      soft: "#f1f5f9",
      ring: "rgba(30,58,95,0.28)",
      text: "#1e3a5f",
    },
    skills: [
      {
        id: "linear-eq",
        title_ar: "المعادلة الخطية",
        hook_ar: "أس + ب = ج — خطوة بخطوة",
        order: 1,
      },
      {
        id: "two-step-eq",
        title_ar: "معادلة بخطوتين",
        hook_ar: "وسّع الأقواس ثم حل",
        order: 2,
      },
      {
        id: "eval-expr",
        title_ar: "التعويض في المقدار",
        hook_ar: "ضع قيمة س واحسب بدقة",
        order: 3,
      },
      {
        id: "simplify",
        title_ar: "تبسيط المقادير",
        hook_ar: "اجمع الحدود المتشابهة فوراً",
        order: 4,
      },
      {
        id: "inequalities",
        title_ar: "المتباينات",
        hook_ar: "أكبر صحيح يحقق الشرط",
        order: 5,
      },
      {
        id: "arith-seq",
        title_ar: "المتتالية الحسابية",
        hook_ar: "فرق ثابت → الحد التالي",
        order: 6,
      },
      {
        id: "square-patterns",
        title_ar: "أنماط المربعات",
        hook_ar: "1، 4، 9، 16… بلا تخمين",
        order: 7,
      },
      {
        id: "ages",
        title_ar: "مسائل الأعمار",
        hook_ar: "أمثال العمر ومجموع العمرين",
        order: 8,
      },
      {
        id: "word-to-algebra",
        title_ar: "ترجمة اللفظي إلى جبر",
        hook_ar: "من جملة إلى معادلة",
        order: 9,
      },
      {
        id: "algebra-relations",
        title_ar: "العلاقات الجبرية",
        hook_ar: "س بدلالة ص وعلاقات بسيطة",
        order: 10,
      },
      {
        id: "balance-sides",
        title_ar: "الإشارة والطرفين",
        hook_ar: "ما تفعله بطرف افعله بالآخر",
        order: 11,
      },
      {
        id: "check-by-sub",
        title_ar: "التحقق بالتعويض",
        hook_ar: "اختبر الحل في ثانية",
        order: 12,
      },
    ],
  },
  {
    id: "geometry",
    title_ar: "هندسة",
    subtitle_ar: "أشكال، قياس، علاقات",
    blurb_ar: "زوايا، مساحات، دائرة، فيثاغورس، وحجوم — ارسم ثم احسب.",
    mark: "△",
    share_label: "~24٪",
    accent: {
      from: "#0e7490",
      to: "#155e75",
      soft: "#ecfeff",
      ring: "rgba(14,116,144,0.3)",
      text: "#0e7490",
    },
    skills: [
      {
        id: "angles",
        title_ar: "الزوايا والعلاقات",
        hook_ar: "متتامة، متكاملة، ومجموع المثلث",
        order: 1,
      },
      {
        id: "perimeter",
        title_ar: "محيط المربع والمستطيل",
        hook_ar: "لا تخلط المحيط بالمساحة",
        order: 2,
      },
      {
        id: "rect-area",
        title_ar: "مساحة المستطيل والمربع",
        hook_ar: "بعدان → مساحة، أو اعكس من المحيط",
        order: 3,
      },
      {
        id: "triangle-area",
        title_ar: "مساحة المثلث",
        hook_ar: "نصف القاعدة في الارتفاع",
        order: 4,
      },
      {
        id: "pythagoras",
        title_ar: "فيثاغورس",
        hook_ar: "قائم الزاوية: وتر أو ضلع",
        order: 5,
      },
      {
        id: "circle-circ",
        title_ar: "الدائرة: المحيط",
        hook_ar: "2 باي ر بالتقريب السريع",
        order: 6,
      },
      {
        id: "circle-area",
        title_ar: "الدائرة: المساحة",
        hook_ar: "باي × ر² — احذر من القطر",
        order: 7,
      },
      {
        id: "volume",
        title_ar: "حجوم المجسمات",
        hook_ar: "مكعب ومتوازي مستطيلات",
        order: 8,
      },
      {
        id: "surface-area",
        title_ar: "المساحة السطحية",
        hook_ar: "وجوه الشكل — ليست الحجم",
        order: 9,
      },
      {
        id: "special-triangles",
        title_ar: "المثلثات الخاصة",
        hook_ar: "3-4-5 ومضاعفاتها",
        order: 10,
      },
      {
        id: "parallel-lines",
        title_ar: "التوازي وقطع مستقيم",
        hook_ar: "زوايا متبادلة ومتناظرة",
        order: 11,
      },
      {
        id: "units-measure",
        title_ar: "القياس وتحويل الوحدات",
        hook_ar: "سم ومتر — طول ومساحة",
        order: 12,
      },
    ],
  },
  {
    id: "statistics",
    title_ar: "إحصاء",
    subtitle_ar: "بيانات واحتمال",
    blurb_ar: "متوسط ووسيط، جداول ورسوم، واحتمال بسيط أو بلا إرجاع.",
    mark: "م",
    share_label: "~13٪",
    accent: {
      from: "#3f6212",
      to: "#365314",
      soft: "#f7fee7",
      ring: "rgba(63,98,18,0.28)",
      text: "#3f6212",
    },
    skills: [
      {
        id: "mean-list",
        title_ar: "المتوسط من قائمة",
        hook_ar: "مجموع القيم تقسيم عددها",
        order: 1,
      },
      {
        id: "mean-missing",
        title_ar: "العدد الناقص من المتوسط",
        hook_ar: "أُضيف عدد فتغيّر المتوسط",
        order: 2,
      },
      {
        id: "median",
        title_ar: "الوسيط",
        hook_ar: "رتّب ثم خذ الأوسط",
        order: 3,
      },
      {
        id: "mode",
        title_ar: "المنوال",
        hook_ar: "الأكثر تكراراً",
        order: 4,
      },
      {
        id: "range",
        title_ar: "المدى",
        hook_ar: "أكبر ناقص أصغر",
        order: 5,
      },
      {
        id: "tables",
        title_ar: "قراءة الجداول",
        hook_ar: "استخرج المطلوب من الصف والعمود",
        order: 6,
      },
      {
        id: "charts",
        title_ar: "قراءة الرسوم",
        hook_ar: "أعلى، أقل، ومقارنة فترتين",
        order: 7,
      },
      {
        id: "prob-simple",
        title_ar: "الاحتمال البسيط",
        hook_ar: "المطلوب تقسيم الكلي",
        order: 8,
      },
      {
        id: "prob-without-replace",
        title_ar: "احتمال بلا إرجاع",
        hook_ar: "سحبتان — حدّث المقام",
        order: 9,
      },
      {
        id: "data-percent",
        title_ar: "نسب من بيانات",
        hook_ar: "نسبة فئة من مجموع الجدول",
        order: 10,
      },
    ],
  },
  {
    id: "comparison",
    title_ar: "مقارنات",
    subtitle_ar: "كمية أ مقابل ب",
    blurb_ar: "أ أكبر، ب أكبر، متساويتان، أو المعطيات غير كافية.",
    mark: "≷",
    share_label: "نمط قياس",
    accent: {
      from: "#9a3412",
      to: "#7c2d12",
      soft: "#fff7ed",
      ring: "rgba(154,52,18,0.28)",
      text: "#9a3412",
    },
    skills: [
      {
        id: "cmp-numbers",
        title_ar: "مقارنة كميتين عدديتين",
        hook_ar: "احسب بسرعة ثم احكم",
        order: 1,
      },
      {
        id: "cmp-percent",
        title_ar: "مقارنة نسب مئوية",
        hook_ar: "عوامل ضرب — لا طرح النسب",
        order: 2,
      },
      {
        id: "cmp-frac",
        title_ar: "مقارنة كسور",
        hook_ar: "توحيد أو ضرب تبادلي",
        order: 3,
      },
      {
        id: "cmp-area",
        title_ar: "مقارنة مساحات",
        hook_ar: "شكلان — أي مساحة أكبر؟",
        order: 4,
      },
      {
        id: "cmp-peri-area",
        title_ar: "مقارنة محيط ومساحة",
        hook_ar: "نفس الشكل: أيّهما أكبر؟",
        order: 5,
      },
      {
        id: "cmp-algebra",
        title_ar: "مقارنة جبرية",
        hook_ar: "عوّض ثم قارن",
        order: 6,
      },
      {
        id: "cmp-roots-exp",
        title_ar: "مقارنة جذور وأسّ",
        hook_ar: "بدون آلة حاسبة",
        order: 7,
      },
      {
        id: "cmp-rates",
        title_ar: "مقارنة معدلات",
        hook_ar: "سرعة أو سعر وحدة",
        order: 8,
      },
      {
        id: "cmp-means",
        title_ar: "مقارنة متوسطات",
        hook_ar: "مجموعتان أو قبل وبعد",
        order: 9,
      },
      {
        id: "cmp-insufficient",
        title_ar: "المعطيات غير كافية",
        hook_ar: "متى لا يمكن الحسم؟",
        order: 10,
      },
    ],
  },
];

export function getFieldById(id: string): SkillField | undefined {
  return SKILL_FIELDS.find((f) => f.id === id);
}

export function getCatalogSkill(id: string): {
  field: SkillField;
  skill: CatalogSkill;
} | null {
  for (const field of SKILL_FIELDS) {
    const skill = field.skills.find((s) => s.id === id);
    if (skill) return { field, skill };
  }
  return null;
}

export function isSkillLive(id: string): boolean {
  const skill = getSkillById(id);
  if (!skill || skill.review_status !== "approved") return false;
  return skill.drill.some((q) => q.review_status === "approved");
}

export function liveSkillCountInField(field: SkillField): number {
  return field.skills.filter((s) => isSkillLive(s.id)).length;
}

export function totalCatalogSkills(): number {
  return SKILL_FIELDS.reduce((n, f) => n + f.skills.length, 0);
}

export function totalLiveSkills(): number {
  return ALL_SKILLS.filter(
    (s) =>
      s.review_status === "approved" &&
      s.drill.some((q) => q.review_status === "approved")
  ).length;
}

export function allCatalogSkillIds(): string[] {
  return SKILL_FIELDS.flatMap((f) => f.skills.map((s) => s.id));
}
