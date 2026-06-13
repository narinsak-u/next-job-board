# Clerk → Better Auth + Custom Organization Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Clerk with Better Auth as the authentication and organization provider, with DB-backed permissions, teams, and plan features.

**Architecture:** Better Auth server at `auth.ts` with Drizzle adapter and organization plugin. No auth provider wrapper needed (cookie-based). Custom sign-in/sign-up/org-management UI replacing Clerk's hosted components. Inngest Clerk webhooks replaced by Better Auth lifecycle hooks. Permission checks query DB roles instead of Clerk API.

**Tech Stack:** better-auth, drizzle-orm (pg), Next.js App Router, shadcn/ui (React Hook Form + Zod for forms)

---

### Task 1: Install Better Auth and Create Server Config

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...all]/route.ts`
- Modify: `package.json`

- [ ] **Step 1: Install better-auth**

Run: `npm install better-auth @better-auth/cli`

- [ ] **Step 2: Create `auth.ts` at project root**

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import * as schema from "@/drizzle/schema"
import { db } from "@/drizzle/db"

export const auth = betterAuth({
  appName: "Next Job Board",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      teams: {
        enabled: true,
      },
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
})
```

- [ ] **Step 3: Create API route handler**

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth.handler)
```

- [ ] **Step 4: Commit**

```bash
git add auth.ts app/api/auth/[...all]/route.ts package.json package-lock.json
git commit -m "feat: install better-auth with server config and API route"
```

---

### Task 2: Update Environment Variables

**Files:**
- Modify: `.env`
- Modify: `.env.example`
- Modify: `data/env/server.ts`
- Modify: `data/env/client.ts`

- [ ] **Step 1: Add Better Auth env vars and remove Clerk env vars from `.env.example`**

Replace Clerk vars with:
```
# Better Auth
BETTER_AUTH_SECRET=your_better_auth_secret_min_32_chars
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe (for plan features)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

Remove these Clerk vars:
```
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

- [ ] **Step 2: Update `data/env/server.ts`**

```ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DB_PASSWORD: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_NAME: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    UPLOADTHING_TOKEN: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    SERVER_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
  },
  client: {},
  runtimeEnv: process.env,
})
```

- [ ] **Step 3: Update `data/env/client.ts`**

Remove all Clerk vars. The file becomes empty — keep it as a valid export or remove it entirely and update any imports.

```ts
import { createEnv } from "@t3-oss/env-nextjs"

export const env = createEnv({
  server: {},
  client: {},
  runtimeEnv: {},
})
```

- [ ] **Step 4: Generate Better Auth secret and update `.env`**

Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
Generate a 32+ char secret. Update `.env` with `BETTER_AUTH_SECRET=<generated>` and `BETTER_AUTH_URL=http://localhost:3000`. Keep existing Clerk vars in `.env` for now (they'll be removed in a later cleanup task — Better Auth and Clerk can coexist during migration).

- [ ] **Step 5: Commit**

```bash
git add data/env/server.ts data/env/client.ts .env.example
git commit -m "feat: add better-auth env vars, remove clerk env vars"
```

---

### Task 3: Run Better Auth Migration to Create Auth Tables

**Files:** None (CLI command)

- [ ] **Step 1: Run the Better Auth CLI migrate command**

Run: `npx @better-auth/cli@latest migrate --config auth.ts`

Expected: Better Auth creates its tables (`user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`, `team`) in the PostgreSQL database. These are added to the existing schema alongside current tables.

- [ ] **Step 2: Verify tables were created**

Connect to DB and check:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user', 'session', 'account', 'verification', 'organization', 'member', 'invitation', 'team');
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: run better-auth migration to create auth tables"
```

---

### Task 4: Create OrganizationPlanFeatures Table

**Files:**
- Create: `drizzle/schema/organizationPlanFeatures.ts`
- Modify: `drizzle/schema.ts`
- Create: `features/planFeatures/db/cache/planFeatures.ts`
- Create: `features/planFeatures/db/planFeatures.ts`

- [ ] **Step 1: Create the schema file**

```ts
// drizzle/schema/organizationPlanFeatures.ts
import { integer, pgTable, varchar } from "drizzle-orm/pg-core"

