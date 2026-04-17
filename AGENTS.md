# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Dev (runs nextjs + drizzle studio + database)
bun dev

# Type checking
bun tsc

# Lint/format
bun check       # check only
bun format      # fix + format

# Database
bun db:push     # push schema to db

# Auth schema generation (after modifying better-auth config)
bun auth:generate

# Add shadcn component
bun ui-add
```

## Architecture

Turborepo monorepo with bun. Packages:

- `apps/nextjs` - Next.js 16 app (App Router)
- `packages/api` - tRPC routers + procedures (`publicProcedure`, `protectedProcedure`)
- `packages/auth` - better-auth config, exports `initAuth()` factory
- `packages/db` - Drizzle ORM + Neon Postgres, exports `db` client and schema
- `packages/ui` - shadcn/tailwind components (radix + base-ui)
- `packages/utils` - shared utils + env validation (t3-oss/env)
- `tooling/tailwind` - shared tailwind config
- `tooling/typescript` - shared tsconfig

## Key Patterns

**tRPC**: Routers in `packages/api/src/router/`. Use `publicProcedure` or `protectedProcedure`. Context has `db`, `session`, `authApi`.

**Server components**: Use `trpc` from `~/trpc/server` + `prefetch()` for RSC data fetching.

**Client components**: Use `useTRPC()` from `~/trpc/react` hook.

**Auth**: better-auth with Google OAuth. `auth` instance in `apps/nextjs/src/auth/server.ts`. Client auth via `@finchat/auth/client`.

**DB**: Drizzle with Neon. Schema in `packages/db/src/schema.ts`. Auth tables auto-generated.

**Env vars**: Validated via t3-env in `packages/utils/src/env.ts`. Required: `DATABASE_URL`, `AUTH_GOOGLE_CLIENT_ID`, `AUTH_GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` (prod only).

## Code Style

- Named exports (no default exports)
- Biome for linting/formatting
- Tailwind classes auto-sorted

## Methodology:
TDD - Always implement a test before implement the feature.