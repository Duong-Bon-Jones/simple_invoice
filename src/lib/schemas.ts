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
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type InvoiceQueryInput = z.infer<typeof InvoiceQuerySchema>;
