"use client";

import { useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceParams } from "./use-invoice-params";

const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"];

type Props = {
  pageNum: number;
  pageSize: number;
  total: number;
};

export function InvoicePagination({ pageNum, pageSize, total }: Props) {
  const { setFilter, setPage } = useInvoiceParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function goTo(page: number) {
    startTransition(() => setPage(page));
  }

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            startTransition(() => setFilter({ pageSize: value }))
          }
        >
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
        {isPending && (
          <Loader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNum <= 1 || isPending}
          onClick={() => goTo(pageNum - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pageNum >= totalPages || isPending}
          onClick={() => goTo(pageNum + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
