"use client";

import { useTransition } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoiceParams } from "./use-invoice-params";

type Props = {
  pageNum: number;
  pageSize: number;
  total: number;
};

export function InvoicePagination({ pageNum, pageSize, total }: Props) {
  const { setPage } = useInvoiceParams();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function goTo(page: number) {
    startTransition(() => setPage(page));
  }

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Page {pageNum} of {totalPages} · {total} invoice{total === 1 ? "" : "s"}
      </p>
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
