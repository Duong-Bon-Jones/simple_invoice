import { describe, expect, it } from "vitest";
import { withSessionGuard } from "@/lib/auth-action";
import { AuthError } from "@/lib/upstream";

describe("withSessionGuard", () => {
  it("returns ok:true with data on success", async () => {
    const result = await withSessionGuard(async () => "value");
    expect(result).toEqual({ ok: true, data: "value" });
  });

  it("maps AuthError to a session-expired result", async () => {
    const result = await withSessionGuard(async () => {
      throw new AuthError("nope");
    });
    expect(result).toEqual({
      ok: false,
      error: "Session expired",
      sessionExpired: true,
    });
  });

  it("passes through a generic Error message", async () => {
    const result = await withSessionGuard(async () => {
      throw new Error("boom");
    });
    expect(result).toEqual({ ok: false, error: "boom" });
  });

  it("falls back to a generic message for non-Error throws", async () => {
    const result = await withSessionGuard(async () => {
      throw "not an error";
    });
    expect(result).toEqual({ ok: false, error: "Something went wrong" });
  });
});
