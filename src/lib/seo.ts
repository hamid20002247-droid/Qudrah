import type { Metadata } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";

export const SITE_NAME = "قُدرة";
export const SITE_NAME_LATIN = "Qudrah";

/**
 * Primary SERP targets (Saudi Qudrat / quantitative):
 * اختبار القدرات الكمي · قدرات كمي · محاكاة قدرات · تدريب قدرات
 */
export const DEFAULT_TITLE =
  "اختبار القدرات الكمي مجاناً — 20 اختباراً وتأسيس تفاعلي | قُدرة";

export const DEFAULT_DESCRIPTION =
  "محاكاة اختبار القدرات (القسم الكمي): 20 اختباراً كاملاً بـ 60 سؤالاً في 60 دقيقة، مع تأسيس تفاعلي لـ 60 مهارة. مجاني ويحفظ درجتك على كل الأجهزة.";

/** High-intent Arabic + Latin variants search engines still index. */
export const SITE_KEYWORDS = [
  "اختبار القدرات الكمي",
  "قدرات كمي",
  "اختبار قدرات تجريبي",
  "محاكاة قدرات",
  "محاكاة قدرات كمي",
  "تدريب قدرات",
  "تدريب قدرات كمي",
  "أسئلة قدرات كمي",
  "اختبار قدرات محوسب",
  "قدرات قياس",
  "القسم الكمي",
  "تجميعات قدرات كمي",
  "اختبار قدرات مجاني",
  "تأسيس قدرات",
  "قُدرة",
  "Qudrah",
  "Qudrat quantitative",
] as const;

const OG_IMAGE = {
  // Cache-bust so Telegram/WhatsApp pick up new art
  url: "/opengraph-image.png?v=4",
  width: 1200,
  height: 630,
  alt: "قُدرة — اختبار القدرات الكمي مجاناً · 20 اختباراً وتأسيس تفاعلي",
} as const;

/** Absolute URL for a path (sharing / canonical). */
export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_SITE_URL}${p === "/" ? "" : p}`;
}

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export const NOINDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Use bare title without "| قُدرة" template */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  keywords?: readonly string[];
  /** openGraph type — skills can use article */
  ogType?: "website" | "article";
};

/** Consistent title / description / OG / Twitter / robots for every shareable page. */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
  keywords,
  ogType = "website",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const mergedKeywords = keywords
    ? [...new Set([...SITE_KEYWORDS, ...keywords])]
    : [...SITE_KEYWORDS];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: mergedKeywords,
    category: "education",
    alternates: {
      canonical: url,
      languages: {
        "ar-SA": url,
        ar: url,
      },
    },
    robots: noIndex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      type: ogType,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** Skill SERP title — keyword + skill name. */
export function skillPageTitle(skillTitleAr: string): string {
  return `${skillTitleAr} — تدريب قدرات كمي`;
}

/** Skill SERP description — hook + product frame. */
export function skillPageDescription(hookAr: string): string {
  const hook = hookAr.replace(/\s+/g, " ").trim();
  return `${hook} تدريب تفاعلي مجاني ضمن مسار قُدرة لاختبار القدرات الكمي.`;
}
