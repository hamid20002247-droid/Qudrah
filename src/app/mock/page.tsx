import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "محاكاة كمي",
  description: "60 سؤالاً في 60 دقيقة — ترتيب وخيارات جديدة في كل محاولة.",
};

export default function MockPage() {
  return (
    <RequireAuth
      next="/mock"
      title="سجّل لفتح المحاكاة"
      body="المحاكاة كاملة مجانية — فقط ادخل بحساب Google. يمكنك تجريب 3 مهارات بدون حساب أولاً."
    >
      <MockExperience />
    </RequireAuth>
  );
}
