export default async function InvoiceDetailPage({
  params,
}: PageProps<"/invoices/[id]">) {
  const { id } = await params;
  // TODO: fetch /api/invoices/[id] and render invoice detail
  return <h1>Invoice {id}</h1>;
}
