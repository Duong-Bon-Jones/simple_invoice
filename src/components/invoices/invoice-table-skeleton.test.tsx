import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvoiceTableSkeleton } from "./invoice-table-skeleton";

describe("InvoiceTableSkeleton", () => {
  it("renders the table header and 10 placeholder rows", () => {
    render(<InvoiceTableSkeleton />);
    expect(screen.getByText("Invoice #")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });
});
