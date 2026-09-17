"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  authErrorMessage,
  displayNameFromUser,
  type AuthProfile,
} from "@/lib/auth";
import {
  createSupabaseBrowser,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  profile: AuthProfile | null;
  loading: boolean;
  configured: boolean;
  displayName: string;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signInWithGoogle: (next?: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(
  userId: string
): Promise<AuthProfile | null> {
  const supabase = createSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, provider")
    .eq("id", userId)
    .maybeSingle();
  return (data as AuthProfile | null) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(configured);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await loadProfile(user.id);
    setProfile(
      p ?? {
        id: user.id,
        email: user.email ?? null,
        display_name: displayNameFromUser(user),
        avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
        provider: (user.app_metadata?.provider as string) ?? "email",
      }
    );
  }, [user]);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let alive = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    void refreshProfile();
  }, [user, refreshProfile]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = createSupabaseBrowser();
      if (!supabase) return "خدمة الحسابات غير مفعّلة حالياً.";
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return error ? authErrorMessage(error) : null;
    },
    []
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const supabase = createSupabaseBrowser();
      if (!supabase) {
        return { error: "خدمة الحسابات غير مفعّلة حالياً.", needsConfirm: false };
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: displayName?.trim()
            ? { full_name: displayName.trim() }
            : undefined,
        },
      });
      if (error) {
        return { error: authErrorMessage(error), needsConfirm: false };
      }
      const needsConfirm = !data.session;
      return { error: null, needsConfirm };
    },
    []
  );

  const signInWithGoogle = useCallback(async (next = "/") => {
    const supabase = createSupabaseBrowser();
    if (!supabase) return "خدمة الحسابات غير مفعّلة حالياً.";
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    return error ? authErrorMessage(error) : null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateDisplayName = useCallback(
    async (name: string) => {
      const trimmed = name.trim().replace(/\s+/g, " ");
      if (!trimmed) return "اكتب اسماً يظهر في حسابك.";
      if (trimmed.length < 2) return "الاسم قصير جداً.";
      if (trimmed.length > 40) return "الاسم طويل جداً (حدّه ٤٠ حرفاً).";

      const supabase = createSupabaseBrowser();
      if (!supabase || !user) return "سجّل الدخول أولاً.";

      const { data: authData, error: authErr } = await supabase.auth.updateUser({
        data: { full_name: trimmed, name: trimmed },
      });
      if (authErr) return authErrorMessage(authErr);

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          display_name: trimmed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (profileErr) return authErrorMessage(profileErr);

      if (authData.user) setUser(authData.user);
      setProfile((prev) =>
        prev
          ? { ...prev, display_name: trimmed }
          : {
              id: user.id,
              email: user.email ?? null,
              display_name: trimmed,
              avatar_url:
                (user.user_metadata?.avatar_url as string) ?? null,
              provider: (user.app_metadata?.provider as string) ?? "email",
            }
      );
      return null;
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured,
      displayName:
        profile?.display_name || displayNameFromUser(user) || "حسابي",
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      refreshProfile,
      updateDisplayName,
    }),
    [
      user,
      profile,
      loading,
      configured,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      refreshProfile,
      updateDisplayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