export const OrganizationPlanFeaturesTable = pgTable("organization_plan_features", {
  organizationId: varchar("organization_id").primaryKey(),
  maxPublishedJobListings: integer("max_published_job_listings"),
  maxFeaturedJobListings: integer("max_featured_job_listings"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
})
```

- [ ] **Step 2: Export from `drizzle/schema.ts`**

Add line:
```ts
export * from "./schema/organizationPlanFeatures"
```

- [ ] **Step 3: Create cache helpers**

```ts
// features/planFeatures/db/cache/planFeatures.ts
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { revalidateTag } from "next/cache"
import { getGlobalTag, getIdTag } from "@/lib/dataCache"

export function getPlanFeaturesGlobalTag() {
  return getGlobalTag("organizationPlanFeatures")
}

export function getPlanFeaturesIdTag(organizationId: string) {
  return getIdTag("organizationPlanFeatures", organizationId)
}

export function revalidatePlanFeaturesCache(organizationId: string) {
  revalidateTag(getPlanFeaturesGlobalTag(), "max")
  revalidateTag(getPlanFeaturesIdTag(organizationId), "max")
}
```

- [ ] **Step 4: Create DB query helpers**

```ts
// features/planFeatures/db/planFeatures.ts
import { db } from "@/drizzle/db"
import { OrganizationPlanFeaturesTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getPlanFeaturesIdTag, getPlanFeaturesGlobalTag } from "./cache/planFeatures"

export function getPlanFeatures(organizationId: string) {
  "use cache"
  cacheTag(getPlanFeaturesGlobalTag(), getPlanFeaturesIdTag(organizationId))

  return db.query.OrganizationPlanFeaturesTable.findFirst({
    where: eq(OrganizationPlanFeaturesTable.organizationId, organizationId),
  })
}

export function upsertPlanFeatures(
  organizationId: string,
  data: {
    maxPublishedJobListings?: number | null
    maxFeaturedJobListings?: number | null
    stripeSubscriptionId?: string | null
  }
) {
  return db
    .insert(OrganizationPlanFeaturesTable)
    .values({ organizationId, ...data })
    .onConflictDoUpdate({
      target: OrganizationPlanFeaturesTable.organizationId,
      set: data,
    })
    .returning()
}
```

- [ ] **Step 5: Push schema to DB**

Run: `npm run db:push`

- [ ] **Step 6: Commit**

```bash
git add drizzle/schema/organizationPlanFeatures.ts drizzle/schema.ts features/planFeatures/
git commit -m "feat: create organization plan features table and helpers"
```

---

#**Note on referencing Better Auth tables from Drizzle schema:** Better Auth's drizzle adapter manages its own tables internally and does not export Drizzle table definitions for external FK references. In your custom schema files, you have two options: (1) define a minimal schema entry for the Better Auth tables you need to reference, or (2) omit `.references()` and rely on application-level integrity. Use option 1 — define minimal table stubs for `user` and `organization` in a helper file like `drizzle/schema/betterAuthRefs.ts`.

## Task 5: Refactor UserTable and User-Related Tables

**Files:**
- Modify: `drizzle/schema/user.ts`
- Modify: `drizzle/schema/userResume.ts`
- Modify: `drizzle/schema/userNotificationSettings.ts`
- Modify: `drizzle/schema/jobListingApplication.ts`

- [ ] **Step 1: Create minimal Better Auth table references for Drizzle FK support**

```ts
// drizzle/schema/betterAuthRefs.ts
import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core"

export const betterAuthUser = pgTable("user", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
})

export const betterAuthOrganization = pgTable("organization", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  slug: varchar("slug"),
  logo: varchar("logo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
})

