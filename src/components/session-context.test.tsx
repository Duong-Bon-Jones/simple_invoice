import { render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { SessionProvider, useSession } from "./session-context";

let latest: string | null = null;

function Probe() {
  const session = useSession();
  useEffect(() => {
    latest = session;
  });
  return null;
}

function renderProvider() {
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
}

function setDisplayNameCookie(value: string | null) {
  document.cookie = "display_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  if (value !== null) {
    document.cookie = `display_name=${encodeURIComponent(value)}`;
  }
}

beforeEach(() => {
  latest = null;
  setDisplayNameCookie(null);
});

describe("SessionProvider / useSession", () => {
  it("returns null when there is no display_name cookie", () => {
    renderProvider();
    expect(latest).toBeNull();
  });

  it("returns the decoded display_name cookie value", () => {
    setDisplayNameCookie("Jane Doe");
    renderProvider();
    expect(latest).toBe("Jane Doe");
  });
});
