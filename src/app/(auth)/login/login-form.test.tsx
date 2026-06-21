import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const routerMock = { push: vi.fn(), refresh: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

beforeEach(() => {
  routerMock.push.mockReset();
  routerMock.refresh.mockReset();
  vi.stubGlobal("fetch", vi.fn());
});

function mockFetchResponse(status: number, body: unknown) {
  vi.mocked(fetch).mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => body,
  } as Response);
}

describe("LoginForm", () => {
  it("shows field errors and does not submit when validation fails", async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findAllByText(/too small/i)).toHaveLength(2);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits valid credentials and redirects to /invoices on success", async () => {
    mockFetchResponse(200, { success: true });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Mobile number"), "0123456789");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(routerMock.push).toHaveBeenCalledWith("/invoices"),
    );
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("shows the server error message and does not redirect on failed login", async () => {
    mockFetchResponse(401, { success: false, error: "Invalid credentials" });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Mobile number"), "0123456789");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("falls back to a generic error message when the response has no error string", async () => {
    mockFetchResponse(500, {});
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Mobile number"), "0123456789");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Login failed, try again"),
    ).toBeInTheDocument();
  });
});
