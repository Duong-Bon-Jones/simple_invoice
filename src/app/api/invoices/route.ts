import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasSession } from "@/lib/session";
import { AuthError, listInvoices } from "@/lib/upstream";
import { InvoiceQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = InvoiceQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid query" }, { status: 400 });
  }

  try {
    const { invoices, paging } = await listInvoices(parsed.data);
    return NextResponse.json({ success: true, data: { invoices, paging } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to load invoices", error);
    return NextResponse.json(
      { success: false, error: "Couldn't load invoices" },
      { status: 502 },
    );
  }
}
