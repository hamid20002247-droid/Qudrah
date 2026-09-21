import type { Metadata } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";

export const SITE_NAME = "قُدرة";
export const SITE_NAME_LATIN = "Qudrah";

export const DEFAULT_TITLE = "قُدرة — تدريب القسم الكمي في القدرات";
export const DEFAULT_DESCRIPTION =
  "تدريب القسم الكمي مبني على تصوّر تفاعلي: جرّب الفكرة بنفسك عبر 60 مهارة، ثم اختصار وتدريب واختبار موقوت 60 سؤالاً. ليست تابعة لقياس.";

/** Absolute URL for a path (sharing / canonical). */
export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PRODUCTION_SITE_URL}${p === "/" ? "" : p}`;
}

const OG_IMAGE = {
  // Cache-bust so Telegram/WhatsApp pick up new art (they cache og:image hard)
  url: "/opengraph-image.png?v=2",
  width: 1200,
  height: 630,
  alt: "قُدرة — افهم بالتفاعل مو بالحفظ",
} as const;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Use bare title without "| قُدرة" template override */
  absoluteTitle?: boolean;
  noIndex?: boolean;
};

/** Consistent title / description / OG / Twitter for every shareable page. */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noIndex = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : title;

  return {
    title: absoluteTitle ? { absolute: fullTitle } : fullTitle,
    description,
    alternates: { canonical: path },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: absoluteTitle ? fullTitle : `${fullTitle} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? fullTitle : `${fullTitle} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
