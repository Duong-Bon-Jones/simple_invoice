"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoicesView } from "./invoices-view-context";

const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"];

export function InvoicePagination() {
  const { paging, isFetching, setPage, setPageSize } = useInvoicesView();
  const { pageNum, pageSize, total } = paging;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex shrink-0 items-center justify-between border-t bg-background px-1 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-27.5" aria-label="Page size">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          Page {pageNum} of {totalPages} · {total} invoice
          {total === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNum <= 1 || isFetching}
          onClick={() => setPage(pageNum - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNum >= totalPages || isFetching}
          onClick={() => setPage(pageNum + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
