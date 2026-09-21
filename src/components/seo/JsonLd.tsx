import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "قُدرة",
    alternateName: "Qudrah",
    url: PRODUCTION_SITE_URL,
    inLanguage: "ar-SA",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    description:
      "تدريب القسم الكمي مبني على تصوّر تفاعلي: جرّب الفكرة بنفسك، ثم اختصار وتدريب واختبار موقوت.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    about: {
      "@type": "Thing",
      name: "اختبار القدرات العامة — القسم الكمي",
    },
    publisher: {
      "@type": "Organization",
      name: "قُدرة",
      url: PRODUCTION_SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
