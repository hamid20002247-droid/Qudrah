import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";

export const metadata: Metadata = {
  title: "الاختبار",
  description: "ادخل اختبار قدرات كمي — 60 سؤالاً في 60 دقيقة، أسئلة جديدة كل مرة.",
};

export default function MockPage() {
  return <MockExperience />;
}
