"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateField } from "@/components/ui/date-field";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SessionExpiredDialog } from "@/components/session-expired-dialog";
import { createInvoiceAction } from "@/lib/invoice-actions";
import { InvoiceCreateSchema } from "@/lib/schemas";

const CURRENCIES = ["GBP", "USD", "EUR", "SGD", "VND"] as const;
const today = format(new Date(), "yyyy-MM-dd");

const defaultValues = {
  customerFirstName: "",
  customerLastName: "",
  email: "",
  mobileNumber: "",
  accountName: "",
  accountNumber: "",
  sortCode: "",
  currency: "GBP",
  invoiceDate: today,
  dueDate: today,
  description: "",
  itemName: "",
  itemDescription: "",
  quantity: 1,
  rate: 0,
  itemUOM: "UNIT",
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  );
}

export function InvoiceForm() {
  const [success, setSuccess] = useState<{ invoiceNumber: string } | null>(
    null,
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  const form = useForm({
    defaultValues,
    validators: { onSubmit: InvoiceCreateSchema },
    onSubmit: async ({ value }) => {
      const result = await createInvoiceAction(value);
      if (result.ok) {
        setSuccess(result.data);
        return;
      }
      if (result.sessionExpired) {
        setSessionExpired(true);
        return;
      }
      toast.error("Couldn't create invoice", { description: result.error });
    },
  });

  if (success) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="size-10 text-brand" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">Invoice created</p>
            <p className="font-mono text-sm text-muted-foreground">
              {success.invoiceNumber}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/invoices">View invoices</Link>
            </Button>
            <Button
              className="bg-brand text-brand-foreground hover:bg-brand/80"
              onClick={() => {
                form.reset();
                setSuccess(null);
              }}
            >
              Create another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {sessionExpired && <SessionExpiredDialog />}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6"
        noValidate
      >
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <SectionLabel>Bill to</SectionLabel>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="customerFirstName">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="customerLastName">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="email">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="mobileNumber">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Mobile number</FieldLabel>
                    <Input
                      id={field.name}
                      inputMode="tel"
                      className="font-mono"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <SectionLabel>Pay to</SectionLabel>
            <Separator />
            <form.Field name="accountName">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Account name</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="accountNumber">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Account number</FieldLabel>
                    <Input
                      id={field.name}
                      className="font-mono"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="sortCode">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Sort code</FieldLabel>
                    <Input
                      id={field.name}
                      className="font-mono"
                      placeholder="00-00-00"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <SectionLabel>Invoice</SectionLabel>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="currency">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="invoiceDate">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Invoice date</FieldLabel>
                    <DateField
                      label="Invoice date"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value ?? "")}
                      onBlur={field.handleBlur}
                      className="w-full"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="dueDate">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                    <DateField
                      label="Due date"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value ?? "")}
                      onBlur={field.handleBlur}
                      className="w-full"
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
            <form.Field name="description">
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <SectionLabel>Line item</SectionLabel>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="itemName">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Item name</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="itemDescription">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>
                      Item description
                    </FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <form.Field name="quantity">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min="0"
                      step="1"
                      className="font-mono"
                      // Clearing the input produces NaN in form state; without
                      // this guard the input would literally display "NaN".
                      value={
                        Number.isNaN(field.state.value) ? "" : field.state.value
                      }
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.valueAsNumber)
                      }
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="rate">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Rate</FieldLabel>
                    <Input
                      id={field.name}
                      type="number"
                      min="0"
                      step="0.01"
                      className="font-mono"
                      // Same NaN guard as quantity above.
                      value={
                        Number.isNaN(field.state.value) ? "" : field.state.value
                      }
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.valueAsNumber)
                      }
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
              <form.Field name="itemUOM">
                {(field) => (
                  <Field data-invalid={field.state.meta.errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>UOM</FieldLabel>
                    <Input
                      id={field.name}
                      className="font-mono"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
          <form.Subscribe
            selector={(state) => [
              state.values.quantity,
              state.values.rate,
              state.values.currency,
            ]}
          >
            {([quantity, rate, currency]) => {
              const total =
                (Number.isFinite(quantity) ? Number(quantity) : 0) *
                (Number.isFinite(rate) ? Number(rate) : 0);
              const formatted = new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: String(currency),
              }).format(total);
              return (
                <p className="font-mono text-lg font-semibold">{formatted}</p>
              );
            }}
          </form.Subscribe>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-brand text-brand-foreground hover:bg-brand/80"
              >
                {isSubmitting && (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                )}
                Create invoice
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </>
  );
}
