import { ALL_SKILLS } from "@/content/arithmetic";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/JsonLd";

/** ItemList of live skills for /skills — crawl signal only. */
export function SkillsJsonLd() {
  const approved = ALL_SKILLS.filter((s) => s.review_status === "approved");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/skills")}#page`,
        name: "تدريب قدرات كمي — تأسيس المهارات",
        description:
          "خريطة مهارات القسم الكمي: حساب، جبر، هندسة، إحصاء، ومقارنات.",
        url: absoluteUrl("/skills"),
        inLanguage: "ar-SA",
        isPartOf: {
          "@type": "WebApplication",
          name: SITE_NAME,
          url: absoluteUrl("/"),
        },
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl("/skills")}#list`,
        name: "مهارات قدرات كمي",
        numberOfItems: approved.length,
        itemListElement: approved.map((skill, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: skill.title_ar,
          url: absoluteUrl(`/skill/${skill.id}`),
        })),
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
        ],
      },
    ],
  };

  return <JsonLdScript id="skills-jsonld" data={data} />;
}
