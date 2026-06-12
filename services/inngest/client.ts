import { eventType, Inngest } from "inngest";
import { z } from "zod";

const clerkDataSchema = z.object({
  data: z.any(),
  raw: z.string(),
  headers: z.record(z.string(), z.string()),
});

export const events = {
  "clerk/user.created": eventType("clerk/user.created", {
    schema: clerkDataSchema,
  }),
  "clerk/user.updated": eventType("clerk/user.updated", {
    schema: clerkDataSchema,
  }),
  "clerk/user.deleted": eventType("clerk/user.deleted", {
    schema: clerkDataSchema,
  }),
  "clerk/organization.created": eventType("clerk/organization.created", {
    schema: clerkDataSchema,
  }),
  "clerk/organization.updated": eventType("clerk/organization.updated", {
    schema: clerkDataSchema,
  }),
  "clerk/organization.deleted": eventType("clerk/organization.deleted", {
    schema: clerkDataSchema,
  }),
  "clerk/organizationMembership.created": eventType(
    "clerk/organizationMembership.created",
    { schema: clerkDataSchema }
  ),
  "clerk/organizationMembership.deleted": eventType(
    "clerk/organizationMembership.deleted",
    { schema: clerkDataSchema }
  ),
  "app/jobListingApplication.created": eventType(
    "app/jobListingApplication.created",
    {
      schema: z.object({
        jobListingId: z.string(),
        userId: z.string(),
      }),
    }
  ),
  "app/resume.uploaded": eventType("app/resume.uploaded", {
    schema: z.object({}),
  }),
  "app/email.daily-user-job-listings": eventType(
    "app/email.daily-user-job-listings",
    {
      schema: z.object({
        aiPrompt: z.string().optional(),
        jobListings: z.array(z.any()),
      }),
    }
  ),
  "app/email.daily-organization-user-applications": eventType(
    "app/email.daily-organization-user-applications",
    {
      schema: z.object({
        applications: z.array(z.any()),
      }),
    }
  ),
};

export const inngest = new Inngest({
  id: "job-board",
});