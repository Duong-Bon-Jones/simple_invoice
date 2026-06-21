"use server";

import { InvoiceCreateSchema } from "@/lib/schemas";
import { createInvoice } from "@/lib/upstream";
import { withSessionGuard, type ActionResult } from "@/lib/auth-action";

export async function createInvoiceAction(
  input: unknown,
): Promise<ActionResult<{ invoiceNumber: string }>> {
  const parsed = InvoiceCreateSchema.safeParse(input);
  if (!parsed.success) {
    // Generic message, not Zod's per-field detail: the form already
    // validates client-side, so reaching here is a last-resort guard rather
    // than the user's primary feedback path.
    return { ok: false, error: "Please check the form fields." };
  }
  return withSessionGuard(() => createInvoice(parsed.data));
}
