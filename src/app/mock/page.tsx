import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";

export const metadata: Metadata = {
  title: "الاختبار",
  description:
    "اختبار قدرات كمي موقوت: 60 سؤالاً في 60 دقيقة، أسئلة جديدة في كل محاولة. تدريب مستقل غير تابع لقياس.",
  alternates: { canonical: "/mock" },
  openGraph: {
    title: "اختبار قدرات كمي — قُدرة",
    description: "60 سؤالاً · 60 دقيقة · أسئلة جديدة كل مرة.",
  },
};

export default function MockPage() {
  return <MockExperience />;
}
