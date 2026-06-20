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
import type { Invoice } from "@/lib/schemas";

function activeStatusLabel(status: Invoice["status"]): string | undefined {
  return status?.find((s) => s.value)?.key;
}

function formatAmount(amount: number | undefined, currency: string | undefined): string {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <Table containerClassName="min-h-0 flex-1 overflow-y-auto scroll-thin rounded-md border">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due date</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice, index) => (
          <TableRow key={invoice.invoiceId ?? invoice.invoiceNumber ?? index}>
            <TableCell className="font-mono text-sm">
              {invoice.invoiceId ? (
                <Link
                  href={`/invoices/${invoice.invoiceId}`}
                  className="text-brand hover:underline"
                >
                  {invoice.invoiceNumber ?? invoice.invoiceId}
                </Link>
              ) : (
                invoice.invoiceNumber ?? "—"
              )}
            </TableCell>
            <TableCell>{invoice.customer?.name ?? "—"}</TableCell>
            <TableCell className="text-right font-mono">
              {formatAmount(invoice.totalAmount, invoice.currency)}
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
