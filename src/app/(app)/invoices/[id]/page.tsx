import { notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/invoices/invoice-detail";
import { SessionExpiredDialog } from "@/components/session-expired-dialog";
import { AuthError, NotFoundError, getInvoice } from "@/lib/upstream";

function safeBackHref(from: string | string[] | undefined): string {
  const value = Array.isArray(from) ? from[0] : from;
  // Only allow same-app paths under /invoices — never an absolute/external
  // URL, to avoid an open redirect via a crafted `from` query param.
  if (value && value.startsWith("/invoices") && !value.startsWith("//")) {
    return value;
  }
  return "/invoices";
}

export default async function InvoiceDetailPage({
  params,
  searchParams,
}: PageProps<"/invoices/[id]">) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = safeBackHref(from);

  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch (error) {
    if (error instanceof AuthError) return <SessionExpiredDialog />;
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return <InvoiceDetail invoice={invoice} backHref={backHref} />;
}
