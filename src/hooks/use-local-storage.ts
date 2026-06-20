"use client";

import { useState } from "react";

function readLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

export function useLocalStorage(key: string, defaultValue: string) {
  const [value, setValue] = useState(() => readLocalStorage(key) ?? defaultValue);

  function update(next: string) {
    window.localStorage.setItem(key, next);
    setValue(next);
  }

  return [value, update] as const;
}
