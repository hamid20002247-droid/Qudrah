"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SkillsMap } from "@/components/skills/SkillsMap";

function SkillsMapWithParams() {
  const searchParams = useSearchParams();
  const field = searchParams.get("field");
  return <SkillsMap initialField={field} />;
}

export default function SkillsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 pb-36 pt-8">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-12 w-64 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[5.75rem] animate-pulse rounded-[1.65rem] bg-slate-100"
              />
            ))}
          </div>
        </div>
      }
    >
      <SkillsMapWithParams />
    </Suspense>
  );
}
