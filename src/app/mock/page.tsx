import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "20 اختبار قدرات كمي",
  description:
    "20 اختباراً كاملاً للقسم الكمي: كل اختبار 60 سؤالاً في 60 دقيقة بأسئلة جديدة. يُحسب مكتملاً فقط إذا أجبت على كل الأسئلة.",
  path: "/mock",
});

export default function MockPage() {
  return <MockExperience />;
}
