"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateField } from "@/components/ui/date-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoicesView } from "./invoices-view-context";

const STATUS_OPTIONS = ["Due", "Paid", "Overdue", "Cancelled"];

const SORT_OPTIONS = [
  { value: "CREATED_DATE:DESCENDING", label: "Newest first" },
  { value: "CREATED_DATE:ASCENDING", label: "Oldest first" },
  { value: "DUE_DATE:ASCENDING", label: "Due soonest" },
  { value: "DUE_DATE:DESCENDING", label: "Due latest" },
  { value: "TOTAL_AMOUNT:DESCENDING", label: "Amount: high to low" },
  { value: "TOTAL_AMOUNT:ASCENDING", label: "Amount: low to high" },
];

const SEARCH_DEBOUNCE_MS = 350;

export function InvoicesToolbar() {
  const { filters, setFilter, clearFilters, refetch, isFetching } =
    useInvoicesView();
  const [keyword, setKeyword] = useState(filters.keyword ?? "");
  // Guards against handleClear's setKeyword("") re-triggering this debounce
  // effect and firing a redundant fetch right after clearFilters() already
  // navigated.
  const skipNextDebounce = useRef(false);

  useEffect(() => {
    if (skipNextDebounce.current) {
      skipNextDebounce.current = false;
      return;
    }
    const current = filters.keyword ?? "";
    if (keyword === current) return;
    const id = setTimeout(() => {
      setFilter({ keyword: keyword || undefined });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // setFilter/filters.keyword deliberately excluded: this effect is a
    // one-way sync from local `keyword` state to the URL, so including the
    // URL-derived value would create a feedback loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const status = filters.status ?? "all";
  const sortValue = `${filters.sortBy}:${filters.ordering}`;
  const fromDate = filters.fromDate ?? "";
  const toDate = filters.toDate ?? "";

  const hasFilters = keyword || status !== "all" || fromDate || toDate;

  function handleClear() {
    skipNextDebounce.current = true;
    setKeyword("");
    clearFilters();
  }

  return (
    <div className="flex shrink-0 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 xl:contents">
        <div className="flex items-center justify-between md:contents">
          <div className="relative w-[45%] md:w-auto md:flex-1 xl:max-w-xs">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoice number..."
              aria-label="Search invoices"
              className="pl-8 font-mono text-xs md:text-sm"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>

          <Select
            value={status}
            onValueChange={(value) =>
              setFilter({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger
              className="w-[45%] md:w-37.5 md:flex-none"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between md:contents">
          <DateField
            label="From date"
            value={fromDate}
            onChange={(value) => setFilter({ fromDate: value })}
            className="w-[45%] md:w-37.5 md:flex-none"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <DateField
            label="To date"
            value={toDate}
            onChange={(value) => setFilter({ toDate: value })}
            className="w-[45%] md:w-37.5 md:flex-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between xl:contents">
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const [nextSortBy, nextOrdering] = value.split(":");
            setFilter({
              sortBy: nextSortBy as typeof filters.sortBy,
              ordering: nextOrdering as typeof filters.ordering,
            });
          }}
        >
          <SelectTrigger
            className="w-[45%] md:w-47.5 md:flex-none"
            aria-label="Sort invoices"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!hasFilters}
            onClick={handleClear}
            aria-label="Clear filters"
          >
            <X className="size-4" />
            <span className="hidden xl:inline">Clear filters</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
            aria-label="Refresh invoices"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="hidden xl:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
