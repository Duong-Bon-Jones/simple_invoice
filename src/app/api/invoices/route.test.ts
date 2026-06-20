import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({ hasSession: vi.fn() }));
vi.mock("@/lib/upstream", () => ({
  AuthError: class AuthError extends Error {},
  listInvoices: vi.fn(),
}));

const { hasSession } = await import("@/lib/session");
const { AuthError, listInvoices } = await import("@/lib/upstream");
const { GET } = await import("./route");

function request(query: string) {
  return new NextRequest(`http://localhost/api/invoices${query}`);
}

beforeEach(() => {
  vi.mocked(hasSession).mockReset();
  vi.mocked(listInvoices).mockReset();
});

describe("GET /api/invoices", () => {
  it("returns 401 when there is no session", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(false);
    const res = await GET(request(""));
    expect(res.status).toBe(401);
  });

  it("returns 400 when the query params fail validation", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(true);
    const res = await GET(request("?sortBy=NOT_REAL"));
    expect(res.status).toBe(400);
  });

  it("returns 401 when the upstream throws AuthError", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(true);
    vi.mocked(listInvoices).mockRejectedValueOnce(new AuthError("expired"));
    const res = await GET(request(""));
    expect(res.status).toBe(401);
  });

  it("returns 502 on an unexpected upstream failure", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(true);
    vi.mocked(listInvoices).mockRejectedValueOnce(new Error("boom"));
    const res = await GET(request(""));
    expect(res.status).toBe(502);
  });

  it("returns the invoices and paging on success", async () => {
    vi.mocked(hasSession).mockResolvedValueOnce(true);
    vi.mocked(listInvoices).mockResolvedValueOnce({
      invoices: [{ invoiceId: "1" }],
      paging: { pageNum: 1, pageSize: 10, total: 1 },
    });
    const res = await GET(request("?pageNum=1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      success: true,
      data: {
        invoices: [{ invoiceId: "1" }],
        paging: { pageNum: 1, pageSize: 10, total: 1 },
      },
    });
  });
});
