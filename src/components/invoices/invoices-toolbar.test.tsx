import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InvoicesToolbar } from "./invoices-toolbar";
import { useInvoicesView } from "./invoices-view-context";

vi.mock("./invoices-view-context", () => ({
  useInvoicesView: vi.fn(),
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
    invoices: [],
    paging: { pageNum: 1, pageSize: 10, total: 0 },
    isFetching: false,
    error: null,
    setFilter: vi.fn(),
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    clearFilters: vi.fn(),
    refetch: vi.fn(),
  };
  const value = { ...base, ...overrides };
  mockUseInvoicesView.mockReturnValue(value);
  return value;
}

describe("InvoicesToolbar", () => {
  it("debounces keyword input and calls setFilter after typing", async () => {
    const view = mockView();
    render(<InvoicesToolbar />);

    const search = screen.getByLabelText("Search invoices");
    await userEvent.type(search, "acme");

    await waitFor(
      () => expect(view.setFilter).toHaveBeenCalledWith({ keyword: "acme" }),
      { timeout: 1000 },
    );
  });

  it("calls setFilter with the selected status", async () => {
    const view = mockView();
    render(<InvoicesToolbar />);

    await userEvent.click(screen.getByLabelText("Filter by status"));
    await userEvent.click(await screen.findByRole("option", { name: "Paid" }));

    expect(view.setFilter).toHaveBeenCalledWith({ status: "Paid" });
  });

  it("calls setFilter with sortBy/ordering when the sort changes", async () => {
    const view = mockView();
    render(<InvoicesToolbar />);

    await userEvent.click(screen.getByLabelText("Sort invoices"));
    await userEvent.click(
      await screen.findByRole("option", { name: "Due soonest" }),
    );

    expect(view.setFilter).toHaveBeenCalledWith({
      sortBy: "DUE_DATE",
      ordering: "ASCENDING",
    });
  });

  it("disables clear filters when there are no active filters", () => {
    mockView();
    render(<InvoicesToolbar />);
    expect(screen.getByLabelText("Clear filters")).toBeDisabled();
  });

  it("enables clear filters and resets keyword when a filter is active", async () => {
    const view = mockView({ filters: { sortBy: "CREATED_DATE", ordering: "DESCENDING", pageNum: 1, keyword: "acme" } as never });
    render(<InvoicesToolbar />);

    const clearButton = screen.getByLabelText("Clear filters");
    expect(clearButton).toBeEnabled();

    await userEvent.click(clearButton);
    expect(view.clearFilters).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByLabelText("Search invoices")).toHaveValue(""),
    );
  });

  it("disables refresh while fetching and calls refetch when clicked", async () => {
    const view = mockView({ isFetching: false });
    render(<InvoicesToolbar />);
    const refreshButton = screen.getByLabelText("Refresh invoices");
    await userEvent.click(refreshButton);
    expect(view.refetch).toHaveBeenCalled();
  });

  it("disables the refresh button while isFetching is true", () => {
    mockView({ isFetching: true });
    render(<InvoicesToolbar />);
    expect(screen.getByLabelText("Refresh invoices")).toBeDisabled();
  });
});
