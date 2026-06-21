export function formatCurrency(
  amount: number | undefined,
  currency: string | undefined,
): string {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

export function formatAddress(
  address:
    | {
        premise?: string;
        thoroughfare?: string;
        dependentLocality?: string;
        city?: string;
        county?: string;
        postcode?: string;
        countryCode?: string;
      }
    | undefined,
): string | undefined {
  if (!address) return undefined;
  const parts = [
    address.premise,
    address.thoroughfare,
    address.dependentLocality,
    address.city,
    address.county,
    address.postcode,
    address.countryCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
