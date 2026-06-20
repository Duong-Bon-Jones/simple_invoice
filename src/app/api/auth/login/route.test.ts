import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ setSession: vi.fn() }));
vi.mock("@/lib/upstream", () => ({
  AuthError: class AuthError extends Error {},
  exchangeCredentialsForToken: vi.fn(),
}));

const { setSession } = await import("@/lib/session");
const { AuthError, exchangeCredentialsForToken } = await import(
  "@/lib/upstream"
);
const { POST } = await import("./route");

function request(body: unknown) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.mocked(setSession).mockReset();
  vi.mocked(exchangeCredentialsForToken).mockReset();
});

describe("POST /api/auth/login", () => {
  it("returns 400 when the body fails validation", async () => {
    const res = await POST(request({ username: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 when the body isn't valid JSON", async () => {
    const malformed = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(malformed);
    expect(res.status).toBe(400);
  });

  it("returns 401 when the upstream rejects credentials", async () => {
    vi.mocked(exchangeCredentialsForToken).mockRejectedValueOnce(
      new AuthError("bad creds"),
    );
    const res = await POST(request({ username: "u", password: "p" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ success: false, error: "Invalid credentials" });
  });

  it("returns 502 on an unexpected upstream failure", async () => {
    vi.mocked(exchangeCredentialsForToken).mockRejectedValueOnce(
      new Error("boom"),
    );
    const res = await POST(request({ username: "u", password: "p" }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json).toEqual({ success: false, error: "Login failed, try again" });
  });

  it("sets the session and returns success on valid credentials", async () => {
    vi.mocked(exchangeCredentialsForToken).mockResolvedValueOnce({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 3600,
      name: "Jane Doe",
    });
    const res = await POST(request({ username: "u", password: "p" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(setSession).toHaveBeenCalledWith({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 3600,
      name: "Jane Doe",
    });
  });
});
