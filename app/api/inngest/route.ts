import { inngest } from "@/services/inngest/client";
import { serve } from "inngest/next";
import {
  prepareDailyOrganizationUserApplicationNotifications,
  prepareDailyUserJobListingNotifications,
  sendDailyOrganizationUserApplicationEmail,
  sendDailyUserJobListingEmail,
} from "@/services/inngest/functions/email";
import { rankApplication } from "@/services/inngest/functions/jobListingApplication";
import { createAiSummaryOfUploadedResume } from "@/services/inngest/functions/resume";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    createAiSummaryOfUploadedResume,
    rankApplication,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
    prepareDailyOrganizationUserApplicationNotifications,
    sendDailyOrganizationUserApplicationEmail,
  ],
});
