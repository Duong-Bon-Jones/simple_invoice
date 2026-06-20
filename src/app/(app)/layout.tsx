import Link from "next/link";
import { SessionProvider } from "@/components/session-context";
import { UserBadge } from "@/components/invoices/user-badge";
import { LogoutButton } from "@/components/logout-button";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <div className="flex h-screen flex-col">
        <header className="shrink-0 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link
              href="/invoices"
              className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-ink font-mono text-[0.65rem] text-ink-foreground">
                INV
              </span>
              Simple Invoice
            </Link>

            <div className="flex items-center gap-3">
              <UserBadge />
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto px-6 py-10">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
