"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
  const [pageSizeRaw, setPageSizeRaw] = useLocalStorage(PAGE_SIZE_STORAGE_KEY, "10");
  const pageSize = Number(pageSizeRaw);
  const [filters, setFilters] = useState<Filters>(() =>
    parseFiltersFromSearch(typeof window === "undefined" ? "" : window.location.search),
  );

  const syncUrl = useCallback(
    (next: Filters) => {
      window.history.replaceState(null, "", `${pathname}${buildSearch(next)}`);
    },
    [pathname],
  );

  const setFilter = useCallback(
    (updates: Partial<Omit<Filters, "pageNum">>) => {
      setFilters((prev) => {
        const next = { ...prev, ...updates, pageNum: 1 };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const setPage = useCallback(
    (pageNum: number) => {
      setFilters((prev) => {
        const next = { ...prev, pageNum };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeRaw(String(size));
      setFilters((prev) => {
        const next = { ...prev, pageNum: 1 };
        syncUrl(next);
        return next;
      });
    },
    [setPageSizeRaw, syncUrl],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    syncUrl(DEFAULT_FILTERS);
  }, [syncUrl]);

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
