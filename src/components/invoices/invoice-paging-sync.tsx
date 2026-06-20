"use client";

import { useEffect } from "react";
import {
  useInvoiceFilterTransition,
  type InvoicePagingInfo,
} from "./invoice-filter-transition";

export function InvoicePagingSync({
  pageNum,
  pageSize,
  total,
}: InvoicePagingInfo) {
  const { setPagingInfo } = useInvoiceFilterTransition();

  useEffect(() => {
    setPagingInfo({ pageNum, pageSize, total });
  }, [pageNum, pageSize, total, setPagingInfo]);

  return null;
}