export const betterAuthMember = pgTable("member", {
  id: varchar("id").primaryKey(),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
})
```

- [ ] **Step 2: Export from `drizzle/schema.ts`**

Add:
```ts
export * from "./schema/betterAuthRefs"
```

- [ ] **Step 3: Refactor `UserTable` to reference Better Auth user table**

Better Auth's `user` table has columns: `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`. Remove the duplicate `UserTable` entirely — migrate custom columns to Better Auth's `user` table via `additionalFields`.

In `auth.ts`, add `user.additionalFields`:
```ts
user: {
  additionalFields: {
    clerkId: { type: "string", required: false }, // nullable — only for mapping old data if needed
  },
},
```

Since this is a fresh start, no clerkId mapping is needed. Remove `UserTable` schema file and export. The remaining user-related tables (`UserResumeTable`, `UserNotificationSettingsTable`, `JobListingApplicationTable`) need to reference Better Auth's `user.id`.

- [ ] **Step 4: Update `UserResumeTable` FK**

Change `userId` to reference Better Auth's `user.id`:
```ts
import { relations } from "drizzle-orm"
import { pgTable, varchar } from "drizzle-orm/pg-core"
import { user } from "./auth" // Better Auth exports the user table

export const UserResumeTable = pgTable("user_resumes", {
  userId: varchar("user_id")
    .notNull()
    .references(() => user.id),
  resumeFileUrl: varchar("resume_file_url").notNull(),
  resumeFileKey: varchar("resume_file_key").notNull(),
  aiSummary: varchar("ai_summary"),
  createdAt: createdAt,
  updatedAt: updatedAt,
})
```

Better Auth exports its schema. Import `user` from `@/drizzle/schema/auth` (Better Auth generates this file during migration, at `drizzle/schema/auth.ts`).

Update the import to use `betterAuthUser` from `@/drizzle/schema`:
```ts
import { betterAuthUser } from "@/drizzle/schema"

userId: varchar("user_id")
  .notNull()
  .references(() => betterAuthUser.id),
```

- [ ] **Step 5: Update `UserNotificationSettingsTable` FK same way**

- [ ] **Step 6: Update `JobListingApplicationTable.userId` FK same way**

- [ ] **Step 7: Update `drizzle/schema.ts`**

Remove the old `UserTable` export. Keep `betterAuthRefs` export.

- [ ] **Step 8: Push schema**

Run: `npm run db:push`

- [ ] **Step 9: Commit**

```bash
git add drizzle/schema/user.ts drizzle/schema/userResume.ts drizzle/schema/userNotificationSettings.ts drizzle/schema/jobListingApplication.ts drizzle/schema.ts
git commit -m "refactor: update user-related table FKs to reference better-auth user table"
```

---

### Task 6: Refactor OrganizationTable and Related Tables

**Files:**
- Modify: `drizzle/schema/organization.ts`
- Modify: `drizzle/schema/organizationUserSettings.ts`
- Modify: `drizzle/schema/jobListing.ts`

- [ ] **Step 1: Remove `OrganizationTable`**

Better Auth's org plugin creates its own `organization` table. Remove the custom `OrganizationTable` schema. If any custom fields are needed, add them via `schema.organization.additionalFields` in `auth.ts`:
```ts
organization({
  schema: {
    organization: {
      additionalFields: {
        billingId: { type: "string", required: false },
      },
    },
  },
})
```

- [ ] **Step 2: Refactor `JobListingTable.organizationId` FK**

Change FK to reference `betterAuthOrganization`:
```ts
import { betterAuthOrganization } from "@/drizzle/schema"

organizationId: varchar("organization_id")
  .notNull()
  .references(() => betterAuthOrganization.id, { onDelete: "cascade" }),
```

- [ ] **Step 3: Refactor `OrganizationUserSettingsTable`**

Now that Better Auth's `member` table tracks membership, slim this table to only notification preferences. FK to `betterAuthOrganization.id` and `betterAuthUser.id`:

```ts
import { pgTable, varchar, boolean, integer, primaryKey } from "drizzle-orm/pg-core"
import { betterAuthUser, betterAuthOrganization } from "@/drizzle/schema"

