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
    // Plain string comparison is valid here: dates are ISO yyyy-mm-dd, where
    // lexicographic order matches chronological order.
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
    // Array of flags, not an enum: mirrors upstream's status shape, which
    // models status as a set of independent {key, value} flags rather than
    // a single state.
    status: z
      .array(z.object({ key: z.string(), value: z.boolean() }))
      .optional(),
    description: z.string().optional(),
  })
  // Keep unknown upstream fields instead of stripping them — these schemas
  // only validate the fields the UI actually uses, not the full API surface.
  .passthrough();
export type Invoice = z.infer<typeof InvoiceSchema>;

const AddressSchema = z
  .object({
    addressType: z.string().optional(),
    premise: z.string().optional(),
    thoroughfare: z.string().optional(),
    dependentLocality: z.string().optional(),
    city: z.string().optional(),
    county: z.string().optional(),
    postcode: z.string().optional(),
    countryCode: z.string().optional(),
  })
  .passthrough();

const ExtensionSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED_VALUE"]).optional(),
    value: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
    addDeduct: z.enum(["ADD", "DEDUCT"]).optional(),
  })
  .passthrough();

const InvoiceItemSchema = z
  .object({
    itemReference: z.string().optional(),
    itemName: z.string().optional(),
    description: z.string().optional(),
    quantity: z.coerce.number().optional(),
    rate: z.coerce.number().optional(),
    itemUOM: z.string().optional(),
    amount: z.coerce.number().optional(),
    netAmount: z.coerce.number().optional(),
    extensions: z.array(ExtensionSchema).optional(),
  })
  .passthrough();

const InvoiceDocumentSchema = z
  .object({
    documentId: z.string().optional(),
    documentName: z.string().optional(),
    documentUrl: z.string().optional(),
  })
  .passthrough();

export const InvoiceDetailSchema = z
  .object({
    data: z
      .object({
        bankAccount: z
          .object({
            bankId: z.string().optional(),
            sortCode: z.string().optional(),
            accountName: z.string().optional(),
            accountNumber: z.string().optional(),
          })
          .partial()
          .optional(),
        currency: z.string().optional(),
        currencySymbol: z.string().optional(),
        type: z.string().optional(),
        invoiceId: z.string().optional(),
        invoiceNumber: z.string().optional(),
        invoiceReference: z.string().optional(),
        referenceNo: z.string().optional(),
        invoiceDate: z.string().optional(),
        dueDate: z.string().optional(),
        createdAt: z.string().optional(),
        description: z.string().optional(),
        // Array of flags, same reasoning as InvoiceSchema.status above.
        status: z
          .array(z.object({ key: z.string(), value: z.boolean() }))
          .optional(),
        customer: z
          .object({
            id: z.string().optional(),
            name: z.string().optional(),
            contact: z
              .object({
                email: z.string().optional(),
                mobileNumber: z.string().optional(),
              })
              .partial()
              .optional(),
            addresses: z.array(AddressSchema).optional(),
          })
          .partial()
          .optional(),
        merchant: z
          .object({
            id: z.string().optional(),
            name: z.string().optional(),
            addresses: z.array(AddressSchema).optional(),
          })
          .partial()
          .optional(),
        items: z.array(InvoiceItemSchema).optional(),
        extensions: z.array(ExtensionSchema).optional(),
        documents: z.array(InvoiceDocumentSchema).optional(),
        invoiceSubTotal: z.coerce.number().optional(),
        totalTax: z.coerce.number().optional(),
        totalDiscount: z.coerce.number().optional(),
        totalAmount: z.coerce.number().optional(),
        totalPaid: z.coerce.number().optional(),
        balanceAmount: z.coerce.number().optional(),
        invoiceGrossTotal: z.coerce.number().optional(),
      })
      .passthrough(),
  })
  .passthrough();
export type InvoiceDetail = z.infer<typeof InvoiceDetailSchema>["data"];

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
