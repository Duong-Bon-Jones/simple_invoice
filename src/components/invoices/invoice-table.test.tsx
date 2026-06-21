import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvoiceTable } from "./invoice-table";
import type { Invoice } from "@/lib/schemas";

describe("InvoiceTable", () => {
  it("renders the invoice number as a link when invoiceId is present", () => {
    const invoices: Invoice[] = [
      {
        invoiceId: "abc",
        invoiceNumber: "INV-001",
        totalAmount: 100,
        currency: "USD",
        dueDate: "2024-01-15",
        createdAt: "2024-01-01",
        customer: { name: "Acme" },
        status: [{ key: "Paid", value: true }],
        description: "Consulting services",
      },
    ];
    render(<InvoiceTable invoices={invoices} />);
    const link = screen.getByRole("link", { name: "INV-001" });
    expect(link).toHaveAttribute("href", "/invoices/abc");
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Consulting services")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("renders plain text and dashes for missing optional fields", () => {
    const invoices: Invoice[] = [{ invoiceNumber: "INV-002" }];
    render(<InvoiceTable invoices={invoices} />);
    expect(screen.getByText("INV-002")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });

  it("falls back to USD when currency is missing and dash when invoiceNumber is missing", () => {
    const invoices: Invoice[] = [{ totalAmount: 50 }];
    render(<InvoiceTable invoices={invoices} />);
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("renders an unparsable date string as-is", () => {
    const invoices: Invoice[] = [
      { invoiceNumber: "INV-003", dueDate: "not-a-date" },
    ];
    render(<InvoiceTable invoices={invoices} />);
    expect(screen.getByText("not-a-date")).toBeInTheDocument();
  });
});
