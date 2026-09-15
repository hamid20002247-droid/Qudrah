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
      "أداة تدريب مستقلة للقسم الكمي في اختبار القدرات العامة: مهارات تفاعلية واختبار موقوت.",
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
