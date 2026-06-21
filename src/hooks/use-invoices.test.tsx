import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInvoices } from "@/hooks/use-invoices";
import { SessionExpiredError } from "@/lib/client-errors";
import type { InvoiceQueryInput } from "@/lib/schemas";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

const QUERY: InvoiceQueryInput = {
  sortBy: "CREATED_DATE",
  ordering: "DESCENDING",
  pageNum: 1,
  pageSize: 10,
  keyword: "acme",
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useInvoices", () => {
  it("requests the api route with the expected search params", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ success: true, data: { invoices: [], paging: {} } }),
    });

    const { result } = renderHook(() => useInvoices(QUERY), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/invoices?");
    expect(url).toContain("keyword=acme");
    expect(url).toContain("sortBy=CREATED_DATE");
  });

  it("throws SessionExpiredError on a 401 and does not retry", async () => {
    fetchMock.mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useInvoices(QUERY), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(SessionExpiredError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws an Error when the response body reports failure", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ success: false }),
    });

    const { result } = renderHook(() => useInvoices(QUERY), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Couldn't load invoices");
  });

  it("returns the data payload on success", async () => {
    const data = {
      invoices: [{ invoiceId: "1" }],
      paging: { pageNum: 1, pageSize: 10, total: 1 },
    };
    fetchMock.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ success: true, data }),
    });

    const { result } = renderHook(() => useInvoices(QUERY), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(data);
  });
});
