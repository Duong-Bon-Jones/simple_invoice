import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";
import { getAccessToken, getOrgToken } from "@/lib/session";
import type { InvoiceCreateInput, InvoiceQueryInput } from "@/lib/schemas";

export class AuthError extends Error {}

async function authHeaders(): Promise<HeadersInit> {
  const [accessToken, orgToken] = await Promise.all([
    getAccessToken(),
    getOrgToken(),
  ]);
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Org-Token": orgToken ?? "",
  };
}

const TokenResponseSchema = z.object({ access_token: z.string().min(1) });
const MembershipResponseSchema = z.object({
  data: z.object({
    memberships: z.array(z.object({ token: z.string().min(1) })).min(1),
  }),
});

export async function exchangeCredentialsForToken(
  username: string,
  password: string,
): Promise<{ accessToken: string; orgToken: string }> {
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

  const { access_token: accessToken } = TokenResponseSchema.parse(
    await tokenResponse.json(),
  );

  const meResponse = await fetch(`${env.MEMBERSHIP_SERVICE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!meResponse.ok) {
    throw new Error(`Membership lookup failed: ${meResponse.status}`);
  }

  const {
    data: { memberships },
  } = MembershipResponseSchema.parse(await meResponse.json());

  return { accessToken, orgToken: memberships[0].token };
}

export async function listInvoices(query: InvoiceQueryInput) {
  // TODO: GET `${env.INVOICE_SERVICE_URL}/invoices` with auth headers + query params.
  void authHeaders;
  void query;
  throw new Error("not implemented");
}

export async function createInvoice(input: InvoiceCreateInput) {
  // TODO: POST `${env.INVOICE_SERVICE_URL}/invoices` with auth headers + body.
  void input;
  throw new Error("not implemented");
}

export async function getInvoice(id: string) {
  // TODO: GET `${env.INVOICE_SERVICE_URL}/invoices/${id}` with auth headers.
  void id;
  throw new Error("not implemented");
}
