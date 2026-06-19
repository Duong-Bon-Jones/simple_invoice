import { NextResponse } from "next/server";
import { z } from "zod";
import { LoginSchema } from "@/lib/schemas";
import { setSession } from "@/lib/session";
import { AuthError, exchangeCredentialsForToken } from "@/lib/upstream";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  try {
    const tokens = await exchangeCredentialsForToken(
      parsed.data.username,
      parsed.data.password,
    );
    await setSession(tokens);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
      );
    }
    console.error("Login upstream failure", error);
    return NextResponse.json(
      { success: false, error: "Login failed, try again" },
      { status: 502 },
    );
  }
}
