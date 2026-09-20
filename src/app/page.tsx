import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { buildPageMetadata, DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return <LandingPage />;
}
