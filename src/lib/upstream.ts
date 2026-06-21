import "server-only";
import { z } from "zod";
import { env, membershipServiceUrl, invoiceServiceUrl } from "@/lib/env";
import { getAccessToken, getOrgToken } from "@/lib/session";
import { InvoiceDetailSchema, InvoiceListSchema } from "@/lib/schemas";
import type { InvoiceCreateInput, InvoiceQueryInput } from "@/lib/schemas";

export class AuthError extends Error {}
export class NotFoundError extends Error {}

function throwIfUnauthorized(res: Response) {
  if (res.status === 401) throw new AuthError("Session expired");
}

async function describeUpstreamError(res: Response): Promise<string> {
  const body = (await res.json().catch(() => null)) as {
    errors?: Array<{ message?: string }>;
  } | null;
  const upstreamMessage = body?.errors?.[0]?.message?.trim();
  const status = `${res.status} ${res.statusText}`.trim();
  return upstreamMessage ? `${status}: ${upstreamMessage}` : status;
}

async function authHeaders(): Promise<HeadersInit> {
  const [accessToken, orgToken] = await Promise.all([
    getAccessToken(),
    getOrgToken(),
  ]);
  return {
    Authorization: `Bearer ${accessToken}`,
    // Always send the header, even empty: omitting it entirely vs. sending ""
    // behave differently upstream when a session has no org token yet.
    "org-token": orgToken ?? "",
  };
}

const TokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
});
const MeResponseSchema = z.object({
  data: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    memberships: z.array(z.object({ token: z.string().min(1) })).min(1),
  }),
});

function displayNameFrom(data: {
  firstName?: string;
  lastName?: string;
}): string | null {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ");
  return name || null;
}

export async function exchangeCredentialsForToken(
  username: string,
  password: string,
): Promise<{
  accessToken: string;
  orgToken: string;
  expiresIn: number;
  name: string | null;
}> {
  const tokenResponse = await fetch(`${env.IDENTITY_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.OAUTH_CLIENT_ID,
      client_secret: env.OAUTH_CLIENT_SECRET,
      grant_type: "password",
      scope: "openid",
      username,
      password,
    }),
  });

  if (tokenResponse.status === 400 || tokenResponse.status === 401) {
    throw new AuthError("Invalid credentials");
  }
  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${tokenResponse.status}`);
  }

  const { access_token: accessToken, expires_in: expiresIn } =
    TokenResponseSchema.parse(await tokenResponse.json());

  const meResponse = await fetch(`${membershipServiceUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!meResponse.ok) {
    throw new Error(`Membership lookup failed: ${meResponse.status}`);
  }

  const { data } = MeResponseSchema.parse(await meResponse.json());

  return {
    accessToken,
    orgToken: data.memberships[0].token,
    expiresIn,
    name: displayNameFrom(data),
  };
}

export async function listInvoices(query: InvoiceQueryInput) {
  const params = new URLSearchParams({
    sortBy: query.sortBy,
    ordering: query.ordering,
    pageNum: String(query.pageNum),
    pageSize: String(query.pageSize),
  });
  for (const key of ["keyword", "status", "fromDate", "toDate"] as const) {
    if (query[key]) params.set(key, query[key]!);
  }

  const res = await fetch(`${invoiceServiceUrl}/invoices?${params}`, {
    headers: { ...(await authHeaders()), Accept: "application/json" },
    cache: "no-store",
  });
  throwIfUnauthorized(res);
  if (!res.ok) throw new Error(`List invoices failed: ${res.status}`);

  const parsed = InvoiceListSchema.parse(await res.json());
  const invoices = parsed.data;
  return {
    invoices,
    paging: {
      pageNum: parsed.paging?.pageNumber ?? query.pageNum,
      pageSize: parsed.paging?.pageSize ?? query.pageSize,
      total: parsed.paging?.totalRecords ?? invoices.length,
    },
  };
}

// 12 hex chars from a UUID: ~48 bits of randomness, short enough to fit
// upstream's reference/number column limits (existing values are 13-17 chars).
function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function createInvoice(
  input: InvoiceCreateInput,
): Promise<{ invoiceNumber: string }> {
  // Separate random IDs, not derived from one value: upstream tracks
  // invoiceNumber and invoiceReference as distinct identifiers.
  const invoiceNumber = `INV-${shortId()}`;
  const invoiceReference = `#${shortId()}`;

  const body = {
    invoices: [
      {
        bankAccount: {
          bankId: "",
          accountName: input.accountName,
          accountNumber: input.accountNumber,
          sortCode: input.sortCode,
        },
        customer: {
          contact: {
            firstName: input.customerFirstName,
            lastName: input.customerLastName,
            email: input.email,
            mobileNumber: input.mobileNumber,
          },
        },
        invoiceReference,
        invoiceNumber,
        currency: input.currency,
        invoiceDate: input.invoiceDate,
        dueDate: input.dueDate,
        description: input.description || undefined, // upstream rejects "" for this field
        items: [
          {
            itemReference: `ITEM-${shortId()}`,
            itemName: input.itemName,
            description: input.itemDescription,
            quantity: input.quantity,
            rate: input.rate,
            itemUOM: input.itemUOM,
          },
        ],
      },
    ],
  };

  const res = await fetch(`${invoiceServiceUrl}/invoices`, {
    method: "POST",
    headers: {
      ...(await authHeaders()),
      "Operation-Mode": "SYNC",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  throwIfUnauthorized(res);
  if (!res.ok) throw new Error(await describeUpstreamError(res));

  return { invoiceNumber };
}

export async function getInvoice(id: string) {
  const res = await fetch(
    `${invoiceServiceUrl}/invoices/${encodeURIComponent(id)}`,
    {
      headers: { ...(await authHeaders()), Accept: "application/json" },
      cache: "no-store",
    },
  );
  throwIfUnauthorized(res);
  if (res.status === 404 || res.status === 400) throw new NotFoundError(id);
  if (!res.ok) throw new Error(await describeUpstreamError(res));

  return InvoiceDetailSchema.parse(await res.json()).data;
}
