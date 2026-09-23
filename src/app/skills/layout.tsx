import type { Metadata } from "next";
import { SkillsJsonLd } from "@/components/seo/SkillsJsonLd";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "تدريب قدرات كمي — تأسيس 60 مهارة",
  description:
    "خريطة تأسيس قدرات كمي: حساب، جبر، هندسة، إحصاء، ومقارنات. تصوّر تفاعلي باللمس ثم اختصار وتدريب موقوت — مجاناً.",
  path: "/skills",
  keywords: [
    "تدريب قدرات كمي",
    "تأسيس قدرات",
    "مهارات قدرات كمي",
    "شرح قدرات كمي",
  ],
});

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkillsJsonLd />
      {children}
    </>
  );
}
