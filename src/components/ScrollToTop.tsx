"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollWindowToTop } from "@/lib/scroll";

function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    scrollWindowToTop("auto");
  }, [pathname, search]);

  return null;
}

/** Resets window scroll on every App Router navigation (path or query). */
export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}
