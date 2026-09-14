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
