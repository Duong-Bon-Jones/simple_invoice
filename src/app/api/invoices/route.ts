import { NextResponse } from "next/server";
import { z } from "zod";
import { InvoiceCreateSchema, InvoiceQuerySchema } from "@/lib/schemas";
import { hasSession } from "@/lib/session";
import { createInvoice, listInvoices } from "@/lib/upstream";

export async function GET(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const parsed = InvoiceQuerySchema.safeParse({
    keyword: searchParams.get("keyword") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    fromDate: searchParams.get("fromDate") ?? undefined,
    toDate: searchParams.get("toDate") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    ordering: searchParams.get("ordering") ?? undefined,
    pageNum: searchParams.get("pageNum") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const data = await listInvoices(parsed.data);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Not implemented" },
      { status: 501 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = InvoiceCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const data = await createInvoice(parsed.data);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Not implemented" },
      { status: 501 },
    );
  }
}
