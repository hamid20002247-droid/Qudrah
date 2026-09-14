"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) return;

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });
  initialized = true;
}

function getTrafficSource(): string {
  if (typeof window === "undefined") return "unknown";
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return utm;
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    return new URL(ref).hostname;
  } catch {
    return "referral";
  }
}

export function identifyDevice(deviceId: string) {
  if (!initialized) return;
  posthog.identify(deviceId);
  const lastSeen = localStorage.getItem("qudrah_last_seen");
  const now = Date.now();
  if (lastSeen) {
    const days = Math.floor(
      (now - Number(lastSeen)) / (1000 * 60 * 60 * 24)
    );
    if (days >= 1) {
      track("returned_session", { days_since_last: days });
    }
  }
  localStorage.setItem("qudrah_last_seen", String(now));
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;
  if (!initialized) {
    // Still useful in console during local/dev without PostHog
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, props);
    }
    return;
  }
  posthog.capture(event, props);
}

export function trackLandingView() {
  track("landing_view", { traffic_source: getTrafficSource() });
}

export { getTrafficSource };
