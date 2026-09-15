"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  identifyGuest,
  identifyUser,
  resetAnalyticsToGuest,
} from "@/lib/analytics";
import { useProgress } from "@/store/progress";

/** Keeps PostHog person identity in sync with guest device ↔ Google account. */
export function AuthAnalytics() {
  const { user, loading, profile } = useAuth();
  const deviceId = useProgress((s) => s.deviceId);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (lastUserId.current === user.id) return;
      lastUserId.current = user.id;
      identifyUser(user.id, {
        email: user.email,
        name: profile?.display_name ?? null,
        provider:
          (user.app_metadata?.provider as string | undefined) ?? "google",
      });
      return;
    }

    if (lastUserId.current) {
      resetAnalyticsToGuest(deviceId);
      lastUserId.current = null;
      return;
    }

    identifyGuest(deviceId);
  }, [user, loading, profile?.display_name, deviceId]);

  return null;
}
