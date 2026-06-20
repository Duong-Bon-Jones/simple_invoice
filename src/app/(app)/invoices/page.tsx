import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkStatusIcon } from "@/components/ui/link-status-icon";
import { PAGE_SIZE_COOKIE } from "@/components/invoices/page-size-cookie";
import { InvoiceFilterTransitionProvider } from "@/components/invoices/invoice-filter-transition";
import { InvoiceTableArea } from "@/components/invoices/invoice-table-area";
import { InvoicesToolbar } from "@/components/invoices/invoices-toolbar";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { InvoicePagination } from "@/components/invoices/invoice-pagination";
import { InvoiceTableSkeleton } from "@/components/invoices/invoice-table-skeleton";
import { InvoiceQuerySchema, PageSizeSchema } from "@/lib/schemas";

export default async function InvoicesPage({
  searchParams,
}: PageProps<"/invoices">) {
  const sp = await searchParams;
  const parsed = InvoiceQuerySchema.safeParse(sp);
  const base = parsed.success ? parsed.data : InvoiceQuerySchema.parse({});

  const cookieStore = await cookies();
  const pageSizeCookie = PageSizeSchema.safeParse(
    cookieStore.get(PAGE_SIZE_COOKIE)?.value,
  );
  const query = {
    ...base,
    pageSize: pageSizeCookie.success ? pageSizeCookie.data : base.pageSize,
  };

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

      <InvoiceFilterTransitionProvider
        initialPagingInfo={{
          pageNum: query.pageNum,
          pageSize: query.pageSize,
          total: 0,
        }}
      >
        <InvoicesToolbar />

        <InvoiceTableArea>
          <Suspense key={JSON.stringify(query)} fallback={<InvoiceTableSkeleton />}>
            <InvoiceList query={query} />
          </Suspense>
        </InvoiceTableArea>

        <InvoicePagination />
      </InvoiceFilterTransitionProvider>
    </div>
  );
}
