"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useInvoices } from "@/hooks/use-invoices";
import { InvoiceQuerySchema } from "@/lib/schemas";
import type { Invoice, InvoiceQueryInput } from "@/lib/schemas";

const PAGE_SIZE_STORAGE_KEY = "invoices:pageSize";

type Filters = Omit<InvoiceQueryInput, "pageSize">;

const DEFAULT_FILTERS: Filters = (() => {
  const { pageSize, ...rest } = InvoiceQuerySchema.parse({});
  void pageSize;
  return rest;
})();

function parseFiltersFromSearch(search: string): Filters {
  const parsed = InvoiceQuerySchema.safeParse(
    Object.fromEntries(new URLSearchParams(search)),
  );
  if (!parsed.success) return DEFAULT_FILTERS;
  const { pageSize, ...rest } = parsed.data;
  void pageSize;
  return rest;
}

function buildSearch(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (filters.status) params.set("status", filters.status);
  if (filters.fromDate) params.set("fromDate", filters.fromDate);
  if (filters.toDate) params.set("toDate", filters.toDate);
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.ordering !== DEFAULT_FILTERS.ordering) params.set("ordering", filters.ordering);
  if (filters.pageNum !== DEFAULT_FILTERS.pageNum) {
    params.set("pageNum", String(filters.pageNum));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

type Paging = { pageNum: number; pageSize: number; total: number };

type InvoicesViewState = {
  filters: Filters;
  pageSize: number;
  invoices: Invoice[] | undefined;
  paging: Paging;
  isFetching: boolean;
  error: Error | null;
  setFilter: (updates: Partial<Omit<Filters, "pageNum">>) => void;
  setPage: (pageNum: number) => void;
  setPageSize: (size: number) => void;
  clearFilters: () => void;
};

const InvoicesViewContext = createContext<InvoicesViewState | null>(null);

export function useInvoicesView(): InvoicesViewState {
  const context = useContext(InvoicesViewContext);
  if (!context) {
    throw new Error("useInvoicesView must be used within an InvoicesViewProvider");
  }
  return context;
}

export function InvoicesViewProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageSizeRaw, setPageSizeRaw] = useLocalStorage(PAGE_SIZE_STORAGE_KEY, "10");
  const pageSize = Number(pageSizeRaw);

  // URL is the single source of truth for filters/page — no mirrored React state.
  const filters = useMemo(
    () => parseFiltersFromSearch(searchParams.toString()),
    [searchParams],
  );

  const navigate = useCallback(
    (next: Filters) => {
      router.replace(`${pathname}${buildSearch(next)}`, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    (updates: Partial<Omit<Filters, "pageNum">>) => {
      navigate({ ...filters, ...updates, pageNum: 1 });
    },
    [filters, navigate],
  );

  const setPage = useCallback(
    (pageNum: number) => {
      navigate({ ...filters, pageNum });
    },
    [filters, navigate],
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeRaw(String(size));
      navigate({ ...filters, pageNum: 1 });
    },
    [filters, navigate, setPageSizeRaw],
  );

  const clearFilters = useCallback(() => {
    navigate(DEFAULT_FILTERS);
  }, [navigate]);

  const query = useMemo<InvoiceQueryInput>(
    () => ({ ...filters, pageSize }),
    [filters, pageSize],
  );
  const { data, isFetching, error } = useInvoices(query);
  const paging: Paging = data?.paging ?? {
    pageNum: filters.pageNum,
    pageSize,
    total: 0,
  };

  const value: InvoicesViewState = {
    filters,
    pageSize,
    invoices: data?.invoices,
    paging,
    isFetching,
    error,
    setFilter,
    setPage,
    setPageSize,
    clearFilters,
  };

  return (
    <InvoicesViewContext.Provider value={value}>{children}</InvoicesViewContext.Provider>
  );
}
