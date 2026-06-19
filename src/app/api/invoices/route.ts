import { NextResponse } from "next/server";
import { z } from "zod";
import { InvoiceCreateSchema } from "@/lib/schemas";
import { hasSession } from "@/lib/session";
import { createInvoice } from "@/lib/upstream";

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