export const OrganizationUserSettingsTable = pgTable("organization_user_settings", {
  userId: varchar("user_id")
    .notNull()
    .references(() => betterAuthUser.id),
  organizationId: varchar("organization_id")
    .notNull()
    .references(() => betterAuthOrganization.id),
  newApplicationEmailNotifications: boolean("new_application_email_notifications").notNull().default(false),
  minimumRating: integer("minimum_rating"),
}, (table) => [primaryKey({ columns: [table.userId, table.organizationId] })])
```

- [ ] **Step 4: Update `drizzle/schema.ts`**

Remove old `OrganizationTable` export.

- [ ] **Step 5: Push schema**

Run: `npm run db:push`

- [ ] **Step 6: Commit**

```bash
git add drizzle/schema/organization.ts drizzle/schema/organizationUserSettings.ts drizzle/schema/jobListing.ts drizzle/schema.ts
git commit -m "refactor: update org-related table FKs to reference better-auth org table"
```

---

### Task 7: Rewrite Auth Helpers

**Files:**
- Create: `services/better-auth/lib/getCurrentAuth.ts`
- Create: `services/better-auth/lib/orgUserPermissions.ts`
- Create: `services/better-auth/lib/planFeatures.ts`

- [ ] **Step 1: Create `getCurrentAuth.ts`**

```ts
import { auth } from "@/auth"
import { headers } from "next/headers"

export async function getCurrentUser({ allData = false }: { allData?: boolean } = {}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { userId: null, user: null }
  
  if (allData) {
    return { userId: session.user.id, user: session.user }
  }
  return { userId: session.user.id, user: null }
}

export async function getCurrentOrganization({ allData = false }: { allData?: boolean } = {}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.session.activeOrganizationId) return { orgId: null, organization: null }

  const orgId = session.session.activeOrganizationId
  if (allData) {
    const org = await auth.api.getFullOrganization({ headers: await headers() })
    return { orgId, organization: org }
  }
  return { orgId, organization: null }
}
```

- [ ] **Step 2: Create `orgUserPermissions.ts`**

Better Auth's `organization.hasPermission()` checks against the active org's role/permission set stored in DB.

```ts
import { auth } from "@/auth"
import { headers } from "next/headers"

export type UserPermission =
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete"
  | "job_listing:change_status"
  | "application:change_rating"
  | "application:change_stage"

export async function hasOrgUserPermission(permission: UserPermission) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.session.activeOrganizationId) return false

  const { data } = await auth.api.hasPermission({ headers: await headers(), body: { permission } })
  return data?.hasPermission ?? false
}
```

- [ ] **Step 3: Create `planFeatures.ts`**

Query the `OrganizationPlanFeatures` table instead of Clerk entitlements.

```ts
import { getCurrentOrganization } from "./getCurrentAuth"
import { getPlanFeatures } from "@/features/planFeatures/db/planFeatures"

export async function hasPlanFeature(
  feature: "max_published_job_listings" | "max_featured_job_listings"
): Promise<number | null> {
  const { orgId } = await getCurrentOrganization()
  if (!orgId) return null

  const features = await getPlanFeatures(orgId)
  if (!features) return null

  switch (feature) {
    case "max_published_job_listings":
      return features.maxPublishedJobListings ?? null
    case "max_featured_job_listings":
      return features.maxFeaturedJobListings ?? null
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add services/better-auth/
git commit -m "feat: rewrite auth helpers for better-auth"
```

---

### Task 8: Create Middleware

**Files:**
- Create: `middleware.ts`
- Delete: `proxy.ts`

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { betterAuth } from "better-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicRoutes = ["/sign-in", "/sign-up", "/", "/api", "/job-listings", "/ai-search"]
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))
  
  if (isPublic) return NextResponse.next()

  const session = await betterAuth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
```

- [ ] **Step 2: Delete `proxy.ts`**

Remove the old Clerk middleware file.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git rm proxy.ts
git commit -m "feat: replace clerk middleware with better-auth middleware"
```

---

### Task 9: Build Sign-In Page

**Files:**
- Create: `app/sign-in/page.tsx`
- Create: `app/sign-up/page.tsx`
- Create: `services/better-auth/components/AuthForm.tsx`
- Create: `services/better-auth/lib/client.ts`

- [ ] **Step 1: Create Better Auth client**

```ts
// services/better-auth/lib/client.ts
import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [organizationClient()],
})
```

- [ ] **Step 2: Create shared auth form component**

```tsx
// services/better-auth/components/AuthForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "../lib/client"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    })

    if (signInError) {
      setError(signInError.message ?? signInError.code)
      return
    }

    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  )
}

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    })

    if (signUpError) {
      setError(signUpError.message ?? signUpError.code)
      return
    }

    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">Create Account</Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}>
        Google
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/" })}>
        GitHub
      </Button>
    </form>
  )
}
```

- [ ] **Step 3: Create sign-in page**

```tsx
// app/sign-in/page.tsx
import { SignInForm } from "@/services/better-auth/components/AuthForm"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">Welcome back to Job Board</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create sign-up page**

