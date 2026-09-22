import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "٢٠ اختبار قدرات كمي",
  description:
    "٢٠ اختباراً كاملاً للقسم الكمي: كل اختبار ٦٠ سؤالاً في ٦٠ دقيقة بأسئلة جديدة. اختر اختباراً وابدأ.",
  path: "/mock",
});

export default function MockPage() {
  return <MockExperience />;
}
