# Vercel Best Practices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Vercel React/Next.js best practices to improve performance, SEO, and code quality.

**Architecture:** Incremental fixes across existing files — no new components or restructuring. Each task is self-contained and independently verifiable via `npm run build`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, Drizzle ORM, TanStack Table

---

### Task 1: Remove production console.log statements

**Files:**
- Modify: `features/jobListings/actions/actions.ts:40,43`
- Modify: `features/jobListings/components/JobListingForm.tsx:85`
- Modify: `app/(job-seeker)/user-settings/resume/page.tsx:68`

- [ ] **Step 1: Remove console.log from createJobListing action**

Edit `features/jobListings/actions/actions.ts` — remove lines 40 and 43:

```ts
export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  const hasPermission = await hasOrgUserPermission("org:job_listings:create");

  if (orgId == null || !hasPermission) {
```

- [ ] **Step 2: Remove console.log from JobListingForm**

Edit `features/jobListings/components/JobListingForm.tsx` — remove line 85:

```ts
    const res = await action(data);

    if (res.error) {
      toast.error(res.message);
    }
```

- [ ] **Step 3: Remove console.log from resume page**

Edit `app/(job-seeker)/user-settings/resume/page.tsx` — remove line 68:

```ts
  const userResume = await getUserResume(userId);

  if (userResume == null || userResume.aiSummary == null) return null;
```

- [ ] **Step 4: Verify build**

Run: `npm run build` — Expected: no errors, clean exit code 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: remove console.log statements from production code"
```

---

### Task 2: Remove duplicate orgId null check in createJobListing

**Files:**
- Modify: `features/jobListings/actions/actions.ts:45-57`

- [ ] **Step 1: Remove dead duplicate check**

Edit `features/jobListings/actions/actions.ts` — the block `if (orgId == null) { ... }` on lines 52-57 is dead code since the prior `if (orgId == null || !hasPermission)` already catches `null`. Remove lines 52-57:

```ts
  if (orgId == null || !hasPermission) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
```

- [ ] **Step 2: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: remove dead duplicate orgId null check in createJobListing"
```

---

### Task 3: Add loading.tsx files for Suspense streaming shells

**Files:**
- Create: `app/(job-seeker)/loading.tsx`
- Create: `app/employer/loading.tsx`

Adding `loading.tsx` provides **instant streaming shells** — Next.js sends the loading UI immediately without waiting for the server component to resolve, preventing the full page white-screen while Suspense boundaries resolve.

- [ ] **Step 1: Create job-seeker route loading.tsx**

Write `app/(job-seeker)/loading.tsx`:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function JobSeekerLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner className="size-12" />
    </div>
  );
}
```

- [ ] **Step 2: Create employer route loading.tsx**

Write `app/employer/loading.tsx`:

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function EmployerLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner className="size-12" />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add loading.tsx streaming shells for route groups"
```

---

### Task 4: Add error.tsx files for error boundaries

**Files:**
- Create: `app/(job-seeker)/error.tsx`
- Create: `app/employer/error.tsx`

Without `error.tsx`, any unhandled error in a page crashes the entire app. These error boundaries catch errors and show a recovery UI.

- [ ] **Step 1: Create job-seeker error.tsx**

Write `app/(job-seeker)/error.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function JobSeekerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm">
        {error.message ?? "An unexpected error occurred"}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

- [ ] **Step 2: Create employer error.tsx**

Write `app/employer/error.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EmployerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm">
        {error.message ?? "An unexpected error occurred"}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add error.tsx error boundaries for route groups"
