"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHref } from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { useProgress } from "@/store/progress";

const ICON = "/icons/icon.svg?v=4";

export function TopBar() {
  const ready = useClientReady();
  const daysUntilTest = useProgress((s) => s.daysUntilTest);
  const streakDays = useProgress((s) => s.streakDays);
  const days = ready ? daysUntilTest() : null;
  const streak = ready ? streakDays : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-teal-700"
          aria-label="قُدرة — الرئيسية"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ICON}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-[0.55rem] shadow-sm shadow-teal-700/20"
            decoding="async"
          />
          <span className="font-display text-2xl font-extrabold tracking-tight">
            قُدرة
          </span>
        </Link>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
          {days !== null && days >= 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
              {days === 0 ? "اختبارك اليوم" : `${days} يوماً لاختبارك`}
            </span>
          )}
          {streak > 1 && (
            <span
              className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-100"
              title="أيام متتالية تدرّبت فيها"
            >
              استمرار {streak} أيام
            </span>
          )}
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

const NAV = [
  { href: "/", label: "الرئيسية", match: (p: string) => p === "/" },
  {
    href: "/skills",
    label: "المهارات",
    match: (p: string) => p.startsWith("/skills") || p.startsWith("/skill"),
  },
  {
    href: "/mock",
    label: "المحاكاة",
    match: (p: string) => p.startsWith("/mock") || p.startsWith("/result"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/review") || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقّل الرئيسي"
    >
      <div className="mx-auto grid max-w-lg grid-cols-3">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold transition ${
                active ? "text-teal-700" : "text-slate-400"
              }`}
            >
              <span
                className={`h-1 w-6 rounded-full ${
                  active ? "bg-teal-600" : "bg-transparent"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BottomCta({
  href,
  label,
  onClick,
  secondaryHref,
  secondaryLabel,
}: {
  href?: string;
  label: string;
  onClick?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  const className =
    "flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-600 px-4 text-base font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 active:scale-[0.98]";

  return (
    <div className="sticky bottom-14 z-30 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        {href ? (
          <Link href={href} className={className} onClick={onClick}>
            {label}
          </Link>
        ) : (
          <button type="button" className={className} onClick={onClick}>
            {label}
          </button>
        )}
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="flex min-h-10 items-center justify-center text-sm font-semibold text-teal-800"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const ready = useClientReady();
  const { user, loading, configured } = useAuth();
  const authPage = pathname.startsWith("/auth");
  const guest = ready && configured && !loading && !user;

  return (
    <footer
      className={`mt-auto border-t border-slate-100 pt-8 ${
        authPage ? "pb-8" : "pb-24"
      }`}
    >
      <div className="mx-auto max-w-lg space-y-3 px-4 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/skills" className="hover:text-teal-700">
            المهارات
          </Link>
          <Link href="/mock" className="hover:text-teal-700">
            المحاكاة
          </Link>
          <Link href="/auth" className="hover:text-teal-700">
            الحساب
          </Link>
          <Link
            href={guest ? authHref("/profile") : "/profile"}
            className="hover:text-teal-700"
          >
            صفحتي
          </Link>
          <Link href="/about" className="hover:text-teal-700">
            عن قُدرة
          </Link>
        </div>
        <p>
          قُدرة أداة مساعدة للمذاكرة — غير تابعة لهيئة تقويم التعليم والتدريب
          أو قياس.
        </p>
      </div>
    </footer>
  );
}
