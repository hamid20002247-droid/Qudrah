"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function takeNext(): string {
  try {
    const pending = sessionStorage.getItem("qudrah_auth_pending");
    const next = sessionStorage.getItem("qudrah_auth_next");
    sessionStorage.removeItem("qudrah_auth_pending");
    sessionStorage.removeItem("qudrah_auth_next");
    if (
      pending === "1" &&
      next &&
      next.startsWith("/") &&
      !next.startsWith("//")
    ) {
      return next;
    }
  } catch {
    /* private mode */
  }
  return "/";
}

/** Client handoff after OAuth — restores the pre-login destination on this origin. */
export default function AuthContinuePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(takeNext());
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
      <span className="h-12 w-12 animate-pulse rounded-full bg-teal-100" />
    </div>
  );
}
