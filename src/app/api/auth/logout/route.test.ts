import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ clearSession: vi.fn() }));

const { clearSession } = await import("@/lib/session");
const { POST } = await import("./route");

beforeEach(() => {
  vi.mocked(clearSession).mockReset();
});

describe("POST /api/auth/logout", () => {
  it("clears the session and returns success", async () => {
    const res = await POST();
    expect(clearSession).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
