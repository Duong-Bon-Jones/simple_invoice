import { connection } from "next/server";
import { LoginForm } from "./login-form";

// Nonce-based CSP requires per-request rendering: without this, Next
// prerenders the page statically and bakes in a stale nonce, which gets
// rejected by the proxy's CSP header and blocks hydration entirely.
export default async function LoginPage() {
  await connection();
  return <LoginForm />;
}
