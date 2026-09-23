import type { Metadata } from "next";
import { Suspense } from "react";
import { MockExperience } from "@/components/mock/MockExperience";
import { MockJsonLd } from "@/components/seo/MockJsonLd";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "اختبار قدرات كمي تجريبي — 20 اختباراً كاملاً",
  description:
    "محاكاة قدرات كمي مجاناً: 20 اختباراً معتمداً، كل اختبار 60 سؤالاً في 60 دقيقة بأسئلة جديدة ودرجة فورية. ابدأ اختبارك الآن.",
  path: "/mock",
  keywords: [
    "اختبار قدرات كمي تجريبي",
    "محاكاة قدرات كمي",
    "اختبار قدرات 60 سؤال",
    "نموذج قدرات كمي",
  ],
});

export default function MockPage() {
  return (
    <>
      <MockJsonLd />
      <Suspense
        fallback={
          <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
            <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
          </div>
        }
      >
        <MockExperience />
      </Suspense>
    </>
  );
}
