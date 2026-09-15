"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useClientReady } from "@/components/ClientBody";
import { track } from "@/lib/analytics";

export function nameInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t.charAt(0);
}

export function AccountMenu() {
  const ready = useClientReady();
  const { user, loading, configured, displayName, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!configured) return null;

  // Same placeholder on server + first client paint (avoids hydration mismatch)
  if (!ready || loading) {
    return (
      <span
        className="h-9 w-9 animate-pulse rounded-full bg-slate-100"
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        onClick={() => track("account_menu_login_clicked")}
        className="rounded-full bg-teal-600 px-3.5 py-1.5 text-[12px] font-bold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700"
      >
        دخول
      </Link>
    );
  }

  const initial = nameInitial(displayName);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-extrabold text-white shadow-sm shadow-teal-600/30 ring-2 ring-white transition hover:brightness-110"
        title={displayName}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-slate-100 px-3 py-2.5">
            <p className="truncate text-sm font-bold text-slate-900">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-400" dir="ltr">
              {user.email}
            </p>
          </div>
          <Link
            href="/profile"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-start text-sm font-semibold text-teal-800 hover:bg-teal-50"
            onClick={() => setOpen(false)}
          >
            صفحتي
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-start text-sm font-semibold text-rose-700 hover:bg-rose-50"
            onClick={async () => {
              setOpen(false);
              track("account_menu_sign_out");
              await signOut();
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
