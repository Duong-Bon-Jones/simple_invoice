import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoiceDetail } from "./invoice-detail";
import type { InvoiceDetail as InvoiceDetailData } from "@/lib/schemas";

const FULL_INVOICE: InvoiceDetailData = {
  invoiceId: "b64d6bfb-0bdb-4048-a5cb-ea8cb6f18821",
  invoiceNumber: "INV-001",
  invoiceReference: "ref-1",
  referenceNo: "REF-001",
  type: "TAX_INVOICE",
  currency: "GBP",
  invoiceDate: "2024-03-01",
  dueDate: "2024-03-15",
  status: [
    { key: "Due", value: true },
    { key: "Paid", value: false },
  ],
  description: "Q1 consulting work",
  customer: {
    name: "Jane Doe",
    contact: { email: "jane@example.com", mobileNumber: "+447000000000" },
    addresses: [{ premise: "1 High St", city: "London" }],
  },
  merchant: {
    name: "Acme Ltd",
    addresses: [{ premise: "2 Low St", city: "Bristol" }],
  },
  bankAccount: {
    accountName: "Acme Ltd",
    sortCode: "00-00-00",
    accountNumber: "12345678",
  },
  items: [
    {
      itemName: "Consulting",
      description: "Initial scoping",
      quantity: 2,
      rate: 100,
      itemUOM: "hrs",
      amount: 200,
      netAmount: 180,
      extensions: [
        {
          id: "ext-1",
          name: "VAT",
          type: "PERCENTAGE",
          value: 20,
          addDeduct: "ADD",
        },
      ],
    },
  ],
  documents: [
    {
      documentId: "doc-1",
      documentName: "Receipt",
      documentUrl: "http://url.com/receipt.pdf",
    },
    {
      documentId: "doc-2",
      documentName: "Malicious",
      documentUrl: "javascript:alert(1)",
    },
  ],
  invoiceSubTotal: 200,
  totalTax: 36,
  totalDiscount: 10,
  totalAmount: 226,
  totalPaid: 100,
  balanceAmount: 126,
};

describe("InvoiceDetail", () => {
  it("renders amounts, parties, line items, totals, and status", () => {
    render(<InvoiceDetail invoice={FULL_INVOICE} />);

    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(
      screen.getByText("Due", { selector: "span[data-slot=badge]" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Q1 consulting work")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Ltd")).toBeInTheDocument();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
    expect(screen.getByText("Initial scoping")).toBeInTheDocument();
    expect(screen.getAllByText("£126.00").length).toBeGreaterThan(0);
  });

  it("renders a safe document link but not the unsafe javascript: url", () => {
    render(<InvoiceDetail invoice={FULL_INVOICE} />);

    const link = screen.getByRole("link", { name: "Receipt" });
    expect(link).toHaveAttribute("href", "http://url.com/receipt.pdf");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    expect(screen.queryByRole("link", { name: "Malicious" })).toBeNull();
    expect(screen.getByText("Malicious")).toBeInTheDocument();
  });

  it("renders without crashing when optionals are missing", () => {
    const minimal: InvoiceDetailData = {
      invoiceNumber: "INV-002",
    };
    render(<InvoiceDetail invoice={minimal} />);

    expect(screen.getByText("INV-002")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("defaults the back link to /invoices", () => {
    render(<InvoiceDetail invoice={FULL_INVOICE} />);
    expect(
      screen.getByRole("link", { name: /back to invoices/i }),
    ).toHaveAttribute("href", "/invoices");
  });

  it("uses the given backHref to preserve list filters/page/sort", () => {
    render(
      <InvoiceDetail
        invoice={FULL_INVOICE}
        backHref="/invoices?pageNum=2&sortBy=DUE_DATE"
      />,
    );
    expect(
      screen.getByRole("link", { name: /back to invoices/i }),
    ).toHaveAttribute("href", "/invoices?pageNum=2&sortBy=DUE_DATE");
  });
});
