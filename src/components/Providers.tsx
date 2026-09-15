"use client";

import { useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProgressSync } from "@/components/auth/ProgressSync";
import { AuthAnalytics } from "@/components/analytics/AuthAnalytics";
import { ScrollToTop } from "@/components/ScrollToTop";
import { initAnalytics } from "@/lib/analytics";
import { useProgress } from "@/store/progress";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useProgress.persist.rehydrate();
    initAnalytics();
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <AuthProvider>
        <AuthAnalytics />
        <ProgressSync />
        <ScrollToTop />
        {children}
      </AuthProvider>
    </PostHogProvider>
  );
}
