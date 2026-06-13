# AGENTS.md — next-job-board

## Build / Lint / Test Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build (Next.js + TypeScript)
npm run lint       # ESLint (next/core-web-vitals + next/typescript)
npm run start      # Start production server
```

### Database (Drizzle + PostgreSQL)
```bash
npm run db:push      # Push schema to DB (no migration)
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```

### Services
```bash
npm run inngest      # Start Inngest dev server (uses localhost:3000)
npm run email        # Start React Email dev server (port 3001)
```

No test framework is configured — no `*.test.*` or `*.spec.*` files exist.

---

## Code Style Guidelines

### Directory Architecture (Feature-First)
```
features/{feature}/
  actions/      — Server actions (each file = "use server")
  components/   — Client/server components scoped to this feature
  db/           — Database queries + cache helpers
  lib/          — Pure utility functions (formatters, helpers)

services/{name}/    — Third-party integrations (clerk, inngest, resend, uploadthing)
components/{name}/  — Shared UI (ui/, sidebar/, dataTable/)
lib/                — Global utilities (cn, dataCache)
hooks/              — Global React hooks
```

### Imports
- Use `@/` path alias (mapped to project root in tsconfig.json paths).
- Group imports: external → internal. No blank-line separation between groups.
- shadcn imports from `@/components/ui/{name}`.
- Schema imports from `@/drizzle/schema` (re-exports all table modules).

### Naming Conventions
- **Components**: PascalCase (`JobListingBadges`, `DataTable`)
- **Functions/variables**: camelCase (`getCurrentUser`, `formatWage`)
- **DB tables**: PascalCase + `Table` suffix (`JobListingTable`, `UserTable`)
- **Files**: camelCase for utilities, PascalCase for components
- **Private/internal files**: underscore prefix (`_AppSidebarClient.tsx`, `_SidebarUserButtonClient.tsx`)
- **Enum arrays**: camelCase, plural (`experienceLevels`, `jobListingStatuses`)
- **Type aliases**: PascalCase (`ExperienceLevel`, `JobListingStatus`)

### Types
- `strict: true` in tsconfig.
- Use `satisfies` for const assertions (e.g., `satisfies ComponentProps<typeof Badge>`).
- Use `satisfies never` in default cases of exhaustive switches (formatters, utils).
- Prefer `z.infer<typeof schema>` for action parameter types.
- DB types: `typeof Table.$inferInsert` / `typeof Table.$inferSelect` with `Pick<>` for subsets.
- Use explicit return types on server actions (union of success/error shapes).

### Server Actions Pattern
```ts
"use server";

import { z } from "zod";

export async function actionName(unsafeData: z.infer<typeof schema>) {
  const { success, data } = schema.safeParse(unsafeData);
  if (!success) return { error: true, message: "..." };
  // ... logic
  return { error: false, message: "..." };
}
```
- Always use `safeParse`, never `parse`.
- Auth guard at top: check `getCurrentUser()` / `getCurrentOrganization()` / `hasOrgUserPermission()`.
- Return `{ error: boolean; message?: string }` for UI-friendly responses.
- Use `redirect()` from `next/navigation` for navigation outcomes.
- Comment blocks: `# Step Name` comment before each logical section.

### Database Access
- Export `db` from `@/drizzle/db` (drizzle-orm with node-postgres).
- Table schemas in `drizzle/schema/{table}.ts` with re-export from `drizzle/schema.ts`.
- Helper columns (id, createdAt, updatedAt) from `drizzle/schemaHelpers.ts`.
- Use `db.query.TableName.findFirst()` or `db.select()...from()` for reads.
- Use `db.insert().values().returning()`, `db.update().set().where().returning()`, `db.delete().where().returning()`.

### Caching
- Use Next.js `"use cache"` directive + `cacheTag()` from `next/dist/server/use-cache/cache-tag`.
- Cache tag helpers in `features/{feature}/db/cache/`: `get{Feature}GlobalTag()`, `get{Feature}IdTag(id)`, `revalidate{Feature}Cache(data)`.
- Base helpers in `lib/dataCache.ts`.

### CSS / Styling
- Tailwind CSS v4 with `@import "tailwindcss"`.
- CSS variables via `@theme inline {}` with oklch color space.
- Dark mode via `@media (prefers-color-scheme: dark)` custom variant.
- `cn()` utility from `lib/utils.ts` (clsx + tailwind-merge) for conditional classes.
- shadcn New York style (radius: 0.625rem).

### React Patterns
- Client components: `"use client"` directive at top.
- Props destructured inline in function signature.
- `ComponentProps` / `ComponentPropsWithRef` for native element extension.
- `useTransition()` for async server action calls from client.
- `Suspense` boundaries at page/layout level.
- Private sub-components prefixed with `_`.

### Error Handling
- Server actions: return `{ error: true, message }` objects, never throw.
- Formatters: exhaustive switch with `satisfies never` default.
- Permission checks: return early with error object.
- Zod: `safeParse` for validation — no try/catch on parsing.

### Environment Variables
- Validated with `@t3-oss/env-nextjs` in `data/env/server.ts` and `data/env/client.ts`.
- Public vars prefixed `NEXT_PUBLIC_`.
- Server-only vars in `server.ts`, client vars in `client.ts`.

### Key Libraries
- Authentication: Clerk (`@clerk/nextjs`)
- Validation: Zod + `@hookform/resolvers`
- Background jobs: Inngest
- Email: Resend + React Email
- File upload: UploadThing
- Tables: TanStack React Table
- Forms: React Hook Form + shadcn form components
- Icons: lucide-react
- Toasts: sonner
- Dates: date-fns
