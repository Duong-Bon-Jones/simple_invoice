import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvoiceForm } from "./invoice-form";
import { createInvoiceAction } from "@/lib/invoice-actions";
import { toast } from "sonner";

vi.mock("@/lib/invoice-actions", () => ({ createInvoiceAction: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockAction = vi.mocked(createInvoiceAction);

beforeEach(() => {
  mockAction.mockReset();
  vi.mocked(toast.error).mockReset();
});

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText("First name"), "Jane");
  await userEvent.type(screen.getByLabelText("Last name"), "Doe");
  await userEvent.type(screen.getByLabelText("Email"), "jane@example.com");
  await userEvent.type(screen.getByLabelText("Mobile number"), "+447911123456");
  await userEvent.type(screen.getByLabelText("Account name"), "Acme");
  await userEvent.type(screen.getByLabelText("Account number"), "12345678");
  await userEvent.type(screen.getByLabelText("Sort code"), "12-34-56");
  await userEvent.type(screen.getByLabelText("Item name"), "Widget");
  await userEvent.type(screen.getByLabelText("Item description"), "A widget");
  const rate = screen.getByLabelText("Rate");
  await userEvent.clear(rate);
  await userEvent.type(rate, "10");
}

describe("InvoiceForm", () => {
  it("does not call the action when required fields are left blank", async () => {
    render(<InvoiceForm />);
    await userEvent.click(
      screen.getByRole("button", { name: "Create invoice" }),
    );
    expect(mockAction).not.toHaveBeenCalled();
  });

  it("submits the filled-in values and shows the success state", async () => {
    mockAction.mockResolvedValueOnce({
      ok: true,
      data: { invoiceNumber: "INV-100" },
    });
    render(<InvoiceForm />);
    await fillRequiredFields();
    await userEvent.click(
      screen.getByRole("button", { name: "Create invoice" }),
    );

    await waitFor(() => expect(mockAction).toHaveBeenCalled());
    expect(mockAction).toHaveBeenCalledWith(
      expect.objectContaining({
        customerFirstName: "Jane",
        customerLastName: "Doe",
        email: "jane@example.com",
        rate: 10,
      }),
    );

    expect(await screen.findByText("Invoice created")).toBeInTheDocument();
    expect(screen.getByText("INV-100")).toBeInTheDocument();
  });

  it("returns to the form when 'Create another' is clicked", async () => {
    mockAction.mockResolvedValueOnce({
      ok: true,
      data: { invoiceNumber: "INV-100" },
    });
    render(<InvoiceForm />);
    await fillRequiredFields();
    await userEvent.click(
      screen.getByRole("button", { name: "Create invoice" }),
    );
    await screen.findByText("Invoice created");

    await userEvent.click(
      screen.getByRole("button", { name: "Create another" }),
    );
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
  });

  it("shows the session-expired dialog when the action reports session expiry", async () => {
    mockAction.mockResolvedValueOnce({
      ok: false,
      error: "Session expired",
      sessionExpired: true,
    });
    render(<InvoiceForm />);
    await fillRequiredFields();
    await userEvent.click(
      screen.getByRole("button", { name: "Create invoice" }),
    );

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByText("Your session has expired. Please log in again."),
    ).toBeInTheDocument();
  });

  it("shows a toast error for a generic failure", async () => {
    mockAction.mockResolvedValueOnce({ ok: false, error: "Boom" });
    render(<InvoiceForm />);
    await fillRequiredFields();
    await userEvent.click(
      screen.getByRole("button", { name: "Create invoice" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Couldn't create invoice", {
        description: "Boom",
      }),
    );
  });
});
