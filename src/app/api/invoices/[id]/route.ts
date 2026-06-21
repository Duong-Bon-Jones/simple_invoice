import { NextResponse } from "next/server";
import { hasSession } from "@/lib/session";
import { getInvoice } from "@/lib/upstream";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/invoices/[id]">,
) {
  if (!(await hasSession())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;

  try {
    const data = await getInvoice(id);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Not implemented" },
      { status: 501 },
    );
  }
}
