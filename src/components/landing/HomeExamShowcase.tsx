"use client";

import Link from "next/link";
import { LtrNum } from "@/components/ui/LtrNum";
import { track } from "@/lib/analytics";
import { PRODUCT_FACTS } from "@/lib/next-action";
import { MOCK_BANK_SIZE, MOCK_EXAM_SIZE } from "@/lib/mock/examEngine";

/** Clean exam bank — one job: pick an exam and start. */
export function HomeExamShowcase() {
  return (
    <section className="px-4" aria-labelledby="home-exams-title">
      <div className="mb-4">
        <p className="text-[12px] font-bold tracking-wide text-teal-700">
          الاختبارات
        </p>
        <h2
          id="home-exams-title"
          className="mt-1 font-display text-[1.7rem] font-extrabold leading-snug text-ink"
        >
          <LtrNum>{MOCK_BANK_SIZE}</LtrNum> اختبار كمي معتمد
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
          اختر رقماً وادخل مباشرة —{" "}
          <LtrNum>{MOCK_EXAM_SIZE}</LtrNum> سؤال في{" "}
          <LtrNum>{PRODUCT_FACTS.mockMinutes}</LtrNum> دقيقة.
        </p>
      </div>

      <Link
        href="/mock?start=1"
        onClick={() => track("landing_mock_cta_primary")}
        className="flex min-h-[4.75rem] w-full flex-col items-center justify-center rounded-[1.5rem] bg-teal-600 text-white shadow-[0_20px_44px_-18px_rgba(13,148,136,0.7)] transition hover:bg-teal-500 active:scale-[0.99]"
      >
        <span className="text-[17px] font-extrabold">ابدأ اختبار 1</span>
        <span className="mt-1 text-[12px] font-bold text-teal-100">
          <LtrNum>{MOCK_EXAM_SIZE}</LtrNum> سؤال ·{" "}
          <LtrNum>{PRODUCT_FACTS.mockMinutes}</LtrNum> دقيقة · درجة فورية
        </span>
      </Link>

      <ol className="mt-4 grid grid-cols-5 gap-2">
        {Array.from({ length: MOCK_BANK_SIZE }, (_, i) => {
          const n = i + 1;
          const hot = n === 1;
          return (
            <li key={n}>
              <Link
                href={`/mock?start=${n}`}
                onClick={() =>
                  track("landing_exam_tile", { exam_number: n })
                }
                className={`flex aspect-square items-center justify-center rounded-2xl text-[15px] font-extrabold tabular-nums transition active:scale-[0.97] ${
                  hot
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : "bg-white text-ink ring-1 ring-slate-200/90 hover:ring-teal-300"
                }`}
                aria-label={`اختبار ${n}`}
              >
                <LtrNum>{n}</LtrNum>
              </Link>
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-center text-[12px] font-semibold text-slate-400">
        اضغط أي رقم — يفتح الاختبار فوراً
      </p>
    </section>
  );
}
