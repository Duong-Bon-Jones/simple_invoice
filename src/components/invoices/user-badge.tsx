"use client";

import { useSession } from "@/components/session-context";

function getInitials(name: string | null): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return initials
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserBadge() {
  const name = useSession();

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="flex size-7 items-center justify-center rounded-full bg-muted font-mono text-xs text-muted-foreground">
        {getInitials(name)}
      </span>
      <span className="text-sm text-foreground">{name ?? "Unknown user"}</span>
    </div>
  );
}
