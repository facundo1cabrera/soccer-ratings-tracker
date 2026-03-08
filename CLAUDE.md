# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev           # Run all apps in dev mode (Turborepo)
pnpm build         # Build all apps
pnpm lint          # Lint all packages
pnpm check-types   # TypeScript type checking across all packages
pnpm format        # Prettier format all TS/TSX/MD files

# Run commands for just the web app (from apps/web/)
pnpm dev
pnpm lint
pnpm db:generate   # Regenerate Prisma client
pnpm db:push       # Push schema changes to DB
pnpm db:migrate    # Run migrations
pnpm db:studio     # Open Prisma Studio
```

There are no automated tests in this project.

## Architecture

**Turborepo monorepo** with:
- `apps/web` — Next.js 16 App Router application (primary codebase)
- `packages/ui` — Shared React component library
- `packages/eslint-config`, `packages/typescript-config` — Shared configs

### Key patterns

**Type-safe API client** (`lib/api-client.ts`): All API calls go through a generic `fetchApi<T>()` function that validates responses at runtime using Zod schemas. Schemas live in `lib/match-schemas.ts`. Use this pattern for all new API calls.

**API response shape**: Discriminated union `ApiResponse<T> = { success: true; data: T } | { success: false; error: string }`. API routes return this shape; `fetchApi` validates and unwraps it.

**Database access**: Prisma client singleton in `lib/prisma.ts`. Raw DB queries in `lib/*-db.ts` files, business logic in `lib/match-service.ts`. Keep these layers separate.

**Rating utilities**: All rating color/label/formatting logic is centralized in `lib/rating-utils.ts`. Do not inline rating formatting elsewhere.

**Authentication**: Clerk via middleware (`middleware.ts`). Most `/match/[id]/*` pages are public — unauthenticated users can view, join, and rate matches. Only the dashboard and `/match/create` require auth. User records are created just-in-time (not during auth).

### App Router structure

```
app/
  (public)/match/[id]/   — view, join, rate, share (no auth required)
  match/create/          — create match (auth required)
  player/[id]/           — player history
  api/                   — API routes mirroring page structure
components/
  ui/                    — Radix UI primitives (shadcn/ui pattern)
lib/                     — API client, DB queries, services, schemas, utils
```

### Database models (Prisma)

`User` → `Player` → `Match` via `Team` + `TeamPlayer`. `PlayerRating` stores per-match peer ratings. `RatingReveal` records one-time permanent reveals of anonymous ratings. Cascading deletes on match deletion.

### Environment variables needed

`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and Clerk redirect URL vars (see `apps/web/.env.example` or Clerk docs).
