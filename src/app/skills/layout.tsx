import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المهارات",
  description:
    "ستون مهارة في القسم الكمي: حساب، جبر، هندسة، إحصاء، ومقارنات. تصوّر تفاعلي ثم تدريب موقوت.",
  alternates: { canonical: "/skills" },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
