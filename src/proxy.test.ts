import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function request(path: string, accessToken?: string) {
  const headers = accessToken
    ? { cookie: `access_token=${accessToken}` }
    : undefined;
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("proxy", () => {
  it("redirects to /login when there is no session on a protected route", () => {
    const res = proxy(request("/invoices"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/login");
  });

  it("allows an unauthenticated request to the public /login route", () => {
    const res = proxy(request("/login"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("Content-Security-Policy")).toContain(
      "default-src 'self'",
    );
  });

  it("redirects an authenticated request away from /login", () => {
    const res = proxy(request("/login", "token"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/invoices");
  });

  it("passes through with a CSP header for an authenticated protected request", () => {
    const res = proxy(request("/invoices", "token"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("Content-Security-Policy")).toContain(
      "frame-ancestors 'none'",
    );
  });

  it("includes 'unsafe-eval' in the CSP only in development", async () => {
    vi.resetModules();
    const prevEnv = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "development");
    const { proxy: devProxy } = await import("./proxy");
    const res = devProxy(request("/invoices", "token"));
    expect(res.headers.get("Content-Security-Policy")).toContain("unsafe-eval");
    vi.stubEnv("NODE_ENV", prevEnv ?? "test");
    vi.resetModules();
  });
});
