"use client";

import type { ReactNode } from "react";
import { InvoiceTableSkeleton } from "./invoice-table-skeleton";
import { useInvoiceFilterTransition } from "./invoice-filter-transition";

export function InvoiceTableArea({ children }: { children: ReactNode }) {
  const { isPending } = useInvoiceFilterTransition();
  return isPending ? <InvoiceTableSkeleton /> : <>{children}</>;
}
