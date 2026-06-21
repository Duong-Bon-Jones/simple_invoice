import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionExpiredDialog } from "./session-expired-dialog";

const routerMock = { push: vi.fn(), refresh: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

beforeEach(() => {
  routerMock.push.mockReset();
  routerMock.refresh.mockReset();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
  );
});

describe("SessionExpiredDialog", () => {
  it("renders open with the session-expired message", () => {
    render(<SessionExpiredDialog />);

    expect(screen.getByText("Session expired")).toBeInTheDocument();
    expect(
      screen.getByText("Your session has expired. Please log in again."),
    ).toBeInTheDocument();
  });

  it("logs out and redirects to /login when Log in is clicked", async () => {
    render(<SessionExpiredDialog />);

    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }),
    );
    expect(routerMock.push).toHaveBeenCalledWith("/login");
    expect(routerMock.refresh).toHaveBeenCalled();
  });
});
