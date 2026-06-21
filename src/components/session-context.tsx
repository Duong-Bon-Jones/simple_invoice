"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const DISPLAY_NAME_COOKIE = "display_name";

function subscribe() {
  // Display name cookie is set once at login; nothing to subscribe to.
  return () => {};
}

function getSnapshot(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${DISPLAY_NAME_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function getServerSnapshot(): string | null {
  return null;
}

const SessionContext = createContext<string | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <SessionContext.Provider value={name}>{children}</SessionContext.Provider>
  );
}

export function useSession(): string | null {
  return useContext(SessionContext);
}
