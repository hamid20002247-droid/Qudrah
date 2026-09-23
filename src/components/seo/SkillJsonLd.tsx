import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/JsonLd";

/** Per-skill LearningResource + BreadcrumbList — server-only, no UI. */
export function SkillJsonLd({
  id,
  titleAr,
  description,
}: {
  id: string;
  titleAr: string;
  description: string;
}) {
  const url = absoluteUrl(`/skill/${id}`);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${url}#resource`,
        name: titleAr,
        description,
        url,
        inLanguage: "ar-SA",
        isAccessibleForFree: true,
        learningResourceType: "Interactive exercise",
        educationalLevel: "HighSchool",
        teaches: titleAr,
        about: {
          "@type": "Thing",
          name: "اختبار القدرات الكمي",
        },
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
        isPartOf: {
          "@type": "WebApplication",
          name: SITE_NAME,
          url: absoluteUrl("/"),
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
            name: "تأسيس المهارات",
            item: absoluteUrl("/skills"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: titleAr,
            item: url,
          },
        ],
      },
    ],
  };

  return <JsonLdScript id={`skill-jsonld-${id}`} data={data} />;
}
