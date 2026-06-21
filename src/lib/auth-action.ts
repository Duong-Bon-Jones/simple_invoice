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
      // Separate boolean instead of string-matching the message: callers
      // need to reliably detect this case (e.g. to show the session-expired
      // modal) without depending on exact error text.
      return { ok: false, error: "Session expired", sessionExpired: true };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
