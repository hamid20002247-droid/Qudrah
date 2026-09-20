import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "صفحتي",
  description: "تقدّمك في قُدرة: الدرجات، الاستمرار، ويوم الاختبار.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileRoute() {
  return (
    <RequireAuth next="/profile" title="سجّل دخولك">
      <ProfilePage />
    </RequireAuth>
  );
}
