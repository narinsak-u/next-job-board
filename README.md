# Next Job Board

A full-stack job board application built with Next.js 16, featuring employer and job seeker roles, AI-powered search and applicant ranking, and automated email notifications.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Clerk (multi-organization) |
| Background Jobs | Inngest (14 functions) |
| AI | Gemini 2.0 Flash (search, ranking), Anthropic Claude 3.5 Sonnet (resume summaries) |
| Email | Resend + React Email |
| File Upload | UploadThing |
| UI | shadcn/ui, Tailwind CSS v4, TanStack React Table |
| Forms | React Hook Form + Zod |
| Markdown | MDXEditor |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Copy environment variables and fill in values
cp .env.example .env

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run start        # Start production server
npm run inngest      # Start Inngest dev server
npm run email        # Start React Email dev server (port 3001)
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio
```

## Features

### Job Seekers

- Browse and filter job listings (by title, location, experience, type)
- AI-powered search (Gemini 2.0 Flash matches queries to listings)
- Apply to jobs with optional cover letter (markdown)
- Upload resume (PDF) with automatic AI-generated summary
- Daily email notifications for new matching job listings

### Employers

- Create, edit, publish, and delete job listings
- Toggle featured status (plan-dependent)
- Review applicants with sortable/filterable data table
- Rate applicants (1-5 stars) and track application stages
- AI auto-ranks new applicants based on resume + cover letter fit
- Daily email notifications for new applications

### Authentication & Authorization

- Multi-organization support (employers belong to orgs)
- Role-based permissions per organization
- Plan-based feature limits (max listings, featured listings)

## Project Structure

```
app/                    # App Router pages and layouts
  (clerk)/              # Auth pages (sign-in, org select)
  (job-seeker)/         # Job seeker section (listings, settings, AI search)
  employer/             # Employer section (CRUD, applications, settings)
  api/                  # API routes (Inngest, UploadThing)
components/             # Shared UI components (shadcn, sidebar, data table, markdown)
features/               # Feature-first domain modules
  jobListings/          # Job listing CRUD, filtering, AI search
  jobListingApplications/ # Application management
  organizations/        # Org settings, notifications
  users/                # User settings, resumes, notifications
services/               # Third-party integrations
  clerk/                # Auth, permissions, plan features
  inngest/              # Background jobs, AI agents, email scheduling
  resend/               # Email sending, React Email templates
  uploadthing/          # File uploads (resume)
drizzle/                # Database schema, migrations, client
lib/                    # Global utilities
data/                   # Env validation, static data (US states)
```

## Documentation

- [Workflow Documentation](docs/WORKFLOW.md) — Detailed explanations of all major workflows
- [Vercel Best Practices Plan](docs/vercel-best-practices-implementation-plan.md)

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

- **Database:** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- **Clerk:** `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **AI:** `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`
- **Email:** `RESEND_API_KEY`
- **Uploads:** `UPLOADTHING_TOKEN`
- **App:** `SERVER_URL`
