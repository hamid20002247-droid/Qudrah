import type { Metadata } from "next";
import { MockExperience } from "@/components/mock/MockExperience";

export const metadata: Metadata = {
  title: "محاكاة كمي",
  description: "60 سؤالاً في 60 دقيقة — ترتيب وخيارات جديدة في كل محاولة.",
};

export default function MockPage() {
  return <MockExperience />;
}
