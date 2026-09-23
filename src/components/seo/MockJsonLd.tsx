import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/JsonLd";

/** Mock exam bank as a free Course / Practice test — no UI. */
export function MockJsonLd() {
  const url = absoluteUrl("/mock");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${url}#course`,
        name: "اختبار القدرات الكمي — 20 اختباراً تجريبياً",
        description:
          "بنك 20 اختباراً كاملاً للقسم الكمي: كل اختبار 60 سؤالاً في 60 دقيقة مع درجة فورية. تدريب مجاني لمحاكاة قدرات كمي.",
        url,
        inLanguage: "ar-SA",
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: "PT1H",
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "SAR",
          category: "Free",
        },
        about: {
          "@type": "Thing",
          name: "اختبار القدرات العامة — القسم الكمي",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "اختبارات قدرات كمي",
            item: url,
          },
        ],
      },
    ],
  };

  return <JsonLdScript id="mock-jsonld" data={data} />;
}
