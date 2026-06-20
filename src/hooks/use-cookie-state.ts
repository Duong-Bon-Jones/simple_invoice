"use client";

import { useState } from "react";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${escapeForRegExp(name)}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}`;
}

export function useCookieState(
  name: string,
  defaultValue: string,
  maxAgeSeconds = ONE_YEAR_SECONDS,
) {
  const [value, setValue] = useState(() => readCookie(name) ?? defaultValue);

  function update(next: string) {
    writeCookie(name, next, maxAgeSeconds);
    setValue(next);
  }

  return [value, update] as const;
}
