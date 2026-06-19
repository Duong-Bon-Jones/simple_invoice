import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const InvoiceCreateSchema = z.object({
  customerName: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
});
export type InvoiceCreateInput = z.infer<typeof InvoiceCreateSchema>;

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
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type InvoiceQueryInput = z.infer<typeof InvoiceQuerySchema>;

const InvoiceSchema = z
  .object({
    invoiceId: z.string().optional(),
    invoiceNumber: z.string().optional(),
    customerName: z.string().optional(),
    totalAmount: z.coerce.number().optional(),
    currency: z.string().optional(),
    status: z.string().optional(),
    dueDate: z.string().optional(),
    createdDate: z.string().optional(),
  })
  .passthrough();
export type Invoice = z.infer<typeof InvoiceSchema>;

export const InvoiceListSchema = z
  .object({
    data: z.object({
      invoices: z.array(InvoiceSchema).default([]),
      paging: z
        .object({
          pageNum: z.coerce.number(),
          pageSize: z.coerce.number(),
          total: z.coerce.number(),
        })
        .partial()
        .optional(),
    }),
  })
  .passthrough();
export type InvoiceListResponse = z.infer<typeof InvoiceListSchema>;
