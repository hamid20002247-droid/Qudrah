"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/auth/AccountMenu";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHref } from "@/lib/access";
import { useClientReady } from "@/components/ClientBody";
import { LtrNum } from "@/components/ui/LtrNum";
import { track } from "@/lib/analytics";
import { useProgress } from "@/store/progress";

const ICON = "/icons/icon.svg?v=4";

export function TopBar() {
  const ready = useClientReady();
  const daysUntilTest = useProgress((s) => s.daysUntilTest);
  const streakDays = useProgress((s) => s.streakDays);
  const days = ready ? daysUntilTest() : null;
  const streak = ready ? streakDays : 0;
  const showExam = days !== null && days >= 0;
  const showStreak = streak > 1;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-lg items-center gap-2 overflow-hidden px-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 text-teal-700 sm:gap-2"
          aria-label="قُدرة — الرئيسية"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ICON}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-[0.55rem] shadow-sm shadow-teal-700/20"
            decoding="async"
          />
          <span className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">
            قُدرة
          </span>
        </Link>

        <div className="ms-auto flex min-w-0 items-center justify-end gap-1 sm:gap-1.5">
          {showExam && (
            <span
              className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold tabular-nums text-amber-900 ring-1 ring-amber-200 sm:px-2.5 sm:text-[11px]"
              title={
                days === 0 ? "اختبارك اليوم" : `${days} يوماً لاختبارك`
              }
            >
              {days === 0 ? (
                "اليوم"
              ) : (
                <>
                  <LtrNum>{days}</LtrNum>
                  <span className="ms-0.5">يوم</span>
                </>
              )}
            </span>
          )}
          {showStreak && (
            <span
              className={`shrink-0 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold tabular-nums text-teal-800 ring-1 ring-teal-100 sm:px-2.5 sm:text-[11px] ${
                showExam ? "max-[359px]:hidden" : ""
              }`}
              title={`استمرار ${streak} أيام`}
            >
              <LtrNum>{streak}</LtrNum>
              <span className="ms-0.5">يوم</span>
            </span>
          )}
          <div className="shrink-0">
            <AccountMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

const NAV = [
  {
    href: "/",
    label: "الرئيسية",
    match: (p: string) => p === "/",
    icon: IconHome,
  },
  {
    href: "/skills",
    label: "المهارات",
    match: (p: string) => p.startsWith("/skills") || p.startsWith("/skill"),
    icon: IconSkills,
  },
  {
    href: "/mock",
    label: "الاختبار",
    match: (p: string) => p.startsWith("/mock") || p.startsWith("/result"),
    icon: IconMock,
    emphasize: true,
  },
] as const;

function IconHome({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? "text-teal-700" : "text-current"}
    >
      <path
        d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-4V21H5.5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function IconSkills({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? "text-teal-700" : "text-current"}
    >
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <rect
        x="3.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <rect
        x="13.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.75"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function IconMock({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={active ? "text-teal-700" : "text-current"}
    >
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="2"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M12 7.75V12l3 1.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname() || "/";
  if (
    pathname.startsWith("/review") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/skill/")
  ) {
    return null;
  }

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 w-full pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="التنقّل الرئيسي"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-lg px-2.5 sm:px-3">
        <div className="w-full rounded-[1.25rem] bg-white/95 p-1 shadow-[0_-4px_40px_-8px_rgba(15,23,42,0.28),0_12px_32px_-16px_rgba(15,23,42,0.2)] ring-1 ring-slate-200/90 backdrop-blur-xl sm:rounded-[1.35rem] sm:p-1.5">
          <div className="grid w-full grid-cols-3 gap-0.5 sm:gap-1">
            {NAV.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              const emphasize = "emphasize" in item && item.emphasize;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() =>
                    track("nav_clicked", { href: item.href, label: item.label })
                  }
                  className={`relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-[1rem] px-0.5 transition active:scale-[0.97] sm:min-h-[3.65rem] sm:gap-1 sm:rounded-[1.05rem] sm:px-1 ${
                    active
                      ? "bg-teal-50 text-teal-800 shadow-sm ring-1 ring-teal-100"
                      : emphasize
                        ? "text-slate-700"
                        : "text-slate-500"
                  }`}
                >
                  {emphasize && !active && (
                    <span
                      className="absolute inset-x-3 top-1.5 h-0.5 rounded-full bg-teal-400/70"
                      aria-hidden
                    />
                  )}
                  <Icon active={active} />
                  <span
                    className={`text-[10px] leading-none sm:text-[11px] ${
                      active ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
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
    <div className="sticky bottom-[5.5rem] z-30 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md">
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
  const skillPage = pathname.startsWith("/skill/");
  const guest = ready && configured && !loading && !user;

  return (
    <footer
      className={`mt-auto border-t border-slate-100 pt-8 ${
        authPage || skillPage ? "pb-8" : "pb-28"
      }`}
    >
      <div className="mx-auto max-w-lg space-y-3 px-4 text-center text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link href="/skills" className="hover:text-teal-700">
            المهارات
          </Link>
          <Link href="/mock" className="hover:text-teal-700">
            الاختبار
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
