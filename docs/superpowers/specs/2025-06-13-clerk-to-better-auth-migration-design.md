# Clerk → Better Auth + Custom Organization Migration

**Date:** 2025-06-13
**Status:** Draft

## Overview

Replace Clerk (`@clerk/nextjs@^7.5.2`) with Better Auth as the primary authentication and organization management provider. Motivation: unlock custom organization features — DB-backed roles/permissions, org hierarchies via teams, self-serve org provisioning, and DB-stored plan features — which Clerk's Dashboard-based model cannot provide.

## Scope

All Clerk-related code removed across 13 files. Auth middleware (`proxy.ts`), auth provider (`ClerkProvider`), server auth helpers (`services/clerk/lib/*`), Clerk UI components (sign-in page, org selection, org profile modal, pricing table), and 8 Inngest Clerk webhook handlers all replaced with Better Auth equivalents. Database schema refactored: Clerk ID-based primary keys replaced with Better Auth native IDs. `OrganizationUserSettingsTable` split — membership tracked by Better Auth's `member` table, notification preferences kept in a slimmed-down custom table.

## Current Architecture (Clerk)

- **Auth provider:** `@clerk/nextjs@^7.5.2` with `@clerk/themes` for dark mode
- **Server auth:** `auth()` from `@clerk/nextjs/server` yields `userId`, `orgId`, and permission/feature checks via `auth().has()`
- **Client auth:** `useAuth()` for `isSignedIn`, `useClerk()` for user/org profile modals
- **Middleware:** `clerkMiddleware` + `createRouteMatcher` in `proxy.ts`
- **Sign-in page:** Clerk's `<SignIn>` component at `app/(clerk)/sign-in/[[...sign-in]]/`
- **Org selection:** Clerk's `<OrganizationList>` at `app/(clerk)/organizations/select/`
- **Org management:** Clerk modal via `useClerk().openOrganizationProfile()`
- **Permissions:** 6 org-level permissions stored in Clerk Dashboard, checked via `auth().has({ permission })`
- **Plan features:** 5 plan features stored as Clerk entitlements, checked via `auth().has({ feature })`
- **Webhooks:** 8 Inngest functions in `services/inngest/functions/clerk.ts` sync Clerk events (user/org CRUD, membership join/leave) to local DB
- **DB PKs:** `UserTable.id` = Clerk `user_xxx`, `OrganizationTable.id` = Clerk `org_xxx` — cascading FKs through all related tables
- **Org membership:** Dual-purpose `OrganizationUserSettingsTable` (composite PK `userId` + `organizationId`) tracks both membership and notification preferences

## Target Architecture (Better Auth)

### Auth Setup

New `auth.ts` at project root:

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import { db } from "@/drizzle/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true },
      sendInvitationEmail: async (data) => { /* Resend email */ },
    }),
  ],
})
```

### Route Handler

New `app/api/auth/[...all]/route.ts` using `{ GET, POST }` from `better-auth/next-js`.

### Schema Changes

**Removed tables (Clerk):**
- `UserTable` — replaced by Better Auth's `user` table (custom fields via `additionalFields`)
- `OrganizationTable` — replaced by Better Auth's `organization` table (custom fields via `schema.organization.additionalFields`)

**New tables (Better Auth auto-generated):**
- `user`, `session`, `account`, `verification` — auth core
- `organization`, `member`, `invitation`, `team` — org plugin

**Refactored existing tables:**
- `OrganizationUserSettingsTable` → split: membership tracked by Better Auth's `member` table; notification preferences kept as updated `OrganizationUserSettingsTable` with FK to `organization.id` + `user.id`
- `JobListingTable.organizationId` → FK to Better Auth's `organization.id` (varchar, same type, different ID format)
- `JobListingApplicationTable.userId` → FK to Better Auth's `user.id`
- `UserResumeTable.userId` → FK to Better Auth's `user.id`
- `UserNotificationSettingsTable.userId` → FK to Better Auth's `user.id`

**New custom table:**
- `OrganizationPlanFeatures(organizationId PK FK, maxPublishedJobListings integer?, maxFeaturedJobListings integer?, stripeSubscriptionId varchar?)`

### Permission / RBAC

Better Auth's `dynamicAccessControl` addon replaces Clerk Dashboard-based permissions:

- 6 existing Clerk permissions remapped to scopeless names
- Roles (owner, admin, member) predefined by Better Auth; custom roles creatable via `createRole()` API
- `hasOrgUserPermission()` wrapper rewritten: queries member's role → permission set from DB instead of `auth().has()`
- 11 permission check sites across feature files — same function signature, internals swapped

Plan features rewrite: `hasPlanFeature()` reads `OrganizationPlanFeatures` table and compares against current counts instead of calling `auth().has({ feature })`.

### UI Changes

**Removed:**
- `services/clerk/` — entire directory (6 files)
- `app/(clerk)/` — route group (sign-in page, org selection page)
- `proxy.ts` — clerkMiddleware

**New custom pages:**
- `/sign-in` — email/password + social login, shadcn form components
- `/sign-up` — registration form, email verification flow
- `/org-select` — list user's orgs with `setActive()`, "Create Organization" button
- `/org-settings` — member list with role management, invite members, manage teams
- `/employer/pricing` — custom pricing page with Stripe integration

**Existing file changes:**
- `services/clerk/components/AuthButtons.tsx` → replaced by direct `authClient.signIn()` calls
- `services/clerk/components/SignInStatus.tsx` → replaced by `authClient.useSession()`
- `services/clerk/components/ClerkProvider.tsx` → removed, no provider wrapper needed
- `services/clerk/components/PricingTable.tsx` → removed, custom pricing page
- `services/clerk/lib/getCurrentAuth.ts` → rewritten to use Better Auth `getSession()`
- `services/clerk/lib/orgUserPermissions.ts` → rewritten to query DB roles/permissions
- `services/clerk/lib/planFeatures.ts` → rewritten to query `OrganizationPlanFeatures` table
- `features/users/components/_SidebarUserButtonClient.tsx` → `useClerk().openUserProfile()` → link to `/user-settings`
- `features/organizations/components/_SidebarOrganizationButtonClient.tsx` → `useClerk().openOrganizationProfile()` → link to `/org-settings`

### Inngest Changes

**Removed:** All 8 Clerk webhook handlers from `services/inngest/functions/clerk.ts`
**Removed:** Clerk event types from `services/inngest/client.ts`

Better Auth handles user/org lifecycle natively (no webhook syncing needed). Lifecycle hooks via Better Auth's `databaseHooks` or plugin `hooks` replace webhook-driven sync:
- `databaseHooks.user.create.after` → create `UserNotificationSettings`
- `organization.hooks.afterCreate` → create `OrganizationPlanFeatures` row
- `organization.hooks.beforeDelete` → cleanup

### Environment Variables

**Removed:**
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Added:**
- `BETTER_AUTH_SECRET` — encryption secret (min 32 chars)
- `BETTER_AUTH_URL` — base URL (e.g., `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth credentials
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — for plan subscriptions

