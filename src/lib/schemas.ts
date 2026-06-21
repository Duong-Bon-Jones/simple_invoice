import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const InvoiceCreateSchema = z
  .object({
    customerFirstName: z.string().min(1, "Required"),
    customerLastName: z.string().min(1, "Required"),
    email: z.email("Enter a valid email"),
    mobileNumber: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number"),
    accountName: z.string().min(1, "Required"),
    accountNumber: z
      .string()
      .regex(/^\d{6,12}$/, "Enter a valid account number"),
    sortCode: z.string().regex(/^\d{2}-\d{2}-\d{2}$/, "Use format 00-00-00"),
    currency: z.enum(["GBP", "USD", "EUR", "SGD", "VND"]),
    invoiceDate: z.string().min(1, "Required"),
    dueDate: z.string().min(1, "Required"),
    description: z.string(),
    itemName: z.string().min(1, "Required"),
    itemDescription: z.string().min(1, "Required"),
    quantity: z.number().positive("Must be greater than 0"),
    rate: z.number().positive("Must be greater than 0"),
    itemUOM: z.string().min(1, "Required"),
  })
  .superRefine((data, ctx) => {
    if (data.dueDate < data.invoiceDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due date can't be before the invoice date",
      });
    }
  });
export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;

export const PageSizeSchema = z.coerce.number().int().min(1).max(100);

export const InvoiceQuerySchema = z.object({
  keyword: z.string().trim().optional(),
  status: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z
    .enum(["CREATED_DATE", "DUE_DATE", "TOTAL_AMOUNT"])
    .default("CREATED_DATE"),
  ordering: z.enum(["ASCENDING", "DESCENDING"]).default("DESCENDING"),
  pageNum: z.coerce.number().int().min(1).default(1),
  pageSize: PageSizeSchema.default(10),
});
export type InvoiceQueryInput = z.infer<typeof InvoiceQuerySchema>;

const InvoiceSchema = z
  .object({
    invoiceId: z.string().optional(),
    invoiceNumber: z.string().optional(),
    totalAmount: z.coerce.number().optional(),
    currency: z.string().optional(),
    dueDate: z.string().optional(),
    createdAt: z.string().optional(),
    customer: z
      .object({ id: z.string().optional(), name: z.string().optional() })
      .partial()
      .optional(),
    status: z
      .array(z.object({ key: z.string(), value: z.boolean() }))
      .optional(),
    description: z.string().optional(),
  })
  .passthrough();
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceListSchema = z
  .object({
    data: z.array(InvoiceSchema).default([]),
    paging: z
      .object({
        pageNumber: z.coerce.number(),
        pageSize: z.coerce.number(),
        totalRecords: z.coerce.number(),
      })
      .partial()
      .optional(),
  })
  .passthrough();
export type InvoiceListResponse = z.infer<typeof InvoiceListSchema>;
