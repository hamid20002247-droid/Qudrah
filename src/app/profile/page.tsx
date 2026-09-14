import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const metadata: Metadata = {
  title: "صفحتي",
  description: "تقدّمك في قُدرة: الدرجات، الاستمرار، ويوم الاختبار.",
};

export default function ProfileRoute() {
  return (
    <RequireAuth next="/profile" title="سجّل لفتح صفحتك">
      <ProfilePage />
    </RequireAuth>
  );
}
