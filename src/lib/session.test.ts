import { beforeEach, describe, expect, it, vi } from "vitest";

type CookieOptions = Record<string, unknown>;
type CookieRecord = { value: string; options?: CookieOptions };

const cookieStore = new Map<string, CookieRecord>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (name: string, value: string, options?: CookieOptions) => {
      cookieStore.set(name, { value, options });
    },
    get: (name: string) => {
      const entry = cookieStore.get(name);
      return entry ? { value: entry.value } : undefined;
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
}));

const {
  setSession,
  getAccessToken,
  getOrgToken,
  hasSession,
  clearSession,
} = await import("@/lib/session");

beforeEach(() => {
  cookieStore.clear();
});

describe("setSession", () => {
  it("sets access_token, org_token, and display_name with expected options", async () => {
    await setSession({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 3600,
      name: "Jane Doe",
    });

    const access = cookieStore.get("access_token")!;
    expect(access.value).toBe("at");
    expect(access.options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 3600,
    });

    const org = cookieStore.get("org_token")!;
    expect(org.value).toBe("ot");
    expect(org.options).toMatchObject({ httpOnly: true });

    const name = cookieStore.get("display_name")!;
    expect(name.value).toBe("Jane Doe");
    expect(name.options).toMatchObject({ httpOnly: false });
  });

  it("skips display_name cookie when name is null", async () => {
    await setSession({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 3600,
      name: null,
    });

    expect(cookieStore.has("display_name")).toBe(false);
  });
});

describe("getAccessToken / getOrgToken", () => {
  it("reads back the values set by setSession", async () => {
    await setSession({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 60,
      name: null,
    });

    expect(await getAccessToken()).toBe("at");
    expect(await getOrgToken()).toBe("ot");
  });

  it("returns undefined when no cookie is set", async () => {
    expect(await getAccessToken()).toBeUndefined();
    expect(await getOrgToken()).toBeUndefined();
  });
});

describe("hasSession", () => {
  it("is true once an access token is set", async () => {
    await setSession({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 60,
      name: null,
    });
    expect(await hasSession()).toBe(true);
  });

  it("is false when there is no access token", async () => {
    expect(await hasSession()).toBe(false);
  });
});

describe("clearSession", () => {
  it("deletes all three cookies", async () => {
    await setSession({
      accessToken: "at",
      orgToken: "ot",
      expiresIn: 60,
      name: "Jane",
    });
    await clearSession();

    expect(cookieStore.has("access_token")).toBe(false);
    expect(cookieStore.has("org_token")).toBe(false);
    expect(cookieStore.has("display_name")).toBe(false);
  });
});
