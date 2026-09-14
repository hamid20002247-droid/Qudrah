"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProgressSync } from "@/components/auth/ProgressSync";
import { ScrollToTop } from "@/components/ScrollToTop";
import { initAnalytics } from "@/lib/analytics";
import { useProgress } from "@/store/progress";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useProgress.persist.rehydrate();
    initAnalytics();
  }, []);

  return (
    <AuthProvider>
      <ProgressSync />
      <ScrollToTop />
      {children}
    </AuthProvider>
  );
}
