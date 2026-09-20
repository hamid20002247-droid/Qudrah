import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "الاختبار",
  description:
    "اختبار قدرات كمي موقوت: 60 سؤالاً في 60 دقيقة، أسئلة جديدة في كل محاولة. تدريب مستقل غير تابع لقياس.",
  path: "/mock",
});

export default function MockPage() {
  return <MockExperience />;
}
