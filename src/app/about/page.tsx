import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_FACTS } from "@/lib/next-action";

export const metadata: Metadata = {
  title: "عن قُدرة",
  description:
    "قُدرة أداة تدريب مستقلة للقسم الكمي في اختبار القدرات. غير تابعة لهيئة تقويم التعليم والتدريب أو قياس.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 pb-28">
      <p className="text-xs font-bold text-teal-700">عن الأداة</p>
      <h1 className="mt-1 text-2xl font-extrabold text-ink">قُدرة</h1>
      <p className="mt-4 text-base leading-relaxed text-slate-700">
        قُدرة لاختبار القدرات الكمي: ادخل الاختبار الكامل، أو تدرّب مهارة
        بمهارة — تصوّر، اختصار، ثم تدريب واختبار نهائي على نفس النمط.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        الاسم «قُدرة» يعني القدرة، وهو مختلف عن اسم الاختبار «قدرات». الأداة
        مستقلة وغير تابعة لهيئة تقويم التعليم والتدريب أو مركز قياس.
      </p>

      <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-sm font-bold text-ink">ماذا داخل المسار؟</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          <li>
            · {PRODUCT_FACTS.fields} مجالات و{PRODUCT_FACTS.skills} مهارة —
            حساب، جبر، هندسة، إحصاء، ومقارنات
          </li>
          <li>
            · {PRODUCT_FACTS.skillBankQuestions.toLocaleString("ar-SA")} سؤالاً
            داخل المهارات — بنك تدريب لكل مهارة
          </li>
          <li>
            · الاختبار الكامل: {PRODUCT_FACTS.mockQuestions} سؤالاً في{" "}
            {PRODUCT_FACTS.mockMinutes} دقيقة، بأسئلة وترتيب جديد في كل محاولة
          </li>
          <li>· التدريب مجاني — احفظ تقدّمك متى ما جاهز</li>
        </ul>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm font-bold text-ink">المقاطع القصيرة</p>
        <p className="mt-2 text-sm text-slate-600">
          TikTok / Snapchat / Instagram
        </p>
        <p className="mt-1 font-semibold text-teal-700" dir="ltr">
          @qudrah.app
        </p>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-400">
        ملاحظة: بعض متصفحات التطبيقات قد تمسح التقدّم المحفوظ على الجهاز. إن
        اختفى تقدّمك، ابدأ من جديد من خريطة المهارات.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/skills"
          className="flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 font-bold text-white"
        >
          خريطة المهارات
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center text-sm font-semibold text-teal-700"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
