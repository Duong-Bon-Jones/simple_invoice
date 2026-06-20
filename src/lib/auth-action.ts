import "server-only";
import { AuthError } from "@/lib/upstream";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; sessionExpired?: boolean };

export async function withSessionGuard<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Session expired", sessionExpired: true };
    }
    return { ok: false, error: "Something went wrong" };
  }
}
