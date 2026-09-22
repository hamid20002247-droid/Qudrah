import type { Metadata } from "next";
import { Suspense } from "react";
import { MockExperience } from "@/components/mock/MockExperience";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "20 اختبار قدرات كمي",
  description:
    "20 اختباراً كاملاً للقسم الكمي: كل اختبار 60 سؤالاً في 60 دقيقة بأسئلة جديدة. يُحسب مكتملاً فقط إذا أجبت على كل الأسئلة.",
  path: "/mock",
});

export default function MockPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
          <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
        </div>
      }
    >
      <MockExperience />
    </Suspense>
  );
}
