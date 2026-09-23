import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_LATIN,
  absoluteUrl,
} from "@/lib/seo";

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

/** Safe JSON-LD script — no UI, crawl/rich-result signal only. */
export function JsonLdScript({ data, id }: { data: JsonLdValue; id?: string }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Site-wide graph: Organization + WebSite + WebApplication + FAQ.
 * FAQ answers mirror facts already visible on home/about (no cloaking).
 */
export function JsonLd() {
  const orgId = `${PRODUCTION_SITE_URL}/#organization`;
  const siteId = `${PRODUCTION_SITE_URL}/#website`;
  const appId = `${PRODUCTION_SITE_URL}/#webapp`;

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE_NAME,
        alternateName: SITE_NAME_LATIN,
        url: PRODUCTION_SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/icons/icon-512.png"),
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://www.tiktok.com/@qudrah.app",
          "https://www.instagram.com/qudrah.app",
        ],
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: PRODUCTION_SITE_URL,
        name: SITE_NAME,
        alternateName: SITE_NAME_LATIN,
        inLanguage: "ar-SA",
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "ReadAction",
          target: [
            absoluteUrl("/"),
            absoluteUrl("/mock"),
            absoluteUrl("/skills"),
          ],
        },
      },
      {
        "@type": "WebApplication",
        "@id": appId,
        name: SITE_NAME,
        alternateName: SITE_NAME_LATIN,
        url: PRODUCTION_SITE_URL,
        inLanguage: "ar-SA",
        applicationCategory: "EducationalApplication",
        applicationSubCategory: "TestPreparation",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        description: DEFAULT_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "SAR",
          availability: "https://schema.org/InStock",
        },
        about: {
          "@type": "Thing",
          name: "اختبار القدرات العامة — القسم الكمي",
          sameAs: "https://www.etec.gov.sa/",
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          geographicArea: {
            "@type": "Country",
            name: "Saudi Arabia",
          },
        },
        provider: { "@id": orgId },
        isPartOf: { "@id": siteId },
      },
      {
        "@type": "FAQPage",
        "@id": `${PRODUCTION_SITE_URL}/#faq`,
        inLanguage: "ar-SA",
        mainEntity: [
          {
            "@type": "Question",
            name: "ما هو قُدرة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "قُدرة أداة تدريب مستقلة للقسم الكمي في اختبار القدرات: اختبارات كاملة وتأسيس تفاعلي بالمهارات. غير تابعة لهيئة تقويم التعليم والتدريب أو قياس.",
            },
          },
          {
            "@type": "Question",
            name: "كم عدد اختبارات القدرات الكمي في قُدرة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "يوجد 20 اختباراً كمياً معتمداً للتدريب. كل اختبار 60 سؤالاً في 60 دقيقة، مع درجة فورية بعد التسليم.",
            },
          },
          {
            "@type": "Question",
            name: "هل تدريب قدرات كمي في قُدرة مجاني؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم. التدريب والاختبارات مجانية. يمكنك تجربة مهارات بدون حساب، والتسجيل بـ Google يحفظ درجتك ومسارك على كل الأجهزة.",
            },
          },
          {
            "@type": "Question",
            name: "ما الفرق بين الاختبار والتأسيس في قُدرة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "الاختبار محاكاة كاملة بوقت ودرجة. التأسيس مهارات تفاعلية (تصوّر باللمس ثم اختصار وتدريب) تغطي مسارات الحساب والجبر والهندسة والإحصاء والمقارنات.",
            },
          },
        ],
      },
    ],
  };

  return <JsonLdScript id="qudrah-site-jsonld" data={data} />;
}
