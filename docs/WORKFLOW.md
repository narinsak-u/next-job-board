# Workflows

Detailed documentation of all major workflows in the next-job-board application.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Job Listing CRUD](#job-listing-crud)
3. [Job Seeker: Browse & Apply](#job-seeker-browse--apply)
4. [AI Search](#ai-search)
5. [Resume Upload & AI Summary](#resume-upload--ai-summary)
6. [Application Review (Employer)](#application-review-employer)
7. [Email Notifications](#email-notifications)
8. [Background Jobs (Inngest)](#background-jobs-inngest)
9. [File Uploads (UploadThing)](#file-uploads-uploadthing)
10. [Caching Strategy](#caching-strategy)
11. [Database](#database)

---

## Authentication & Authorization

**Stack:** Clerk (`@clerk/nextjs`)

### Sign-In / Sign-Up Flow

1. User navigates to `/sign-in` or `/sign-up` (Clerk-hosted UI).
2. On success, Clerk redirects to `/` (job seeker) or `/employer` (employer).
3. `proxy.ts` (Clerk middleware) runs on every request, protecting non-public routes.

### Route Protection

`proxy.ts` defines public routes that bypass auth:

- `/sign-in(.*)`
- `/` (home page)
- `/api(.*)`
- `/job-listings(.*)` (public listing views)
- `/ai-search`

All other routes require authentication via `auth.protect()`.

### Authorization Layers

| Layer | Function | Purpose |
|-------|----------|---------|
| **Auth check** | `getCurrentUser()` | Returns authenticated user (DB record or Clerk object) |
| **Org check** | `getCurrentOrganization()` | Returns active organization for employer context |
| **Permission** | `hasOrgUserPermission(permission)` | Checks Clerk org-level permission (e.g., `org:job_listings:create`) |
| **Plan feature** | `hasPlanFeature(feature)` | Checks subscription tier (e.g., `post_3_job_listings`) |

### Org Permissions

- `org:job_listings:create` — Create job listings
- `org:job_listings:update` — Edit job listings
- `org:job_listings:delete` — Delete job listings
- `org:job_listings:change_status` — Publish/delist listings
- `org:job_listings_applications:change_rating` — Rate applicants
- `org:job_listings_applications:change_stage` — Change application stage

### Plan Features

- `post_1_job_listing` / `post_3_job_listings` / `post_15_job_listings` — Max published listings
- `1_featured_job_listing` / `unlimited_featured_jobs_listings` — Max featured listings

---

## Job Listing CRUD

**Actor:** Employer (authenticated, requires org membership)

### Create

```
Form (JobListingForm.tsx)
  → createJobListing action
    → hasOrgUserPermission("org:job_listings:create")
    → hasReachedMaxPublishedJobListings() — plan limit check
    → Zod safeParse (jobListingSchema)
    → insertJobListing (DB)
    → revalidateJobListingCache()
    → redirect("/employer/job-listings/[id]")
```

### Update

```
Form (JobListingForm.tsx, pre-filled)
  → updateJobListing action
    → hasOrgUserPermission("org:job_listings:update")
    → Zod safeParse
    → updateJobListing (DB)
    → revalidateJobListingCache()
    → redirect("/employer/job-listings/[id]")
```

### Toggle Status (Publish / Delist)

```
Status toggle button
  → toggleJobListingStatus action
    → hasOrgUserPermission("org:job_listings:change_status")
    → getNextJobListingStatus(currentStatus)
      - draft/delisted → published (sets postedAt)
      - published → delisted
    → hasReachedMaxPublishedJobListings() — if publishing
    → updateJobListing (DB)
    → revalidateJobListingCache()
```

### Toggle Featured

```
Featured toggle button
  → toggleJobListingFeatured action
    → hasOrgUserPermission("org:job_listings:change_status")
    → hasReachedMaxFeaturedJobListings() — plan limit check
    → updateJobListing (DB)
    → revalidateJobListingCache()
```

### Delete

```
Delete button (with confirmation dialog)
  → deleteJobListing action
    → hasOrgUserPermission("org:job_listings:delete")
    → deleteJobListing (DB)
    → revalidateJobListingCache()
    → redirect("/employer")
```

---

## Job Seeker: Browse & Apply

### Browse Job Listings

1. Home page (`/`) loads `JobListingItems` with `Suspense` boundary.
2. `JobListingItems` queries published job listings from DB with optional filters from URL search params.
3. Sidebar (`@sidebar` parallel route) contains `JobListingFilterForm` for filtering by:
   - Title (text search)
   - City / State
   - Experience level (junior, mid-level, senior)
   - Job type (internship, part-time, full-time)
   - Location requirement (in-office, hybrid, remote)
4. Filters are stored as URL search params (shareable/bookmarkable).
5. Clicking a listing navigates to `/job-listings/[jobListingId]` with resizable panel layout (list + detail).

### Apply to Job Listing

1. User clicks "Apply" button on job listing detail page.
2. `NewJobListingApplicationDialog` opens with cover letter markdown editor (optional).
3. Submit triggers `createJobListingApplication` action:
   - Validates user has a resume uploaded
   - Validates not already applied
   - Inserts `JobListingApplicationTable` record (stage: "applied")
   - Sends `app/jobListingApplication.created` Inngest event (triggers AI ranking)
4. On success, UI updates optimistically.

---

## AI Search

**Stack:** Gemini 2.0 Flash via Inngest Agent Kit

### Flow

```
JobListingAiSearchForm (query input)
  → getAiJobListingSearchResults action
    → getCurrentUser() — auth required
    → Fetch all published job listings (title, description, location, type, etc.)
    → getMatchingJobListings (Inngest Agent)
      → Gemini 2.0 Flash prompt with listings + user query
      → Returns comma-separated job IDs
    → redirect("/?jobIds=[ids]")
```

The redirected home page filters listings to only show the matched IDs.

---

## Resume Upload & AI Summary

**Stack:** UploadThing (file storage) + Anthropic Claude 3.5 Sonnet (AI)

### Upload Flow

```
UserSettingsResumePage
  → UploadThing dropzone (PDF only, max 8MB, 1 file)
    → Middleware: checks auth
    → On upload complete:
      → Upsert UserResumeTable record (fileUrl, fileKey)
      → Delete old file from UploadThing (if replacing)
      → Send "app/resume.uploaded" Inngest event
```

### AI Summary Generation

```
Inngest function: createAiSummaryOfUploadedResume
  → Triggered by "app/resume.uploaded" event
  → Fetches resume file URL
  → Sends to Anthropic Claude 3.5 Sonnet (document source)
  → Prompt: "Summarize this resume..."
  → Saves summary to UserResumeTable.aiSummary
```

The AI summary is displayed on the resume settings page and is accessible to employers when reviewing applications.

---

## Application Review (Employer)

**Actor:** Employer (requires org membership + permissions)

### View Applications

1. Employer navigates to `/employer/job-listings/[jobListingId]`.
2. Page displays job listing detail + `ApplicationTable` (TanStack React Table).
3. Table columns: Applicant (avatar + name), Stage, Rating, Applied On, Actions.

### Change Application Stage

```
Stage dropdown (optimistic update)
  → updateJobListingApplicationStage action
    → hasOrgUserPermission("org:job_listings_applications:change_stage")
    → updateJobListingApplication (DB)
    → revalidateJobListingApplicationCache()
```

Stages: `applied` → `interested` → `interviewed` → `hired` / `denied`

### Rate Application

```
Rating dropdown (1-5 stars, optimistic update)
  → updateJobListingApplicationRating action
    → hasOrgUserPermission("org:job_listings_applications:change_rating")
    → updateJobListingApplication (DB)
    → revalidateJobListingApplicationCache()
```

### View Resume & Cover Letter

- "View Resume" opens dialog showing AI-generated resume summary.
- "View Cover Letter" opens dialog showing applicant's cover letter (markdown rendered).

### AI Auto-Ranking

When an application is created, an Inngest Agent (Gemini 2.0 Flash) automatically ranks the applicant:

```
app/jobListingApplication.created event
  → rankApplication function
    → Fetches: cover letter, resume summary, job listing details
    → Gemini 2.0 Flash prompt: rank applicant 1-5 based on fit
    → saveApplicantRatingTool writes rating to DB
```

---

## Email Notifications

**Stack:** Resend (email) + React Email (templates) + Inngest (scheduling)

### Daily Job Listing Notifications (Job Seekers)

**Schedule:** Cron at 7:00 AM CT daily

```
Cron trigger (prepareDailyUserJobListingNotifications)
  → Query users with newJobEmailNotifications: true
  → Query job listings posted in last 24h
  → For each user:
    → Send "app/email.daily-user-job-listings" event (with userId + listings)
    → Throttled: 10 emails/minute
      → Optionally filter listings via AI match (user's aiPrompt)
      → Render DailyJobListingEmail React Email template
      → Send via Resend
```

### Daily Application Notifications (Employers)

**Schedule:** Cron at 7:00 AM CT daily

```
Cron trigger (prepareDailyOrganizationUserApplicationNotifications)
  → Query org users with newApplicationEmailNotifications: true
  → Query applications submitted in last 24h
  → For each user:
    → Filter by minimumRating threshold
    → Group applications by organization
    → Send "app/email.daily-organization-user-applications" event
    → Throttled: 1000 emails/minute
      → Render DailyApplicationEmail React Email template
      → Send via Resend
```

---

## Background Jobs (Inngest)

**Stack:** Inngest (durable functions) + Inngest Agent Kit

### Registered Functions (14 total)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `clerkCreateUser` | `clerk/user.created` | Sync new user to DB |
| `clerkUpdateUser` | `clerk/user.updated` | Update user in DB |
| `clerkDeleteUser` | `clerk/user.deleted` | Remove user from DB |
| `clerkCreateOrganization` | `clerk/organization.created` | Sync org to DB |
| `clerkUpdateOrganization` | `clerk/organization.updated` | Update org in DB |
| `clerkDeleteOrganization` | `clerk/organization.deleted` | Remove org from DB |
| `clerkCreateOrgMembership` | `clerk/organizationMembership.created` | Sync membership |
| `clerkDeleteOrgMembership` | `clerk/organizationMembership.deleted` | Remove membership |
| `createAiSummaryOfUploadedResume` | `app/resume.uploaded` | Generate resume summary (Anthropic) |
| `rankApplication` | `app/jobListingApplication.created` | Rank applicant (Gemini) |
| `prepareDailyUserJobListingNotifications` | Cron 7am CT | Query users + listings for email |
| `sendDailyUserJobListingEmail` | `app/email.daily-user-job-listings` | Send job seeker email |
| `prepareDailyOrganizationUserApplicationNotifications` | Cron 7am CT | Query org users + applications |
| `sendDailyOrganizationUserApplicationEmail` | `app/email.daily-organization-user-applications` | Send employer email |

### Clerk Webhook Sync

All 8 Clerk functions verify webhook signatures using `svix` before processing. This keeps the DB in sync with Clerk's user/org data without direct API calls.

---

## File Uploads (UploadThing)

**Stack:** UploadThing v7

### Resume Upload Router

```typescript
// services/uploadthing/router.ts
const resumeUploader = {
  middleware: async ({ req }) => {
    // Verify auth, return userId
  },
  onUploadComplete: async ({ metadata, file }) => {
    // 1. Upsert UserResumeTable record
    // 2. Delete old file from UploadThing (if replacing)
    // 3. Send "app/resume.uploaded" Inngest event
  },
}
```

- Accepts: PDF only
- Max size: 8MB
- Max files: 1
- Stored in UploadThing cloud storage

---

## Caching Strategy

**Stack:** Next.js `"use cache"` directive + `cacheTag()`

### Cache Tag Convention

| Pattern | Example | Scope |
|---------|---------|-------|
| `global:{tag}` | `global:jobListings` | All records of a type |
| `organization:{orgId}-{tag}` | `organization:org_123-jobListings` | Records for one org |
| `id:{id}-{tag}` | `id:uuid_456-jobListing` | Single record |

### Cache Invalidation

Every DB write function calls `revalidate*Cache()` which triggers `revalidateTag()`:

```typescript
// Example: features/jobListings/db/cache/jobListings.ts
export function revalidateJobListingCache(data: { organizationId?: string; id?: string }) {
  revalidateTag(getJobListingGlobalTag());
  if (data.organizationId) revalidateTag(getJobListingOrganizationTag(data.organizationId));
  if (data.id) revalidateTag(getJobListingIdTag(data.id));
}
```

### Read Pattern

```typescript
"use cache";
cacheTag(getJobListingGlobalTag());
const listings = await db.query.JobListingTable.findMany({ ... });
```

---

## Database

**Stack:** Drizzle ORM + PostgreSQL (Docker)

### Tables (7)

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `users` | `id` (varchar, Clerk ID) | User accounts |
| `organizations` | `id` (varchar, Clerk ID) | Employer organizations |
| `job_listings` | `id` (uuid) | Job postings |
| `job_listing_applications` | `(jobListingId, userId)` | Applications to listings |
| `user_resumes` | `userId` | Uploaded resumes + AI summary |
| `user_notification_settings` | `userId` | Job seeker email prefs |
| `organization_user_settings` | `(userId, organizationId)` | Employer email prefs |

### Key Enums

- **Wage interval:** `hourly`, `yearly`
- **Location requirement:** `in-office`, `hybrid`, `remote`
- **Experience level:** `junior`, `mid-level`, `senior`
- **Status:** `draft`, `published`, `delisted`
- **Job type:** `internship`, `part-time`, `full-time`
- **Application stage:** `denied`, `applied`, `interested`, `interviewed`, `hired`

### Relations

```
organizations ──< job_listings
job_listings ──< job_listing_applications
users ──< job_listing_applications
users ──< user_resumes
users ──< user_notification_settings
users ──< organization_user_settings
organizations ──< organization_user_settings
```

### Setup

```bash
# Start PostgreSQL
docker-compose up -d

# Push schema
npm run db:push

# Or generate + run migrations
npm run db:generate
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```
