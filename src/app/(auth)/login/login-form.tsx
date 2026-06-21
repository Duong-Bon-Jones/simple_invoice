"use client";

import { useState, useTransition } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginSchema } from "@/lib/schemas";

type FieldErrors = Partial<Record<"username" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = LoginSchema.safeParse({ username, password });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "username" || field === "password") {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();

      // Two distinct failure modes: a non-2xx transport/server error, or a
      // 200 with {success: false} for a handled case like bad credentials.
      if (!response.ok || !result.success) {
        setFormError(
          typeof result.error === "string"
            ? result.error
            : "Login failed, try again",
        );
        return;
      }

      router.push("/invoices");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex flex-col justify-between gap-6 overflow-hidden bg-ink px-6 py-8 text-ink-foreground lg:min-h-screen lg:w-1/2 lg:px-16 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--ink-rule) 0px, var(--ink-rule) 1px, transparent 1px, transparent 32px)",
          }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-6 -bottom-10 select-none font-mono text-[8rem] font-bold leading-none text-ink-foreground/5 lg:text-[13rem]"
          aria-hidden="true"
        >
          INV-0000
        </span>

        <p className="relative z-10 text-base font-semibold tracking-tight">
          Simple Invoice
        </p>

        <div className="relative z-10 hidden max-w-sm space-y-2 lg:block">
          <p className="text-2xl leading-snug font-medium">
            Every invoice, accounted for.
          </p>
          <p className="text-sm text-ink-foreground/70">
            Sign in to track, send, and settle invoices from one ledger.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Use your registered mobile number and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Mobile number</Label>
                <Input
                  id="username"
                  name="username"
                  inputMode="numeric"
                  autoComplete="username"
                  className="font-mono focus-visible:border-brand focus-visible:ring-brand/50"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.username)}
                  aria-describedby={
                    fieldErrors.username ? "username-error" : undefined
                  }
                />
                {fieldErrors.username && (
                  <p id="username-error" className="text-xs text-destructive">
                    {fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="focus-visible:border-brand focus-visible:ring-brand/50"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                />
                {fieldErrors.password && (
                  <p id="password-error" className="text-xs text-destructive">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/80 focus-visible:ring-brand/50"
              >
                {isPending && (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                )}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
