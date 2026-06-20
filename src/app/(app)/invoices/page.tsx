import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkStatusIcon } from "@/components/ui/link-status-icon";
import { InvoiceTableSkeleton } from "@/components/invoices/invoice-table-skeleton";
import { InvoicesView } from "@/components/invoices/invoices-view";

export default function InvoicesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <LinkStatusIcon icon={<Plus className="size-4" />} />
            New invoice
          </Link>
        </Button>
      </div>

      <Suspense fallback={<InvoiceTableSkeleton />}>
        <InvoicesView />
      </Suspense>
    </div>
  );
}