```

---

### Task 5: Add generateMetadata for SEO on dynamic pages

**Files:**
- Modify: `app/layout.tsx:19-22`
- Modify: `app/(job-seeker)/job-listings/[jobListingId]/page.tsx`
- Modify: `app/employer/job-listings/[jobListingId]/page.tsx`

The root layout has a generic "Create Next App" title. Dynamic pages lack any SEO metadata.

- [ ] **Step 1: Update root layout metadata**

Edit `app/layout.tsx` — change the static metadata:

```tsx
export const metadata: Metadata = {
  title: {
    template: "%s | Next Job Board",
    default: "Next Job Board",
  },
  description: "Find your next job opportunity",
};
```

- [ ] **Step 2: Add generateMetadata to job-seeker job listing detail page**

Edit `app/(job-seeker)/job-listings/[jobListingId]/page.tsx` — add before the default export:

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}): Promise<Metadata> {
  const { jobListingId } = await params;
  const jobListing = await getJobListingForMetadata(jobListingId);

  if (jobListing == null) {
    return { title: "Job Not Found" };
  }

  return {
    title: jobListing.title,
    description: `${jobListing.title} at ${jobListing.organization.name}`,
  };
}

async function getJobListingForMetadata(id: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
    ),
    columns: { title: true },
    with: {
      organization: {
        columns: { name: true },
      },
    },
  });
}
```

- [ ] **Step 3: Add generateMetadata to employer job listing detail page**

