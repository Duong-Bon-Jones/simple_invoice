import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "@/lib/schemas";

// Searches for the flag set to true rather than reading a single field:
// status is an array of independent flags upstream (see schemas.ts), not a
// single enum value.
function activeStatusLabel(status: Invoice["status"]): string | undefined {
  return status?.find((s) => s.value)?.key;
}

export function InvoiceTable({
  invoices,
  currentListUrl,
}: {
  invoices: Invoice[];
  currentListUrl?: string;
}) {
  // Encoded as a URL string, not client state: it has to survive a full
  // navigation/reload to the detail page, which client-only state would not.
  const fromQuery = currentListUrl
    ? `?from=${encodeURIComponent(currentListUrl)}`
    : "";

  return (
    <Table containerClassName="min-h-0 flex-1 overflow-y-auto scroll-thin rounded-md border">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead className="max-w-[140px]">Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={invoice.invoiceId ?? invoice.invoiceNumber ?? index}>
            <TableCell className="max-w-[140px] truncate font-mono text-sm">
              {invoice.invoiceId ? (
                <Link
                  href={`/invoices/${invoice.invoiceId}${fromQuery}`}
                  className="text-brand hover:underline"
                >
                  {invoice.invoiceNumber ?? invoice.invoiceId}
                </Link>
              ) : (
                (invoice.invoiceNumber ?? "—")
              )}
            </TableCell>
            <TableCell>{invoice.customer?.name ?? "—"}</TableCell>
            <TableCell className="max-w-[200px] truncate text-muted-foreground">
              {invoice.description || "—"}
            </TableCell>
            <TableCell className="text-right font-mono">
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </TableCell>
            <TableCell>
              <InvoiceStatusBadge status={activeStatusLabel(invoice.status)} />
            </TableCell>
            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
