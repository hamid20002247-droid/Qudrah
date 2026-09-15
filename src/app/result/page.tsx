import type { Metadata } from "next";
import { ResultExperience } from "@/components/result/ResultExperience";

export const metadata: Metadata = {
  title: "النتيجة",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return <ResultExperience />;
}
