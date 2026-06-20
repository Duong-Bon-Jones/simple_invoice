"use client";

import { createContext, useContext, useState, useTransition } from "react";
import type { ReactNode, TransitionStartFunction } from "react";

export type InvoicePagingInfo = {
  pageNum: number;
  pageSize: number;
  total: number;
};

type InvoiceFilterTransition = {
  isPending: boolean;
  startNavigation: TransitionStartFunction;
  pagingInfo: InvoicePagingInfo;
  setPagingInfo: (info: InvoicePagingInfo) => void;
};

const InvoiceFilterTransitionContext =
  createContext<InvoiceFilterTransition | null>(null);

export function InvoiceFilterTransitionProvider({
  children,
  initialPagingInfo,
}: {
  children: ReactNode;
  initialPagingInfo: InvoicePagingInfo;
}) {
  const [isPending, startNavigation] = useTransition();
  const [pagingInfo, setPagingInfo] = useState(initialPagingInfo);

  return (
    <InvoiceFilterTransitionContext.Provider
      value={{ isPending, startNavigation, pagingInfo, setPagingInfo }}
    >
      {children}
    </InvoiceFilterTransitionContext.Provider>
  );
}

export function useInvoiceFilterTransition(): InvoiceFilterTransition {
  const context = useContext(InvoiceFilterTransitionContext);
  if (!context) {
    throw new Error(
      "useInvoiceFilterTransition must be used within an InvoiceFilterTransitionProvider",
    );
  }
  return context;
}
