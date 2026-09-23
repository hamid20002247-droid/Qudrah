import type { MetadataRoute } from "next";
import { ALL_SKILLS } from "@/content/arithmetic";
import { PRODUCTION_SITE_URL } from "@/lib/publicConfig";

/**
 * Clean indexable URLs only — no query-string soft duplicates.
 * Priority mirrors conversion path: home → mock → skills → skill pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    {
      url: PRODUCTION_SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${PRODUCTION_SITE_URL}/mock`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${PRODUCTION_SITE_URL}/skills`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${PRODUCTION_SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  for (const skill of ALL_SKILLS) {
    if (skill.review_status !== "approved") continue;
    pages.push({
      url: `${PRODUCTION_SITE_URL}/skill/${skill.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return pages;
}
