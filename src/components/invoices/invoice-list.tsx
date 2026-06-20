import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, listInvoices } from "@/lib/upstream";
import type { InvoiceQueryInput } from "@/lib/schemas";
import { SessionExpiredDialog } from "@/components/session-expired-dialog";
import { InvoiceTable } from "./invoice-table";
import { InvoicePagination } from "./invoice-pagination";

export async function InvoiceList({ query }: { query: InvoiceQueryInput }) {
  let result;
  try {
    result = await listInvoices(query);
  } catch (error) {
    if (error instanceof AuthError) return <SessionExpiredDialog />;

    console.error("Failed to load invoices", error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Couldn&apos;t load invoices. Try again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  if (result.invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium text-foreground">No invoices found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <InvoiceTable invoices={result.invoices} />
      <InvoicePagination
        pageNum={result.paging.pageNum}
        pageSize={result.paging.pageSize}
        total={result.paging.total}
      />
    </div>
  );
}
