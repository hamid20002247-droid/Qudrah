import type { Metadata } from "next";
import { ResultExperience } from "@/components/result/ResultExperience";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "النتيجة",
};

export default function ResultPage() {
  return (
    <RequireAuth next="/result" title="سجّل لعرض النتيجة">
      <ResultExperience />
    </RequireAuth>
  );
}
