"use client";

import posthog from "posthog-js";
import { POSTHOG_KEY } from "@/lib/publicConfig";

export type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;

let initialized = false;
let attempted = false;
let pending: Array<{ event: string; props?: AnalyticsProps }> = [];
let pendingIdentity: Array<() => void> = [];

function trafficSource(): string {
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

function sessionKind(): "guest" | "signed_in" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  return window.localStorage.getItem("qudrah_auth_kind") === "signed_in"
    ? "signed_in"
    : "guest";
}

function enrich(props?: AnalyticsProps): AnalyticsProps {
  return {
    auth_state: sessionKind(),
    traffic_source: trafficSource(),
    path:
      typeof window !== "undefined" ? window.location.pathname : undefined,
    ...props,
  };
}

/**
 * No cookie banner — persistence is localStorage only (no tracking cookies).
 * Reverse-proxied through /ingest (proxy.ts sets Host) so ad-blockers miss most of it.
 * Guests are people too (`person_profiles: always`); Google identify() merges them.
 */
export function initAnalytics() {
  if (typeof window === "undefined" || initialized || attempted) return;
  attempted = true;
  // Production only — local traffic must not pollute the live funnel.
  if (process.env.NODE_ENV !== "production") return;
  const key = POSTHOG_KEY;
  if (!key) return;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";

  posthog.init(key, {
    api_host: host,
    ui_host: "https://us.posthog.com",
    defaults: "2025-11-30",
    person_profiles: "always",
    persistence: "localStorage",
    persistence_name: "ph_qudrah",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    capture_heatmaps: true,
    capture_dead_clicks: true,
    capture_performance: true,
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "input, textarea",
      recordCrossOriginIframes: false,
    },
    // Automation / embedded browsers set navigator.webdriver — still capture teens on phones.
    opt_out_useragent_filter: true,
    respect_dnt: false,
    opt_out_capturing_by_default: false,
    disable_surveys: true,
    sanitize_properties: (props) => {
      const next = { ...props };
      delete next.password;
      delete next.token;
      return next;
    },
    loaded: (ph) => {
      ph.register({
        product: "qudrah",
        surface: "web",
        auth_state: sessionKind(),
        traffic_source: trafficSource(),
      });
      // `loaded` runs before the SDK enables its send queue. Flush on the next tick.
      window.setTimeout(() => {
        ph.opt_in_capturing();
        initialized = true;
        for (const identify of pendingIdentity) identify();
        pendingIdentity = [];
        for (const item of pending) {
          ph.capture(item.event, enrich(item.props), { send_instantly: true });
        }
        pending = [];
      }, 0);
    },
  });
}

export function identifyGuest(deviceId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("qudrah_auth_kind", "guest");
  const run = () => {
    posthog.identify(deviceId, {
      auth_state: "guest",
      device_id: deviceId,
    });
    posthog.register({ auth_state: "guest", device_id: deviceId });
    posthog.setPersonProperties({
      auth_state: "guest",
      device_id: deviceId,
    });
    const lastSeen = localStorage.getItem("qudrah_last_seen");
    const now = Date.now();
    if (lastSeen) {
      const days = Math.floor((now - Number(lastSeen)) / (1000 * 60 * 60 * 24));
      if (days >= 1) {
        track("returned_session", { days_since_last: days, auth_state: "guest" });
      }
    }
    localStorage.setItem("qudrah_last_seen", String(now));
  };
  if (!initialized) {
    pendingIdentity.push(run);
    return;
  }
  run();
}

/** Merge anonymous guest into the signed-in person. */
export function identifyUser(
  userId: string,
  traits?: {
    email?: string | null;
    name?: string | null;
    provider?: string | null;
  }
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("qudrah_auth_kind", "signed_in");
  const run = () => {
    const seenKey = `qudrah_user_${userId}`;
    const firstTimeHere = !localStorage.getItem(seenKey);
    localStorage.setItem(seenKey, "1");
    posthog.identify(userId, {
      email: traits?.email ?? undefined,
      name: traits?.name ?? undefined,
      auth_provider: traits?.provider ?? undefined,
      auth_state: "signed_in",
    });
    posthog.register({ auth_state: "signed_in" });
    track(firstTimeHere ? "auth_signed_in" : "auth_session_resumed", {
      provider: traits?.provider ?? "unknown",
    });
  };
  if (!initialized) {
    pendingIdentity.push(run);
    return;
  }
  run();
}

export function resetAnalyticsToGuest(deviceId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("qudrah_auth_kind", "guest");
  if (!initialized) return;
  posthog.capture("auth_signed_out");
  posthog.reset();
  posthog.register({ auth_state: "guest", device_id: deviceId });
}

export function identifyDevice(deviceId: string) {
  identifyGuest(deviceId);
}

export function track(event: string, props?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  const payload = enrich(props);
  if (!initialized) {
    pending.push({ event, props: payload });
    if (process.env.NODE_ENV === "development") {
      console.debug("[analytics]", event, payload);
    }
    return;
  }
  posthog.capture(event, payload, { send_instantly: true });
}

export function trackPageView(pathname: string, search = "") {
  track("$pageview", {
    $current_url:
      typeof window !== "undefined" ? window.location.href : pathname,
    path: pathname,
    search: search || undefined,
  });
}

export function trackLandingView() {
  track("landing_view");
}

export { trafficSource as getTrafficSource };
