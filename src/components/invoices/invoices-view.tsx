"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SessionExpiredDialog } from "@/components/session-expired-dialog";
import { SessionExpiredError } from "@/lib/client-errors";
import { InvoicesViewProvider, useInvoicesView } from "./invoices-view-context";
import { InvoicesToolbar } from "./invoices-toolbar";
import { InvoiceTable } from "./invoice-table";
import { InvoiceTableSkeleton } from "./invoice-table-skeleton";
import { InvoicePagination } from "./invoice-pagination";

function InvoicesContent() {
  const { invoices, error, isFetching } = useInvoicesView();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const currentListUrl = search ? `${pathname}?${search}` : pathname;

  if (error instanceof SessionExpiredError) return <SessionExpiredDialog />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Couldn&apos;t load invoices. Try again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  if (!invoices || isFetching) return <InvoiceTableSkeleton />;

  if (invoices.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium text-foreground">No invoices found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <InvoiceTable invoices={invoices} currentListUrl={currentListUrl} />
    </div>
  );
}

export function InvoicesView() {
  return (
    <InvoicesViewProvider>
      <InvoicesToolbar />
      <InvoicesContent />
      <InvoicePagination />
    </InvoicesViewProvider>
  );
}
