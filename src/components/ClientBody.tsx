"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ClientReadyContext = createContext(false);

/** True after the app shell has mounted on the client (never during SSR). */
export function useClientReady(): boolean {
  return useContext(ClientReadyContext);
}

/**
 * Renders a minimal shell on the server + first client paint, then the real UI.
 * Avoids hydration fights with browser extensions that inject attributes
 * (e.g. Bitdefender `bis_skin_checked`) into every div before React runs.
 */
export function ClientBody({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        className="flex min-h-[50vh] flex-1 items-center justify-center"
        suppressHydrationWarning
        aria-busy
        aria-label="جارٍ التحميل"
      >
        <span
          className="h-10 w-10 animate-pulse rounded-full bg-teal-100"
          suppressHydrationWarning
        />
      </div>
    );
  }

  return (
    <ClientReadyContext.Provider value={true}>
      {children}
    </ClientReadyContext.Provider>
  );
}
