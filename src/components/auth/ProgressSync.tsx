"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  mergeProgressSnapshots,
  snapshotFromState,
  type ProgressSnapshot,
} from "@/lib/progressMerge";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { useProgress } from "@/store/progress";

const PUSH_DEBOUNCE_MS = 1200;

/**
 * When logged in: pull cloud progress once, merge with local, then
 * push local changes to Supabase (debounced). Guests keep localStorage only.
 */
export function ProgressSync() {
  const { user, configured } = useAuth();
  const hydratedFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushing = useRef(false);

  // Hydrate from cloud on login
  useEffect(() => {
    if (!configured || !user) {
      hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === user.id) return;

    const supabase = createSupabaseBrowser();
    if (!supabase) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("payload, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        console.warn("[progress sync] pull failed", error.message);
        hydratedFor.current = user.id;
        return;
      }

      const remote = (data?.payload as ProgressSnapshot | undefined) ?? null;
      const local = snapshotFromState(useProgress.getState());
      const merged = mergeProgressSnapshots(local, remote);
      useProgress.setState(merged);
      hydratedFor.current = user.id;

      // Push merged immediately so cloud has the union
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          device_id: merged.deviceId,
          payload: merged,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, user]);

  // Push on local changes
  useEffect(() => {
    if (!configured || !user) return;

    const unsub = useProgress.subscribe((state) => {
      if (hydratedFor.current !== user.id) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const supabase = createSupabaseBrowser();
        if (!supabase || pushing.current) return;
        pushing.current = true;
        try {
          const payload = snapshotFromState(state);
          await supabase.from("user_progress").upsert(
            {
              user_id: user.id,
              device_id: payload.deviceId,
              payload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        } catch (e) {
          console.warn("[progress sync] push failed", e);
        } finally {
          pushing.current = false;
        }
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [configured, user]);

  return null;
}
