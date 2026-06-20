import { describe, expect, it } from "vitest";
import {
  InvoiceCreateSchema,
  InvoiceListSchema,
  InvoiceQuerySchema,
  PageSizeSchema,
} from "@/lib/schemas";

const VALID_INVOICE = {
  customerFirstName: "Jane",
  customerLastName: "Doe",
  email: "jane@example.com",
  mobileNumber: "+447123456789",
  accountName: "Jane Doe",
  accountNumber: "12345678",
  sortCode: "12-34-56",
  currency: "GBP" as const,
  invoiceDate: "2026-01-01",
  dueDate: "2026-01-10",
  description: "",
  itemName: "Widget",
  itemDescription: "A widget",
  quantity: 1,
  rate: 10,
  itemUOM: "unit",
};

describe("InvoiceCreateSchema", () => {
  it("fails when dueDate is before invoiceDate", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      invoiceDate: "2026-01-10",
      dueDate: "2026-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "dueDate")).toBe(
        true,
      );
    }
  });

  it("passes when dueDate equals invoiceDate", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      invoiceDate: "2026-01-01",
      dueDate: "2026-01-01",
    });
    expect(result.success).toBe(true);
  });

  it("passes when dueDate is after invoiceDate", () => {
    const result = InvoiceCreateSchema.safeParse(VALID_INVOICE);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid sortCode format", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      sortCode: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid accountNumber format", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      accountNumber: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid mobile number", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      mobileNumber: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive quantity", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive rate", () => {
    const result = InvoiceCreateSchema.safeParse({
      ...VALID_INVOICE,
      rate: -5,
    });
    expect(result.success).toBe(false);
  });
});

describe("InvoiceQuerySchema", () => {
  it("applies defaults when given an empty object", () => {
    const result = InvoiceQuerySchema.parse({});
    expect(result.sortBy).toBe("CREATED_DATE");
    expect(result.ordering).toBe("DESCENDING");
    expect(result.pageNum).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it("coerces string pageNum and pageSize to numbers", () => {
    const result = InvoiceQuerySchema.parse({ pageNum: "3", pageSize: "25" });
    expect(result.pageNum).toBe(3);
    expect(result.pageSize).toBe(25);
  });
});

describe("PageSizeSchema", () => {
  it("rejects values below the minimum", () => {
    expect(PageSizeSchema.safeParse(0).success).toBe(false);
  });

  it("rejects values above the maximum", () => {
    expect(PageSizeSchema.safeParse(101).success).toBe(false);
  });

  it("accepts the boundary values", () => {
    expect(PageSizeSchema.safeParse(1).success).toBe(true);
    expect(PageSizeSchema.safeParse(100).success).toBe(true);
  });
});

describe("InvoiceListSchema", () => {
  it("defaults data to an empty array when missing", () => {
    const result = InvoiceListSchema.parse({});
    expect(result.data).toEqual([]);
  });

  it("coerces paging fields from strings", () => {
    const result = InvoiceListSchema.parse({
      data: [],
      paging: { pageNumber: "2", pageSize: "10", totalRecords: "42" },
    });
    expect(result.paging).toEqual({
      pageNumber: 2,
      pageSize: 10,
      totalRecords: 42,
    });
  });
});
