import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "ادخل بحساب Google واحفظ تقدّمك في قُدرة.",
};

export default function AuthPage() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-8rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(13,148,136,0.22),_transparent_65%)]"
        aria-hidden
      />
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-[2rem] bg-slate-100" />
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}