Edit `app/employer/job-listings/[jobListingId]/page.tsx` — add before the default export:

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}): Promise<Metadata> {
  const { orgId } = await getCurrentOrganization();
  const { jobListingId } = await params;

  if (orgId == null) return { title: "Employer Dashboard" };

  const jobListing = await getJobListing(jobListingId, orgId);
  if (jobListing == null) return { title: "Job Listing Not Found" };

  return {
    title: `${jobListing.title} — Employer`,
  };
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add generateMetadata for SEO on job listing pages"
```

---

### Task 6: Add dynamic import for ApplicationTable

**Files:**
- Modify: `app/employer/job-listings/[jobListingId]/page.tsx:20-22`

`ApplicationTable` is a heavy client component (TanStack Table + dialogs + dropdowns + avatars). It should be dynamically imported so its JS is only loaded when viewing a specific job listing.

- [ ] **Step 1: Replace static import with dynamic import**

Edit `app/employer/job-listings/[jobListingId]/page.tsx` — replace the static import on lines 20-22:

```tsx
import dynamic from "next/dynamic";

const ApplicationTable = dynamic(
  () =>
    import(
      "@/features/jobListingApplications/components/ApplicationTable"
    ).then((m) => m.ApplicationTable),
  { loading: () => <SkeletonApplicationTable /> }
);
```

The `SkeletonApplicationTable` is already exported from the same module, so remove its static import too. Keep `SkeletonApplicationTable` as a static import since it is lightweight.

The import block changes from:
```tsx
import {
  ApplicationTable,
  SkeletonApplicationTable,
} from "@/features/jobListingApplications/components/ApplicationTable";
```

To:
```tsx
import { SkeletonApplicationTable } from "@/features/jobListingApplications/components/ApplicationTable";
```

- [ ] **Step 2: Remove the inner Suspense for Applications**

Since the dynamic import handles loading via `loading` prop, the `<Suspense fallback={<SkeletonApplicationTable />}>` wrapping `<Applications>` is redundant. Simplify:

```tsx
<Suspense fallback={<SkeletonApplicationTable />}>
  <Applications jobListingId={jobListingId} />
</Suspense>
```

The dynamic import's `loading` handles the client-side chunk load, while the `<Suspense>` handles the async server data. Both are needed — keep both.

- [ ] **Step 3: Verify build**

Run: `npm run build` — Expected: no errors, bundle size for the main employer page chunk should decrease.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "perf: dynamically import ApplicationTable to reduce initial bundle"
```

---

### Task 7: Fix className duplication in JobListingBadges

**Files:**
- Modify: `features/jobListings/components/JobListingBadges.tsx:46-49,56-58`

The `badgeProps` object captures `className`, then the Featured badge spreads `badgeProps` AND passes `className` again via `cn(className, ...)`. This duplicates the class string.

- [ ] **Step 1: Remove className from badgeProps and only apply via cn**

Edit `features/jobListings/components/JobListingBadges.tsx`:

```tsx
  const badgeProps = {
    variant: "outline",
  } satisfies ComponentProps<typeof Badge>;

  return (
    <>
      {isFeatured && (
        <Badge
          {...badgeProps}
          className={cn(
            className,
            "border-featured bg-featured/50 text-featured-foreground"
          )}
        >
          Featured
        </Badge>
      )}
      {wage != null && wageInterval != null && (
        <Badge {...badgeProps} className={className}>
          <BanknoteIcon />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}
      {(stateAbbreviation != null || city != null) && (
        <Badge {...badgeProps} className={className}>
          <MapPinIcon className="size-10" />
          {formatJobListingLocation({ stateAbbreviation, city })}
        </Badge>
      )}
      <Badge {...badgeProps} className={className}>
        <BuildingIcon />
        {formatLocationRequirement(locationRequirement)}
      </Badge>
      <Badge {...badgeProps} className={className}>
        <HourglassIcon />
        {formatJobType(type)}
      </Badge>
      <Badge {...badgeProps} className={className}>
        <GraduationCapIcon />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
    </>
  );
```

- [ ] **Step 2: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "fix: remove duplicate className application in JobListingBadges"
```

---

### Task 8: Memoize ApplicationTable cell components

**Files:**
- Modify: `features/jobListingApplications/components/ApplicationTable.tsx`

`StageCell`, `RatingCell`, and `ActionCell` are recreated on every render since `getColumns()` is called in the render path. Wrap them with `React.memo` and extract them as stable top-level components (they already are top-level, just need `memo`).

- [ ] **Step 1: Wrap StageCell with React.memo**

Edit `features/jobListingApplications/components/ApplicationTable.tsx`:

```tsx
import { memo } from "react";

const StageCell = memo(function StageCell({
  stage,
  jobListingId,
  userId,
  canUpdate,
}: {
  stage: ApplicationStage;
  jobListingId: string;
  userId: string;
  canUpdate: boolean;
}) {
  // ... existing implementation unchanged
});
```

- [ ] **Step 2: Wrap RatingCell with React.memo**

```tsx
const RatingCell = memo(function RatingCell({
  rating,
  jobListingId,
  userId,
  canUpdate,
}: {
  rating: number | null;
  jobListingId: string;
  userId: string;
  canUpdate: boolean;
}) {
  // ... existing implementation unchanged
});
```

- [ ] **Step 3: Wrap ActionCell with React.memo**

```tsx
const ActionCell = memo(function ActionCell({
  resumeUrl,
  userName,
  resumeMarkdown,
  coverLetterMarkdown,
}: {
  resumeUrl: string | null | undefined;
  userName: string;
  resumeMarkdown: ReactNode | null;
  coverLetterMarkdown: ReactNode | null;
}) {
  // ... existing implementation unchanged
});
```

- [ ] **Step 4: Change import — remove `ReactNode` from the general import and add `memo`**

Replace:
```tsx
import { ReactNode, useOptimistic, useState, useTransition } from "react";
```

With:
```tsx
import { memo, ReactNode, useOptimistic, useState, useTransition } from "react";
```

- [ ] **Step 5: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "perf: memoize ApplicationTable cell components to prevent unnecessary re-renders"
```

---

### Task 9: Remove unnecessary Suspense + connection() from UploadThingSSR

**Files:**
- Modify: `services/uploadthing/components/UploadThingSSR.tsx`

The `UploadThingSSR` component wraps a sync plugin setup in `<Suspense>` + `connection()` which adds an unnecessary async boundary.

- [ ] **Step 1: Simplify UploadThingSSR**

Edit `services/uploadthing/components/UploadThingSSR.tsx`:

```tsx
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { customFileRouter } from "../router";

export function UploadThingSSR() {
  return (
    <NextSSRPlugin routerConfig={extractRouterConfig(customFileRouter)} />
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: remove unnecessary Suspense boundary from UploadThingSSR"
```

---

### Task 10: Remove commented-out code from employer job listing page

**Files:**
- Modify: `app/employer/job-listings/[jobListingId]/page.tsx:41`

A leftover commented import exists in the file.

- [ ] **Step 1: Remove commented-out import**

Edit `app/employer/job-listings/[jobListingId]/page.tsx` — remove line 41:

```tsx
// import { Action } from "@mdxeditor/editor";
```

- [ ] **Step 2: Verify build**

Run: `npm run build` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove commented-out import"
```
