import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({ hasSession: vi.fn() }));
vi.mock("@/lib/upstream", () => ({ getInvoice: vi.fn() }));

const { hasSession } = await import("@/lib/session");
const { getInvoice } = await import("@/lib/upstream");
const { GET } = await import("./route");

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.mocked(hasSession).mockReset();
  vi.mocked(getInvoice).mockReset();
});

describe("GET /api/invoices/[id]", () => {
  it("returns 401 when there is no session", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(false);
    const res = await GET(new Request("http://localhost"), ctx("1"));
    expect(res.status).toBe(401);
  });

  it("returns 501 when the upstream call fails (not implemented)", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(true);
    vi.mocked(getInvoice).mockRejectedValueOnce(new Error("not implemented"));
    const res = await GET(new Request("http://localhost"), ctx("1"));
    expect(res.status).toBe(501);
    expect(await res.json()).toEqual({
      success: false,
      error: "Not implemented",
    });
  });
});
