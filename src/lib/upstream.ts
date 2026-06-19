import "server-only";
import { z } from "zod";
import { env, membershipServiceUrl, invoiceServiceUrl } from "@/lib/env";
import { getAccessToken, getOrgToken } from "@/lib/session";
import { InvoiceListSchema } from "@/lib/schemas";
import type { InvoiceCreateInput, InvoiceQueryInput } from "@/lib/schemas";

export class AuthError extends Error {}

async function authHeaders(): Promise<HeadersInit> {
  const [accessToken, orgToken] = await Promise.all([
    getAccessToken(),
    getOrgToken(),
  ]);
  return {
    Authorization: `Bearer ${accessToken}`,
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
  if (res.status === 401) throw new AuthError("Session expired");
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

export async function createInvoice(input: InvoiceCreateInput) {
  // TODO: POST `${invoiceServiceUrl}/invoices` with auth headers + body.
  void input;
  throw new Error("not implemented");
}

export async function getInvoice(id: string) {
  // TODO: GET `${invoiceServiceUrl}/invoices/${id}` with auth headers.
  void id;
  throw new Error("not implemented");
}
