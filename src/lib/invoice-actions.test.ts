import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/upstream", () => ({
  AuthError: class AuthError extends Error {},
  createInvoice: vi.fn(),
}));

const { AuthError, createInvoice } = await import("@/lib/upstream");
const { createInvoiceAction } = await import("@/lib/invoice-actions");

const VALID_INPUT = {
  customerFirstName: "Jane",
  customerLastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "+447911123456",
  accountName: "Acme",
  accountNumber: "12345678",
  sortCode: "12-34-56",
  currency: "GBP" as const,
  invoiceDate: "2024-01-01",
  dueDate: "2024-01-02",
  description: "",
  itemName: "Widget",
  itemDescription: "A widget",
  quantity: 1,
  rate: 10,
  itemUOM: "UNIT",
};

beforeEach(() => {
  vi.mocked(createInvoice).mockReset();
});

describe("createInvoiceAction", () => {
  it("returns a validation error without calling the upstream when input is invalid", async () => {
    const result = await createInvoiceAction({});
    expect(result).toEqual({
      ok: false,
      error: "Please check the form fields.",
    });
    expect(createInvoice).not.toHaveBeenCalled();
  });

  it("returns the invoice number on success", async () => {
    vi.mocked(createInvoice).mockResolvedValueOnce({ invoiceNumber: "INV-1" });
    const result = await createInvoiceAction(VALID_INPUT);
    expect(result).toEqual({ ok: true, data: { invoiceNumber: "INV-1" } });
    expect(createInvoice).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("maps an AuthError from the upstream to a session-expired result", async () => {
    vi.mocked(createInvoice).mockRejectedValueOnce(new AuthError("expired"));
    const result = await createInvoiceAction(VALID_INPUT);
    expect(result).toEqual({
      ok: false,
      error: "Session expired",
      sessionExpired: true,
    });
  });
});
