import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/mock", "/skills", "/skill/", "/about"],
        disallow: [
          "/auth",
          "/api/",
          "/review",
          "/profile",
          "/result",
          "/ingest",
          "/auth/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/mock", "/skills", "/skill/", "/about"],
        disallow: [
          "/auth",
          "/api/",
          "/review",
          "/profile",
          "/result",
          "/ingest",
        ],
      },
    ],
    sitemap: `${PRODUCTION_SITE_URL}/sitemap.xml`,
    host: PRODUCTION_SITE_URL,
  };
}
