"use client";

import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceParams } from "./use-invoice-params";

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
const DATE_FORMAT = "yyyy-MM-dd";

function parseDate(value: string) {
  return value ? parse(value, DATE_FORMAT, new Date()) : undefined;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={label}
          className="w-37.5 justify-start font-normal"
        >
          <CalendarIcon className="size-4" />
          {selected ? (
            format(selected, "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, DATE_FORMAT) : undefined);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function InvoicesToolbar() {
  const { searchParams, setFilter, clearFilters } = useInvoiceParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");

  useEffect(() => {
    const current = searchParams.get("keyword") ?? "";
    if (keyword === current) return;
    const id = setTimeout(() => {
      setFilter({ keyword: keyword || undefined });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [keyword, searchParams, setFilter]);

  const status = searchParams.get("status") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "CREATED_DATE";
  const ordering = searchParams.get("ordering") ?? "DESCENDING";
  const sortValue = `${sortBy}:${ordering}`;
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";
  const pageSize = searchParams.get("pageSize") ?? "10";

  const hasFilters =
    keyword ||
    status !== "all" ||
    fromDate ||
    toDate ||
    sortValue !== "CREATED_DATE:DESCENDING" ||
    pageSize !== "10";

  function handleClear() {
    setKeyword("");
    clearFilters();
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoice number..."
          aria-label="Search invoices"
          className="pl-8 font-mono"
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
        <SelectTrigger className="w-37.5" aria-label="Filter by status">
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

      <Select
        value={sortValue}
        onValueChange={(value) => {
          const [nextSortBy, nextOrdering] = value.split(":");
          setFilter({ sortBy: nextSortBy, ordering: nextOrdering });
        }}
      >
        <SelectTrigger className="w-47.5" aria-label="Sort invoices">
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
        <DateField
          label="From date"
          value={fromDate}
          onChange={(value) => setFilter({ fromDate: value })}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <DateField
          label="To date"
          value={toDate}
          onChange={(value) => setFilter({ toDate: value })}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!hasFilters}
        onClick={handleClear}
      >
        <X className="size-4" />
        Clear filters
      </Button>
    </div>
  );
}
