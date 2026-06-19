import "server-only";
import { env } from "@/lib/env";
import { getAccessToken, getOrgToken } from "@/lib/session";
import type { InvoiceCreateInput, InvoiceQueryInput } from "@/lib/schemas";

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

export async function exchangeCredentialsForToken(
  username: string,
  password: string,
): Promise<{ accessToken: string; orgToken: string }> {
  // TODO: POST to `${env.IDENTITY_BASE_URL}/oauth2/token` (x-www-form-urlencoded)
  // with grant_type=password, client_id=env.OAUTH_CLIENT_ID,
  // client_secret=env.OAUTH_CLIENT_SECRET, username, password.
  // Then exchange the access_token for an org_token via membership-service.
  void username;
  void password;
  void env;
  throw new Error("not implemented");
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
