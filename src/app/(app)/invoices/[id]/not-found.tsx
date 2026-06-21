import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function InvoiceNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <h1 className="text-xl font-semibold">Invoice not found</h1>
      <p className="text-sm text-muted-foreground">
        This invoice doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link
        href="/invoices"
        className="flex items-center gap-1.5 font-mono text-sm text-brand hover:underline"
      >
        <ChevronLeft className="size-4" />
        Back to invoices
      </Link>
    </div>
  );
}