```tsx
// app/sign-up/page.tsx
import { SignUpForm } from "@/services/better-auth/components/AuthForm"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Start finding or posting jobs</p>
        </div>
        <SignUpForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <a href="/sign-in" className="underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/sign-in/ app/sign-up/ services/better-auth/components/ services/better-auth/lib/client.ts
git commit -m "feat: build sign-in and sign-up pages with better-auth"
```

---

### Task 10: Build Organization Select and Create Page

**Files:**
- Create: `app/org-select/page.tsx`

- [ ] **Step 1: Create org selection page**

```tsx
// app/org-select/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/services/better-auth/lib/client"

export default function OrgSelectPage() {
  const [orgs, setOrgs] = useState<{ id: string; name: string; logo: string | null }[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    authClient.organization.list().then(({ data }) => {
      if (data) setOrgs(data)
    })
  }, [])

  async function selectOrg(orgId: string) {
    const { error } = await authClient.organization.setActive({ organizationId: orgId })
    if (error) { setError(error.message); return }
    router.push("/employer")
  }

  async function createOrg() {
    if (!newOrgName.trim()) return
    const { data, error: createError } = await authClient.organization.create({ name: newOrgName })
    if (createError) { setError(createError.message); return }
    if (data) await selectOrg(data.id)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select Organization</h1>
          <p className="text-muted-foreground">Choose an organization to manage</p>
        </div>

        <div className="space-y-2">
          {orgs.map((org) => (
            <Button
              key={org.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => selectOrg(org.id)}
            >
              {org.name}
            </Button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {showCreate ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} />
            </div>
            <Button onClick={createOrg} className="w-full">Create</Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setShowCreate(true)}>
            Create Organization
          </Button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/org-select/
git commit -m "feat: build org selection and creation page"
```

---

### Task 11: Build Organization Settings Page

**Files:**
- Create: `app/org-settings/page.tsx`
- Create: `services/better-auth/components/OrgMembersList.tsx`
- Create: `services/better-auth/components/OrgInviteForm.tsx`

- [ ] **Step 1: Create org members list component**

```tsx
// services/better-auth/components/OrgMembersList.tsx
"use client"

import { useEffect, useState } from "react"
import { authClient } from "../lib/client"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  userId: string
  role: string
  user: { name: string; email: string; image: string | null }
}

export function OrgMembersList() {
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    authClient.organization.listMembers().then(({ data }) => {
      if (data) setMembers(data as Member[])
    })
  }, [])

  async function updateRole(memberId: string, role: string) {
    const { error } = await authClient.organization.updateMemberRole({ memberId, role })
    if (error) setError(error.message)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Members</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm capitalize">{member.role}</span>
              {member.role !== "owner" && (
                <Button variant="outline" size="sm" onClick={() => updateRole(member.id, member.role === "admin" ? "member" : "admin")}>
                  Toggle Role
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create org invite form component

```tsx
// services/better-auth/components/OrgInviteForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "../lib/client"

export function OrgInviteForm() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [status, setStatus] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    const { error } = await authClient.organization.inviteMember({ email, role })
    if (error) { setStatus(error.message); return }
    setStatus("Invitation sent!")
    setEmail("")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Invite Member</h2>
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inviteEmail">Email Address</Label>
          <Input id="inviteEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {status && <p className="text-sm" data-status={status === "Invitation sent!" ? "success" : "error"}>{status}</p>}
        <Button type="submit">Send Invitation</Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create org settings page**

```tsx
// app/org-settings/page.tsx
"use client"

import { OrgMembersList } from "@/services/better-auth/components/OrgMembersList"
import { OrgInviteForm } from "@/services/better-auth/components/OrgInviteForm"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OrgSettingsPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <Button variant="outline" onClick={() => router.push("/employer")}>
          Back to Dashboard
        </Button>
      </div>
      <OrgMembersList />
      <OrgInviteForm />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/org-settings/ services/better-auth/components/OrgMembersList.tsx services/better-auth/components/OrgInviteForm.tsx
git commit -m "feat: build org settings page with member management"
```

