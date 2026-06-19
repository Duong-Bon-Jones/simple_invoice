import Link from "next/link";
import { getDisplayName } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

function getInitials(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return initials
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const name = await getDisplayName();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
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
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
                {getInitials(name)}
              </span>
              <span className="text-sm text-foreground">
                {name ?? "Unknown user"}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        {children}
      </main>
    </div>
  );
}
