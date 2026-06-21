import { act, render } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoicesViewProvider, useInvoicesView } from "./invoices-view-context";
import { useInvoices } from "@/hooks/use-invoices";

const routerMock = { replace: vi.fn(), refresh: vi.fn() };
let searchParamsString = "";

vi.mock("next/navigation", () => ({
  usePathname: () => "/invoices",
  useRouter: () => routerMock,
  useSearchParams: () => new URLSearchParams(searchParamsString),
}));

vi.mock("@/hooks/use-invoices", () => ({
  useInvoices: vi.fn(() => ({
    data: undefined,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

let latestView: ReturnType<typeof useInvoicesView>;

function Probe() {
  const view = useInvoicesView();
  useEffect(() => {
    latestView = view;
  });
  return null;
}

function renderProvider() {
  render(
    <InvoicesViewProvider>
      <Probe />
    </InvoicesViewProvider>,
  );
}

beforeEach(() => {
  routerMock.replace.mockReset();
  routerMock.refresh.mockReset();
  vi.mocked(useInvoices).mockReturnValue({
    data: undefined,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useInvoices>);
  window.localStorage.clear();
  searchParamsString = "";
});

describe("InvoicesViewProvider / useInvoicesView", () => {
  it("falls back to default filters when the URL has invalid values", () => {
    searchParamsString = "sortBy=NOT_A_REAL_FIELD&pageNum=-5";
    renderProvider();
    expect(latestView.filters.sortBy).toBe("CREATED_DATE");
    expect(latestView.filters.ordering).toBe("DESCENDING");
    expect(latestView.filters.pageNum).toBe(1);
  });

  it("setFilter resets pageNum to 1 and navigates via refresh then replace", () => {
    searchParamsString = "pageNum=3&keyword=old";
    renderProvider();

    act(() => {
      latestView.setFilter({ keyword: "abc" });
    });

    expect(routerMock.refresh).toHaveBeenCalled();
    const [url, opts] = routerMock.replace.mock.calls[0];
    expect(url).toContain("keyword=abc");
    expect(url).not.toContain("pageNum");
    expect(opts).toEqual({ scroll: false });
  });

  it("clearFilters keeps sortBy/ordering but drops other filters", () => {
    searchParamsString = "sortBy=DUE_DATE&ordering=ASCENDING&keyword=foo";
    renderProvider();

    act(() => {
      latestView.clearFilters();
    });

    const [url] = routerMock.replace.mock.calls[0];
    expect(url).toContain("sortBy=DUE_DATE");
    expect(url).toContain("ordering=ASCENDING");
    expect(url).not.toContain("keyword");
  });

  it("setPageSize writes to localStorage and navigates", () => {
    renderProvider();

    act(() => {
      latestView.setPageSize(50);
    });

    expect(window.localStorage.getItem("invoices:pageSize")).toBe("50");
    expect(routerMock.replace).toHaveBeenCalled();
  });

  it("buildSearch omits default values and includes non-default ones", () => {
    searchParamsString = "";
    renderProvider();

    act(() => {
      latestView.setFilter({ status: "PAID" });
    });

    const [url] = routerMock.replace.mock.calls[0];
    expect(url).toContain("status=PAID");
    expect(url).not.toContain("sortBy");
    expect(url).not.toContain("ordering");
  });
});
