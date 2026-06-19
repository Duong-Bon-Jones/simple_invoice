import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicesToolbar } from "@/components/invoices/invoices-toolbar";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoiceTableSkeleton } from "@/components/invoices/invoice-table-skeleton";
import { InvoiceQuerySchema } from "@/lib/schemas";

export default async function InvoicesPage({
  searchParams,
}: PageProps<"/invoices">) {
  const sp = await searchParams;
  const parsed = InvoiceQuerySchema.safeParse(sp);
  const query = parsed.success ? parsed.data : InvoiceQuerySchema.parse({});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            New invoice
          </Link>
        </Button>
      </div>

      <InvoicesToolbar />

      <Suspense key={JSON.stringify(query)} fallback={<InvoiceTableSkeleton />}>
        <InvoiceList query={query} />
      </Suspense>
    </div>
  );
}
