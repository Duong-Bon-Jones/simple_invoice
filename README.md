# Simple Invoice

A small invoice app built on **Next.js 16 (App Router)** that talks to the
[101Digital](https://www.101digital.io/) platform. You can log in, browse/filter/paginate
your invoices, and create new ones — all without any third-party credentials ever reaching
the browser.

It's a deliberately compact codebase that demonstrates a **backend-for-frontend (BFF)**
auth pattern, server-side input validation, security headers/CSP, and an enforced test
coverage gate.

> ⚠️ This app targets **Next.js 16**, which changed several conventions (e.g. the
> `proxy.ts` middleware file). See [`AGENTS.md`](./AGENTS.md) before assuming older
> Next.js behavior.

## Tech stack

- **Next.js 16** (App Router, React Compiler, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (`radix-nova` style, Radix primitives, lucide icons)
- **TanStack Query** (server-state for reads) + **TanStack Form** (forms)
- **Zod v4** for schema validation at every boundary
- **Vitest** + Testing Library + jsdom for tests
- **pnpm** as the package manager

## Getting started

Prerequisites: **Node 20+** and **pnpm**.

```bash
cp .env.example .env.local   # then fill in your 101Digital credentials
pnpm install
pnpm dev                     # http://localhost:3000
```

### Environment

All env vars are **server-only** (never `NEXT_PUBLIC_`) and validated by Zod at startup in
[`src/lib/env.ts`](./src/lib/env.ts) — the app fails fast if any are missing.

| Variable              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `IDENTITY_BASE_URL`   | 101Digital identity server (OAuth2 token endpoint)            |
| `OAUTH_CLIENT_ID`     | OAuth client id                                               |
| `OAUTH_CLIENT_SECRET` | OAuth client secret                                           |
| `API_BASE_URL`        | API base (membership-service + invoice-service live under it) |

## Architecture

The browser **never** holds the 101Digital secrets or tokens. Everything outbound to
101Digital goes through a server-side layer; the client only ever talks to this app's own
routes/actions.

```
Browser                Next.js server (BFF)                101Digital
───────                ────────────────────                ──────────
login form  ──POST──>  /api/auth/login ─────────────────>  OAuth2 token + /users/me
                       └─ setSession() writes httpOnly cookies

invoice list ─GET──>   /api/invoices ──> upstream.listInvoices ──> invoice-service
 (TanStack Query)

create form ─action─>  createInvoiceAction ──> upstream.createInvoice ──> invoice-service
```

- **Auth** ([`src/lib/upstream.ts`](./src/lib/upstream.ts)): exchanges credentials for an
  access token via OAuth2 password grant, then looks up the org token + display name from
  `/users/me`.
- **Session** ([`src/lib/session.ts`](./src/lib/session.ts)): stores `access_token` and
  `org_token` as **httpOnly** cookies; `display_name` is non-httpOnly on purpose (not a
  secret, read by the client to render the header).
- **Routing/auth gate** ([`src/proxy.ts`](./src/proxy.ts)): the Next 16 proxy
  (middleware). Redirects unauthenticated users to `/login`, sends logged-in users away
  from `/login` to `/invoices`, and attaches the Content-Security-Policy.
- **Reads** are client-fetched: `invoices-view` → `useInvoices` (TanStack Query) →
  `GET /api/invoices` (BFF route) → `upstream.listInvoices`.
- **Writes** use a server action:
  [`createInvoiceAction`](./src/lib/invoice-actions.ts) → `upstream.createInvoice`,
  returning a typed `ActionResult<T>` envelope.
- **Session expiry**: an upstream `401` becomes an `AuthError`, surfaced to the client as a
  `SessionExpiredError` (which triggers `SessionExpiredDialog`). Server actions wrap calls
  in [`withSessionGuard`](./src/lib/auth-action.ts).
- **Security**: HSTS / nosniff / frame-DENY / Referrer-Policy / Permissions-Policy headers
  in [`next.config.ts`](./next.config.ts), CSP in `proxy.ts`, and a gitleaks secret-scan in
  CI ([`.github/workflows/gitleaks.yml`](./.github/workflows/gitleaks.yml)).

## Project structure

```
src/
├── proxy.ts                 # Next 16 middleware: auth redirects + CSP
├── app/
│   ├── (auth)/login/        # login page + form
│   ├── (app)/invoices/      # list, new, [id] (detail — see below)
│   └── api/                 # BFF routes: auth/login, auth/logout, invoices
├── lib/
│   ├── env.ts               # Zod-validated, server-only env
│   ├── upstream.ts          # the ONLY module that calls 101Digital (server-only)
│   ├── session.ts           # cookie-based session
│   ├── schemas.ts           # Zod schemas shared by routes/actions/forms
│   ├── invoice-actions.ts   # server actions (writes)
│   └── auth-action.ts       # ActionResult envelope + withSessionGuard
├── components/
│   ├── invoices/            # feature components (table, toolbar, form, ...)
│   └── ui/                  # shadcn/ui primitives
└── hooks/                   # useInvoices, useLocalStorage
```

> Note: invoice detail is not finished — `upstream.getInvoice` is a stub
> (`not implemented`).

## Conventions

- **Validate at boundaries.** Every API route, server action, and form parses input with a
  Zod schema from [`src/lib/schemas.ts`](./src/lib/schemas.ts) before using it.
- **Keep secrets server-side.** `env.ts`, `upstream.ts`, and `session.ts` all import
  `server-only`; nothing that touches credentials can be bundled to the client.
- **Use the `ActionResult<T>` envelope** for server-action results (`{ ok, data | error }`).
- **Colocate tests** next to source as `*.test.ts(x)`.
- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `test:`, `chore:`, …).
- Formatting (Prettier) and linting (ESLint) run automatically on commit — see below.

## Testing & quality

```bash
pnpm test          # run the suite once
pnpm test:watch    # watch mode
pnpm test:cov      # run with coverage
```

Coverage thresholds are enforced in [`vitest.config.mts`](./vitest.config.mts):
**80%** lines / functions / statements and **70%** branches. UI primitives and route/layout
files are excluded from the count.

Git hooks (Husky):

- **pre-commit** runs lint-staged — ESLint (`--max-warnings=0`) + Prettier on staged files.
- **pre-push** runs additional checks before pushing.

CI runs a [gitleaks](https://github.com/gitleaks/gitleaks) scan to catch leaked secrets.

## Scripts

| Script              | Does                       |
| ------------------- | -------------------------- |
| `pnpm dev`          | Start the dev server       |
| `pnpm build`        | Production build           |
| `pnpm start`        | Serve the production build |
| `pnpm lint`         | ESLint                     |
| `pnpm test`         | Run tests once             |
| `pnpm test:watch`   | Run tests in watch mode    |
| `pnpm test:cov`     | Run tests with coverage    |
| `pnpm format`       | Prettier write             |
| `pnpm format:check` | Prettier check (no writes) |