---

### Task 12: Update Sidebar Components

**Files:**
- Modify: `features/users/components/_SidebarUserButtonClient.tsx`
- Modify: `features/organizations/components/_SidebarOrganizationButtonClient.tsx`
- Modify: `components/sidebar/SidebarNavMenuGroup.tsx`
- Modify: `components/sidebar/AppSidebar.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `useClerk().openUserProfile()` in `_SidebarUserButtonClient.tsx`**

Replace with link to `/user-settings` or use `authClient` session data:
```tsx
import { authClient } from "@/services/better-auth/lib/client"
// In component:
const { data: session } = authClient.useSession()
// Replace openUserProfile with:
// <Link href="/user-settings">Manage Account</Link>
```

- [ ] **Step 2: Replace `useClerk().openOrganizationProfile()` in `_SidebarOrganizationButtonClient.tsx`**

Replace with link to `/org-settings`:
```tsx
// Replace:
// const { openOrganizationProfile } = useClerk()
// <button onClick={() => openOrganizationProfile()}>Manage Organization</button>
// With:
// <Link href="/org-settings">Manage Organization</Link>
```

- [ ] **Step 3: Remove Clerk's `SignedIn`/`SignedOut` from `SidebarNavMenuGroup.tsx`**

Replace with `authClient.useSession()` based conditional rendering.

- [ ] **Step 4: Update `AppSidebar.tsx`**

Replace `auth()` from Clerk with `authClient` equivalent.

- [ ] **Step 5: Remove `ClerkProvider` from `app/layout.tsx`**

```tsx
// Remove import and wrapper:
// import { ClerkProvider } from "@/services/clerk/components/ClerkProvider"
// <ClerkProvider>...</ClerkProvider>
// Just keep children directly
```

- [ ] **Step 6: Commit**

```bash
git add features/users/components/_SidebarUserButtonClient.tsx features/organizations/components/_SidebarOrganizationButtonClient.tsx components/sidebar/ components/sidebar/AppSidebar.tsx app/layout.tsx
git commit -m "refactor: replace clerk components with better-auth in sidebar and layout"
```

---

### Task 13: Remove Clerk Webhook Handlers from Inngest

**Files:**
- Delete: `services/inngest/functions/clerk.ts`
- Modify: `services/inngest/client.ts`
- Modify: `app/api/inngest/route.ts`

- [ ] **Step 1: Remove Clerk event types from `services/inngest/client.ts`**

Remove all clerk-related event definitions (`clerkCreateUser`, `clerkUpdateUser`, etc.) and the `clerkDataSchema`.

- [ ] **Step 2: Delete `services/inngest/functions/clerk.ts`**

Remove the file entirely.

- [ ] **Step 3: Remove Clerk function imports from `app/api/inngest/route.ts`**

Remove all 8 Clerk function imports and their registrations from the `serve()` call.

- [ ] **Step 4: Commit**

```bash
git rm services/inngest/functions/clerk.ts
git add services/inngest/client.ts app/api/inngest/route.ts
git commit -m "refactor: remove clerk webhook handlers from inngest"
```

---

### Task 14: Clean Up Remaining Clerk Code

**Files:**
- Delete: `services/clerk/` (entire directory)
- Delete: `app/(clerk)/` (entire route group)
- Modify: `features/jobListings/actions/actions.ts` — update import paths
- Modify: `features/jobListingApplications/actions/actions.ts` — update import paths
- Modify: `features/jobListings/lib/planfeatureHelpers.ts` — update import paths
- Modify: `features/organizations/db/organizationUserSettings.ts` — update queries
- Modify: `features/users/db/users.ts` — remove or update to use Better Auth
- Modify: `features/users/db/userNotificationSettings.ts` — update FKs
- Modify: `app/employer/layout.tsx` — update import paths for permissions
- Modify: `app/(job-seeker)/layout.tsx` — update auth import
- Modify: `app/employer/job-listings/[jobListingId]/page.tsx` — update permission imports
- Modify: `services/inngest/functions/email.ts` — update any Clerk-related imports

- [ ] **Step 1: Delete `services/clerk/` directory**

`git rm -r services/clerk/`

- [ ] **Step 2: Delete `app/(clerk)/` directory**

`git rm -r app/\(clerk\)/`

- [ ] **Step 3: Update all import paths from `services/clerk/lib/` to `services/better-auth/lib/`**

Every file that imports from `@/services/clerk/lib/getCurrentAuth` → `@/services/better-auth/lib/getCurrentAuth` (same for permissions and plan features).

Files to update:
- `features/jobListings/actions/actions.ts`
- `features/jobListingApplications/actions/actions.ts`
- `features/jobListings/lib/planfeatureHelpers.ts`
- `app/employer/layout.tsx`
- `app/(job-seeker)/layout.tsx`
- `app/employer/job-listings/[jobListingId]/page.tsx`
- `app/employer/page.tsx`
- `app/employer/job-listings/new/page.tsx`
- `app/employer/job-listings/[jobListingId]/edit/page.tsx`
- `app/employer/user-settings/page.tsx`
- `features/organizations/db/organizationUserSettings.ts`
- `services/inngest/functions/email.ts`

- [ ] **Step 4: Remove Clerk packages from `package.json`**

Remove `@clerk/nextjs` and `@clerk/themes` from dependencies.

Run: `npm uninstall @clerk/nextjs @clerk/themes`

- [ ] **Step 5: Commit**

```bash
git rm -r services/clerk/ app/\(clerk\)/
git add -A
git commit -m "refactor: remove all remaining clerk code and imports"
```

---

### Task 15: Update Plan Feature Helpers to Use DB

**Files:**
- Modify: `features/jobListings/lib/planfeatureHelpers.ts`

- [ ] **Step 1: Rewrite `planfeatureHelpers.ts` to query DB plan features**

```ts
import { getCurrentOrganization } from "@/services/better-auth/lib/getCurrentAuth"
import { getPlanFeatures } from "@/features/planFeatures/db/planFeatures"
import { countJobListingsByOrganization, countFeaturedJobListingsByOrganization } from "@/features/jobListings/db/jobListings"

