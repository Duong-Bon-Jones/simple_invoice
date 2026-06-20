import { describe, expect, it } from "vitest";
import { SessionExpiredError } from "@/lib/client-errors";

describe("SessionExpiredError", () => {
  it("is an instance of Error", () => {
    expect(new SessionExpiredError()).toBeInstanceOf(Error);
  });

  it("has the expected message", () => {
    expect(new SessionExpiredError().message).toBe("Session expired");
  });
});
