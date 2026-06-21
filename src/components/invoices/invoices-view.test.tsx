import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvoicesView } from "./invoices-view";
import { useInvoicesView } from "./invoices-view-context";
import { SessionExpiredError } from "@/lib/client-errors";

vi.mock("./invoices-view-context", () => ({
  InvoicesViewProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useInvoicesView: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockUseInvoicesView = vi.mocked(useInvoicesView);

function mockView(overrides: Partial<ReturnType<typeof useInvoicesView>> = {}) {
  const base = {
    filters: {
      sortBy: "CREATED_DATE",
      ordering: "DESCENDING",
      pageNum: 1,
    } as never,
    pageSize: 10,
    invoices: undefined,
    paging: { pageNum: 1, pageSize: 10, total: 0 },
    isFetching: false,
    error: null,
    setFilter: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    clearFilters: vi.fn(),
    refetch: vi.fn(),
  };
  mockUseInvoicesView.mockReturnValue({ ...base, ...overrides });
}

describe("InvoicesView", () => {
  it("shows the session-expired dialog when the error is a SessionExpiredError", () => {
    mockView({ error: new SessionExpiredError() });
    render(<InvoicesView />);

    expect(screen.getByText("Session expired")).toBeInTheDocument();
  });

  it("shows a generic error message for other errors", () => {
    mockView({ error: new Error("boom") });
    render(<InvoicesView />);

    expect(
      screen.getByText("Couldn't load invoices. Try again in a moment."),
    ).toBeInTheDocument();
  });

  it("shows a loading skeleton while fetching", () => {
    mockView({ invoices: undefined, isFetching: true });
    render(<InvoicesView />);

    expect(screen.getByText("Invoice #")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("shows an empty state when there are no invoices", () => {
    mockView({ invoices: [] });
    render(<InvoicesView />);

    expect(screen.getByText("No invoices found")).toBeInTheDocument();
  });

  it("renders the invoice table when invoices are present", () => {
    mockView({
      invoices: [
        {
          invoiceNumber: "INV-0001",
          customer: { name: "Jane Doe" },
        },
      ] as never,
    });
    render(<InvoicesView />);

    expect(screen.getByText("INV-0001")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });
});
