"use client";

/**
 * Pageviews are captured by posthog-js (`capture_pageview: "history_change"`).
 * Kept as a no-op mount so layout Suspense boundary stays stable.
 */
export function PostHogPageView() {
  return null;
}
