"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

export function LinkStatusIcon({ icon }: { icon: React.ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) {
    return <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />;
  }
  return icon;
}
