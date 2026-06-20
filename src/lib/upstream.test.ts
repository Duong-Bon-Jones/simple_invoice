import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockJson } from "../../test/helpers";

vi.mock("@/lib/session", () => ({
  getAccessToken: vi.fn(async () => "access-token"),
  getOrgToken: vi.fn(async () => "org-token"),
}));

const {
  AuthError,
  exchangeCredentialsForToken,
  listInvoices,
  createInvoice,
  getInvoice,
} = await import("@/lib/upstream");

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("exchangeCredentialsForToken", () => {
  it("throws AuthError on 401 from the token endpoint", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(401, {}));
    await expect(
      exchangeCredentialsForToken("user", "pass"),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("throws AuthError on 400 from the token endpoint", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(400, {}));
    await expect(
      exchangeCredentialsForToken("user", "pass"),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("throws a generic Error when the token response is not ok", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(500, {}));
    await expect(exchangeCredentialsForToken("user", "pass")).rejects.toThrow(
      "Token exchange failed: 500",
    );
  });

  it("returns tokens and the joined display name on success", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJson(200, { access_token: "abc", expires_in: 1000 }),
      )
      .mockResolvedValueOnce(
        mockJson(200, {
          data: {
            firstName: "Jane",
            lastName: "Doe",
            memberships: [{ token: "org-1" }],
          },
        }),
      );

    const result = await exchangeCredentialsForToken("user", "pass");
    expect(result).toEqual({
      accessToken: "abc",
      orgToken: "org-1",
      expiresIn: 1000,
      name: "Jane Doe",
    });
  });

  it("returns null name when no names are present", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJson(200, { access_token: "abc", expires_in: 1000 }),
      )
      .mockResolvedValueOnce(
        mockJson(200, { data: { memberships: [{ token: "org-1" }] } }),
      );

    const result = await exchangeCredentialsForToken("user", "pass");
    expect(result.name).toBeNull();
  });

  it("uses a single name when only one is present", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJson(200, { access_token: "abc", expires_in: 1000 }),
      )
      .mockResolvedValueOnce(
        mockJson(200, {
          data: { firstName: "Jane", memberships: [{ token: "org-1" }] },
        }),
      );

    const result = await exchangeCredentialsForToken("user", "pass");
    expect(result.name).toBe("Jane");
  });

  it("throws when memberships is empty", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJson(200, { access_token: "abc", expires_in: 1000 }),
      )
      .mockResolvedValueOnce(mockJson(200, { data: { memberships: [] } }));

    await expect(
      exchangeCredentialsForToken("user", "pass"),
    ).rejects.toThrow();
  });

  it("throws a generic Error when the membership lookup is not ok", async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJson(200, { access_token: "abc", expires_in: 1000 }),
      )
      .mockResolvedValueOnce(mockJson(500, {}));

    await expect(exchangeCredentialsForToken("user", "pass")).rejects.toThrow(
      "Membership lookup failed: 500",
    );
  });
});

const QUERY = {
  sortBy: "CREATED_DATE" as const,
  ordering: "DESCENDING" as const,
  pageNum: 1,
  pageSize: 10,
};

describe("listInvoices", () => {
  it("throws AuthError on 401", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(401, {}));
    await expect(listInvoices(QUERY)).rejects.toBeInstanceOf(AuthError);
  });

  it("throws a generic Error when not ok", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(500, {}));
    await expect(listInvoices(QUERY)).rejects.toThrow(
      "List invoices failed: 500",
    );
  });

  it("maps paging from the response when present", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJson(200, {
        data: [{ invoiceId: "1" }],
        paging: { pageNumber: 2, pageSize: 5, totalRecords: 12 },
      }),
    );
    const result = await listInvoices(QUERY);
    expect(result.paging).toEqual({ pageNum: 2, pageSize: 5, total: 12 });
    expect(result.invoices).toHaveLength(1);
  });

  it("falls back to query paging and invoices.length when paging is missing", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJson(200, { data: [{ invoiceId: "1" }, { invoiceId: "2" }] }),
    );
    const result = await listInvoices(QUERY);
    expect(result.paging).toEqual({
      pageNum: QUERY.pageNum,
      pageSize: QUERY.pageSize,
      total: 2,
    });
  });
});

const CREATE_INPUT = {
  customerFirstName: "Jane",
  customerLastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "+447123456789",
  accountName: "Jane Doe",
  accountNumber: "12345678",
  sortCode: "12-34-56",
  currency: "GBP" as const,
  invoiceDate: "2026-01-01",
  dueDate: "2026-01-10",
  description: "",
  itemName: "Widget",
  itemDescription: "A widget",
  quantity: 1,
  rate: 10,
  itemUOM: "unit",
};

describe("createInvoice", () => {
  it("throws AuthError on 401", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(401, {}));
    await expect(createInvoice(CREATE_INPUT)).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("throws an upstream-described error using errors[0].message", async () => {
    fetchMock.mockResolvedValueOnce(
      mockJson(422, { errors: [{ message: "Invalid sort code" }] }),
    );
    await expect(createInvoice(CREATE_INPUT)).rejects.toThrow(
      "Invalid sort code",
    );
  });

  it("falls back to the status text when the error body can't be parsed", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("bad json");
      },
    });
    await expect(createInvoice(CREATE_INPUT)).rejects.toThrow(
      "500 Internal Server Error",
    );
  });

  it("returns an invoiceNumber with the INV- prefix on success, and sends auth headers", async () => {
    fetchMock.mockResolvedValueOnce(mockJson(200, {}));
    const result = await createInvoice(CREATE_INPUT);
    expect(result.invoiceNumber).toMatch(/^INV-/);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/invoices");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer access-token");
    expect(init.headers["org-token"]).toBe("org-token");
    const body = JSON.parse(init.body);
    expect(body.invoices[0].invoiceNumber).toBe(result.invoiceNumber);
    expect(body.invoices[0].customer.contact.email).toBe(CREATE_INPUT.email);
  });
});

describe("getInvoice", () => {
  it("throws not implemented", async () => {
    await expect(getInvoice("1")).rejects.toThrow("not implemented");
  });
});