## Migration Order

1. Install `better-auth` and configure `auth.ts` + route handler
2. Run `npx @better-auth/cli migrate` to create auth tables
3. Refactor existing tables (update FKs, split `OrganizationUserSettingsTable`)
4. Create `OrganizationPlanFeatures` table
5. Rewrite auth helpers (`getCurrentAuth`, permissions, plan features)
6. Replace middleware (`proxy.ts` → standard middleware)
7. Build new sign-in / sign-up / org-select / org-settings pages
8. Rewrite UI components (sidebar user/org buttons)
9. Remove Clerk webhook handlers, add Better Auth lifecycle hooks
10. Remove Clerk packages, env vars, and remaining dead code
11. Update `data/env/server.ts` and `data/env/client.ts` with new env vars
12. Fresh DB seed with `npm run db:seed` (seed script may need org ID update)
13. Verify: sign-up flow, org creation, permission checks, plan gating, job listing CRUD

## Files to Delete

- `proxy.ts`
- `services/clerk/` (entire directory, 6 files)
- `app/(clerk)/` (entire route group)
- `services/inngest/functions/clerk.ts`
- `data/env/client.ts` (Clerk entries removed)
- `data/env/server.ts` (Clerk entries removed)
- `.env.example` (Clerk entries removed)

## Files to Create

- `auth.ts`
- `app/api/auth/[...all]/route.ts`
- `app/sign-in/page.tsx`
- `app/sign-up/page.tsx`
- `app/org-select/page.tsx`
- `app/org-settings/page.tsx`
- `app/accept-invite/page.tsx`
- `middleware.ts`
- `drizzle/schema/organizationPlanFeatures.ts`
- `features/planFeatures/db/*.ts` (queries + cache helpers)
- `features/planFeatures/lib/planfeatureHelpers.ts`
- `services/better-auth/lib/getCurrentAuth.ts`
- `services/better-auth/lib/orgUserPermissions.ts`
- `services/better-auth/lib/planFeatures.ts`

## Files to Modify

- `drizzle/schema/user.ts` — refactor to link with Better Auth user table
- `drizzle/schema/organization.ts` — refactor to link with Better Auth org table
- `drizzle/schema/organizationUserSettings.ts` — slim down, update FKs
- `drizzle/schema/jobListing.ts` — update FK reference
- `drizzle/schema/jobListingApplication.ts` — update FK reference
- `drizzle/schema/userResume.ts` — update FK reference
- `drizzle/schema/userNotificationSettings.ts` — update FK reference
- `app/layout.tsx` — remove ClerkProvider
- `app/employer/layout.tsx` — permission check update
- `app/(job-seeker)/layout.tsx` — auth check update
- `components/sidebar/AppSidebar.tsx` — auth import update
- `components/sidebar/SidebarNavMenuGroup.tsx` — remove Clerk SignedIn/SignedOut
- `features/users/components/_SidebarUserButtonClient.tsx` — replace useClerk
- `features/organizations/components/_SidebarOrganizationButtonClient.tsx` — replace useClerk
- `features/jobListings/actions/actions.ts` — permission check imports
- `features/jobListingApplications/actions/actions.ts` — permission check imports
- `features/jobListings/lib/planfeatureHelpers.ts` — swap Clerk→DB
- `features/organizations/db/organizationUserSettings.ts` — update queries
- `data/env/server.ts` — update env vars
- `data/env/client.ts` — update env vars (or remove if no client-only vars remain)
- `services/inngest/functions/email.ts` — update imports
- `app/api/inngest/route.ts` — remove Clerk function imports
- `services/inngest/client.ts` — remove Clerk event types
- `scripts/seed.ts` — update org ID source if needed
- `components.json` — no change needed
- `.env.example` — replace Clerk vars with Better Auth vars

## Error Handling

- Better Auth returns error objects (`{ error, data }`) on all client calls — standard zod-safeParse pattern already used in server actions fits naturally
- Email verification required before org creation (configurable in `allowUserToCreateOrganization`)
- Invitation expiration: 48 hours default, configurable
- Last owner protection: Better Auth prevents removing the last owner — no custom logic needed
- Plan feature limits fail closed: if `OrganizationPlanFeatures` row missing, default to 0

## Testing

No test framework is configured. Verification via:
- `npm run build` — TypeScript check
- `npm run lint` — ESLint
- Manual: sign-up → create org → invite member → create job listing → check permission gating → check plan limits
