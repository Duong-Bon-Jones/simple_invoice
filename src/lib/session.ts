import "server-only";
import { cookies } from "next/headers";

const ACCESS_TOKEN_COOKIE = "access_token";
const ORG_TOKEN_COOKIE = "org_token";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};

export async function setSession(tokens: {
  accessToken: string;
  orgToken: string;
  expiresIn: number;
}) {
  const cookieStore = await cookies();
  const options = { ...BASE_COOKIE_OPTIONS, maxAge: tokens.expiresIn };
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, options);
  cookieStore.set(ORG_TOKEN_COOKIE, tokens.orgToken, options);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getOrgToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ORG_TOKEN_COOKIE)?.value;
}

export async function hasSession(): Promise<boolean> {
  return Boolean(await getAccessToken());
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ORG_TOKEN_COOKIE);
}
