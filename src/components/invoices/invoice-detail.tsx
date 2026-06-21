import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { formatAddress, formatCurrency, formatDate } from "@/lib/format";
import type { InvoiceDetail as InvoiceDetailData } from "@/lib/schemas";

// These document URLs come from the upstream API; without an allowlist, a
// crafted javascript:/unknown-scheme URL could execute or misbehave when
// rendered as a link.
const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

function safeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

function activeStatusLabel(
  status: InvoiceDetailData["status"],
): string | undefined {
  return status?.find((s) => s.value)?.key;
}

type ItemExtension = NonNullable<
  NonNullable<InvoiceDetailData["items"]>[number]["extensions"]
>[number];

function extensionLabel(extension: ItemExtension): string {
  // Extensions model both surcharges and discounts under one shape, so
  // addDeduct decides the sign of an otherwise-positive value.
  const sign = extension.addDeduct === "DEDUCT" ? "-" : "+";
  const value =
    extension.type === "PERCENTAGE"
      ? `${extension.value}%`
      : formatCurrency(extension.value, undefined);
  return `${extension.name ?? "Adjustment"} ${sign}${value}`;
}

function customerName(customer: InvoiceDetailData["customer"]): string {
  return customer?.name || "—";
}

export function InvoiceDetail({
  invoice,
  backHref = "/invoices",
}: {
  invoice: InvoiceDetailData;
  backHref?: string;
}) {
  const currency = invoice.currency;
  const status = activeStatusLabel(invoice.status);
  const billingAddress = formatAddress(invoice.customer?.addresses?.[0]);
  const merchantAddress = formatAddress(invoice.merchant?.addresses?.[0]);
  const bankAccount = invoice.bankAccount;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="flex w-fit items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to invoices
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                {invoice.type === "TAX_INVOICE" ? "Tax Invoice" : "Invoice"}
              </span>
              <span className="font-mono text-lg font-medium">
                {invoice.invoiceNumber ?? "—"}
              </span>
              {invoice.referenceNo && (
                <span className="font-mono text-xs text-muted-foreground">
                  Ref: {invoice.referenceNo}
                </span>
              )}
            </div>
            <InvoiceStatusBadge status={status} />
          </div>

          {invoice.description && (
            <p className="text-sm text-muted-foreground">
              {invoice.description}
            </p>
          )}

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Issued</span>
              <span className="font-mono">
                {formatDate(invoice.invoiceDate)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground">Due</span>
              <span className="font-mono">{formatDate(invoice.dueDate)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Balance due</span>
            <span className="font-mono text-3xl font-semibold text-brand">
              {formatCurrency(invoice.balanceAmount, currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Billed to</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span>{customerName(invoice.customer)}</span>
            <span className="text-muted-foreground">
              {invoice.customer?.contact?.email ?? "—"}
            </span>
            <span className="text-muted-foreground">
              {invoice.customer?.contact?.mobileNumber ?? "—"}
            </span>
            {billingAddress && (
              <span className="text-muted-foreground">{billingAddress}</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>From / Pay to</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <span>{invoice.merchant?.name ?? "—"}</span>
            {merchantAddress && (
              <span className="text-muted-foreground">{merchantAddress}</span>
            )}
            {bankAccount && (
              <span className="font-mono text-muted-foreground">
                {[
                  bankAccount.accountName,
                  bankAccount.sortCode,
                  bankAccount.accountNumber,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="pr-0 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(invoice.items ?? []).map((item, index) => (
                <TableRow key={item.itemReference ?? index}>
                  <TableCell className="pl-0">
                    <div className="flex flex-col gap-1">
                      <span>{item.itemName ?? "—"}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                      {item.extensions && item.extensions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.extensions.map((extension, extIndex) => (
                            <span
                              key={extension.id ?? extIndex}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground"
                            >
                              {extensionLabel(extension)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.quantity ?? "—"}
                    {item.itemUOM ? ` ${item.itemUOM}` : ""}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.rate, currency)}
                  </TableCell>
                  <TableCell className="pr-0 text-right font-mono">
                    {formatCurrency(item.netAmount ?? item.amount, currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="hidden sm:block" aria-hidden="true" />
        <Card>
          <CardContent className="flex flex-col gap-1.5 px-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">
                {formatCurrency(invoice.invoiceSubTotal, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-mono">
                {formatCurrency(invoice.totalTax, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-mono">
                {formatCurrency(invoice.totalDiscount, currency)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono">
                {formatCurrency(invoice.totalAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-mono">
                {formatCurrency(invoice.totalPaid, currency)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-medium">
              <span>Balance due</span>
              <span className="font-mono text-brand">
                {formatCurrency(invoice.balanceAmount, currency)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {invoice.documents && invoice.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            {invoice.documents.map((document, index) => {
              const url = safeUrl(document.documentUrl);
              const label =
                document.documentName ?? document.documentUrl ?? "—";
              return url ? (
                <a
                  key={document.documentId ?? index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {label}
                </a>
              ) : (
                <span key={document.documentId ?? index}>{label}</span>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
