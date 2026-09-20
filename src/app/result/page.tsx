import type { Metadata } from "next";
import { ResultExperience } from "@/components/result/ResultExperience";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "النتيجة",
  description: "نتيجة اختبارك في قُدرة ونقاط الضعف المقترحة للتدريب.",
  path: "/result",
  noIndex: true,
});

export default function ResultPage() {
  return <ResultExperience />;
}