export async function hasReachedMaxPublishedJobListings(): Promise<{ reached: boolean; max: number | null }> {
  const { orgId } = await getCurrentOrganization()
  if (!orgId) return { reached: true, max: null }

  const features = await getPlanFeatures(orgId)
  const max = features?.maxPublishedJobListings ?? null
  if (max === null) return { reached: false, max: null }

  const currentCount = await countJobListingsByOrganization(orgId)
  return { reached: currentCount >= max, max }
}

export async function hasReachedMaxFeaturedJobListings(): Promise<{ reached: boolean; max: number | null }> {
  const { orgId } = await getCurrentOrganization()
  if (!orgId) return { reached: true, max: null }

  const features = await getPlanFeatures(orgId)
  const max = features?.maxFeaturedJobListings ?? null
  if (max === null) return { reached: false, max: null }

  const currentCount = await countFeaturedJobListingsByOrganization(orgId)
  return { reached: currentCount >= max, max }
}
```

- [ ] **Step 2: Update callers of `hasReachedMaxPublishedJobListings`**

The old function returned `boolean`. The new one returns `{ reached: boolean; max: number | null }`. Update all callers in `features/jobListings/actions/actions.ts` and `app/employer/job-listings/[jobListingId]/page.tsx`:
```ts
// Before:
if (await hasReachedMaxPublishedJobListings()) return { error: true, message: "..." }

