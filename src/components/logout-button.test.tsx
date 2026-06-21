import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "./logout-button";

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

describe("LogoutButton", () => {
  it("opens a confirmation dialog when clicked", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(screen.getByText("Log out?")).toBeInTheDocument();
  });

  it("calls the logout endpoint and redirects to /login on confirm", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    const logOutButtons = screen.getAllByRole("button", { name: /log out/i });
    await userEvent.click(logOutButtons[logOutButtons.length - 1]);

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" }),
    );
    expect(routerMock.push).toHaveBeenCalledWith("/login");
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("closes the dialog on cancel without calling logout", async () => {
    render(<LogoutButton />);

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Log out?")).not.toBeInTheDocument();
  });
});
