import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "@/hooks/use-local-storage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  it("falls back to the default value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("reads an existing value from localStorage", () => {
    window.localStorage.setItem("key", "stored");
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    expect(result.current[0]).toBe("stored");
  });

  it("update() writes to localStorage and updates state", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));

    act(() => {
      result.current[1]("next");
    });

    expect(result.current[0]).toBe("next");
    expect(window.localStorage.getItem("key")).toBe("next");
  });
});
