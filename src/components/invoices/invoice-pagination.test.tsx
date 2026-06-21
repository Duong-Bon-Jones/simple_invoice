import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InvoicePagination } from "./invoice-pagination";
import { useInvoicesView } from "./invoices-view-context";

vi.mock("./invoices-view-context", () => ({
  useInvoicesView: vi.fn(),
}));

const mockUseInvoicesView = vi.mocked(useInvoicesView);

function mockView(overrides: Partial<ReturnType<typeof useInvoicesView>> = {}) {
  const base = {
    filters: {} as never,
    pageSize: 10,
    invoices: [],
    paging: { pageNum: 1, pageSize: 10, total: 25 },
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

describe("InvoicePagination", () => {
  it("shows the page summary text with plural invoices", () => {
    mockView({ paging: { pageNum: 1, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);
    expect(screen.getByText(/Page 1 of 3 · 25 invoices/)).toBeInTheDocument();
  });

  it("uses singular 'invoice' when total is 1", () => {
    mockView({ paging: { pageNum: 1, pageSize: 10, total: 1 } });
    render(<InvoicePagination />);
    expect(screen.getByText(/1 invoice$/)).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    mockView({ paging: { pageNum: 1, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });

  it("disables Next on the last page", () => {
    mockView({ paging: { pageNum: 3, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("disables both buttons while fetching", () => {
    mockView({ paging: { pageNum: 2, pageSize: 10, total: 25 }, isFetching: true });
    render(<InvoicePagination />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls setPage(pageNum - 1) when Previous is clicked", async () => {
    const view = mockView({ paging: { pageNum: 2, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);
    await userEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(view.setPage).toHaveBeenCalledWith(1);
  });

  it("calls setPage(pageNum + 1) when Next is clicked", async () => {
    const view = mockView({ paging: { pageNum: 2, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(view.setPage).toHaveBeenCalledWith(3);
  });

  it("calls setPageSize when a new page size is selected", async () => {
    const view = mockView({ paging: { pageNum: 1, pageSize: 10, total: 25 } });
    render(<InvoicePagination />);

    await userEvent.click(screen.getByRole("combobox", { name: /page size/i }));
    await userEvent.click(await screen.findByRole("option", { name: "20 / page" }));

    expect(view.setPageSize).toHaveBeenCalledWith(20);
  });
});
