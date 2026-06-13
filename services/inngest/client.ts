import { eventType, Inngest } from "inngest";
import { z } from "zod";

export const events = {
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