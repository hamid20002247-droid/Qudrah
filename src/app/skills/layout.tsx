import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "خريطة المهارات",
  description:
    "60 مهارة في القسم الكمي: حساب، جبر، هندسة، إحصاء، ومقارنات — تصوّر تفاعلي ثم تدريب موقوت.",
  path: "/skills",
});

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
