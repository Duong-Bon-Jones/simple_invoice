import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InvoiceStatusBadge } from "./invoice-status-badge";

describe("InvoiceStatusBadge", () => {
  it.each([
    ["paid", "bg-brand/15"],
    ["overdue", "bg-destructive/10"],
    ["due", "bg-accent"],
    ["cancelled", "bg-muted"],
  ])("maps status %s to its style class", (status, expectedClass) => {
    render(<InvoiceStatusBadge status={status} />);
    expect(screen.getByText(status)).toHaveClass(expectedClass);
  });

  it("falls back to the muted class and 'Unknown' text for an undefined status", () => {
    render(<InvoiceStatusBadge />);
    const badge = screen.getByText("Unknown");
    expect(badge).toHaveClass("bg-muted", "text-muted-foreground");
  });

  it("falls back to the muted class for an unrecognized status", () => {
    render(<InvoiceStatusBadge status="weird" />);
    expect(screen.getByText("weird")).toHaveClass("bg-muted");
  });

  it("preserves the original casing in the label", () => {
    render(<InvoiceStatusBadge status="Paid" />);
    expect(screen.getByText("Paid")).toBeInTheDocument();
  });
});
