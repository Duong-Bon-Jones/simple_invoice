import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-brand/15 text-brand border-brand/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  due: "bg-accent text-accent-foreground border-border",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function InvoiceStatusBadge({ status }: { status?: string }) {
  const key = status?.toLowerCase() ?? "";
  const className =
    STATUS_STYLES[key] ?? "bg-muted text-muted-foreground border-border";

  return (
    <Badge variant="outline" className={className}>
      {status ?? "Unknown"}
    </Badge>
  );
}