// After:
const { reached } = await hasReachedMaxPublishedJobListings()
if (reached) return { error: true, message: "..." }
```

- [ ] **Step 3: Commit**

```bash
git add features/jobListings/lib/planfeatureHelpers.ts features/jobListings/actions/actions.ts app/employer/job-listings/[jobListingId]/page.tsx
git commit -m "refactor: migrate plan feature checks from clerk to db"
```

---

### Task 16: Update Existing Custom Tables and DB Queries

**Files:**
- Modify: `features/users/db/users.ts` — rewrite to work with Better Auth user table
- Modify: `features/users/db/userNotificationSettings.ts` — update FK query patterns
- Modify: `features/organizations/db/organizationUserSettings.ts` — update FK query patterns
- Modify: `features/organizations/db/organizations.ts` — remove (org table handled by Better Auth)
- Modify: `features/users/db/cache/users.ts` — update cache tags
- Modify: `features/organizations/db/cache/organizations.ts` — remove or update

- [ ] **Step 1: Update user DB queries**

Remove `insertUser`, `updateUser`, `deleteUser` (Better Auth handles user lifecycle). Keep or rewrite user notification settings queries to reference Better Auth user IDs.

- [ ] **Step 2: Remove org DB queries**

Remove `insertOrganization`, `updateOrganization`, `deleteOrganization` (Better Auth handles org lifecycle via plugin). Keep `OrganizationUserSettings` queries with updated FKs.

- [ ] **Step 3: Update cache tag helpers**

Remove or update cache tags that referenced removed tables.

- [ ] **Step 4: Commit**

```bash
git add features/users/db/ features/organizations/db/
git commit -m "refactor: update db queries for better-auth schema"
```

---

### Task 17: Update Seed Script

**Files:**
- Modify: `scripts/seed.ts`

- [ ] **Step 1: Update seed script to work without Clerk**

The seed script currently reads `ORGANIZATION_ID` from env and uses it directly. With Better Auth, org IDs come from Better Auth. Update to:

```ts
// Remove env.ORGANIZATION_ID — create a fresh org using Better Auth's API
import { auth } from "@/auth"

// Create a test organization
const org = await auth.api.createOrganization({
  body: {
    name: "Test Company",
    slug: "test-company",
    userId: "replace-with-seeded-user-id", // needs a user first
  },
})

const organizationId = org.id
```

The seed script needs a user to exist first. Either:
1. Create a test user via Better Auth API first, then create org with that user
2. Or create an org and manually insert a member

- [ ] **Step 2: Commit**

```bash
git add scripts/seed.ts
git commit -m "fix: update seed script for better-auth"
```

---

### Task 18: Add Better Auth Lifecycle Hooks for DB Sync

**Files:**
- Modify: `auth.ts`

- [ ] **Step 1: Add database hooks to `auth.ts`**

Replace what the Inngest Clerk webhooks did:
- On user sign-up → create `UserNotificationSettings` row
- On org creation → create `OrganizationPlanFeatures` row with default limits for free plan
- On org deletion → cleanup

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import * as schema from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { UserNotificationSettingsTable } from "@/drizzle/schema/userNotificationSettings"
import { OrganizationPlanFeaturesTable } from "@/drizzle/schema/organizationPlanFeatures"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true },
      hooks: {
        organization: {
          afterCreate: async ({ organization }) => {
            await db.insert(OrganizationPlanFeaturesTable).values({
              organizationId: organization.id,
              maxPublishedJobListings: 3, // Free tier default
              maxFeaturedJobListings: 1,
            }).onConflictDoNothing()
          },
        },
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(UserNotificationSettingsTable).values({
            userId: user.id,
          }).onConflictDoNothing()
        },
      },
    },
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add auth.ts
git commit -m "feat: add better-auth lifecycle hooks for db sync"
```

---

### Task 19: Final Build Verification

- [ ] **Step 1: Run TypeScript build**

Run: `npm run build`

Expected: no TypeScript errors. If errors appear:
- Missing imports → fix import paths (especially old Clerk paths)
- Type mismatches on `hasPlanFeature()` → update callers if return type changed
- Missing `BetterAuthClient` → ensure `services/better-auth/lib/client.ts` is correct
- Missing table imports → ensure all refactored schema files export correctly

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Fix any lint errors.

- [ ] **Step 3: Verify the dev server starts**

Run: `npm run dev`
Visit `http://localhost:3000`.
Visit `http://localhost:3000/api/auth/ok` — should return `{ status: "ok" }`.

- [ ] **Step 4: Test sign-up flow**

1. Go to `/sign-up`
2. Create account with email/password
3. Verify redirect to `/`
4. Check that `user_notification_settings` row was created for the user

- [ ] **Step 5: Test org creation**

1. Create an organization via `/org-select`
2. Verify redirect to `/employer`
3. Check that `organization_plan_features` row was created with default limits

- [ ] **Step 6: Verify permission gating**

In employer dashboard, verify that Add Job Listing button is shown (user is owner = full permissions).

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build and lint errors after clerk migration"
```
