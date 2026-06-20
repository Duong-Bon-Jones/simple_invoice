import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { LinkStatusIcon } from "@/components/ui/link-status-icon";

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/invoices"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Back to invoices"
        >
          <LinkStatusIcon icon={<ArrowLeft className="size-4" />} />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">New invoice</h1>
      </div>
      <InvoiceForm />
    </div>
  );
}
