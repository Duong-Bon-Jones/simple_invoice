import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SessionExpiredError } from "@/lib/client-errors";
import type { Invoice, InvoiceQueryInput } from "@/lib/schemas";

type InvoicesResult = {
  invoices: Invoice[];
  paging: { pageNum: number; pageSize: number; total: number };
};

function toSearchParams(query: InvoiceQueryInput): URLSearchParams {
  const params = new URLSearchParams({
    sortBy: query.sortBy,
    ordering: query.ordering,
    pageNum: String(query.pageNum),
    pageSize: String(query.pageSize),
  });
  for (const key of ["keyword", "status", "fromDate", "toDate"] as const) {
    if (query[key]) params.set(key, query[key]!);
  }
  return params;
}

async function fetchInvoices(
  query: InvoiceQueryInput,
): Promise<InvoicesResult> {
  const res = await fetch(`/api/invoices?${toSearchParams(query)}`);
  if (res.status === 401) throw new SessionExpiredError();
  if (!res.ok) throw new Error("Couldn't load invoices");

  const body = (await res.json()) as {
    success: boolean;
    data?: InvoicesResult;
  };
  if (!body.success || !body.data) throw new Error("Couldn't load invoices");
  return body.data;
}

export function useInvoices(query: InvoiceQueryInput) {
  return useQuery({
    queryKey: ["invoices", query],
    queryFn: () => fetchInvoices(query),
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      error instanceof SessionExpiredError ? false : failureCount < 3,
  });
}
