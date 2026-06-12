"use server";

import { z } from "zod";
import { jobListingAiSearchSchema, jobListingSchema } from "./schemas";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb,
} from "../db/jobListings";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/drizzle/schema";
import {
  getJobListingGlobalTag,
  getJobListingIdTag,
} from "../db/cache/jobListings";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/planfeatureHelpers";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingJobListings";

// # Create Job Listing
// 1. Check if user has permission to create a job listing
// 2. Parse the job listing data
// 3. Insert the job listing into the database
// 4. Redirect to the job listing page
export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  const hasPermission = await hasOrgUserPermission("org:job_listings:create");

  if (orgId == null || !hasPermission) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  if (orgId == null) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error creating your job listing",
    };
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

// # Update Job Listing
// 1. Check if user has permission to update a job listing
// 2. Parse the job listing data
// 3. Update the job listing in the database
// 4. Redirect to the job listing page
export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();
  if (
    orgId == null ||
    !(await hasOrgUserPermission("org:job_listings:update"))
  ) {
    return {
      error: true,
      message: "You don't have permission to update this job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your job listing",
    };
  }

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) {
    return {
      error: true,
      message: "There was an error updating your job listing",
    };
  }

  const updatedJobListing = await updateJobListingDb(id, data);

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

// # Toggle Job Listing Status
// 1. Check if user has permission to update a job listing's status
// 2. Update the job listing in the database
// 3. Return success message
export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to update this job listing's status",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newStatus = getNextJobListingStatus(jobListing.status);

  if (
    !(await hasOrgUserPermission("org:job_listings:change_status")) ||
    (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    postedAt:
      newStatus === "published" && jobListing.postedAt == null
        ? new Date()
        : undefined,
  });

  return { error: false };
}

// # Toogle Job Listing Featured
// 1. Check if user has permission to update a job listing's featured status
// 2. Update the job listing in the database
// 3. Return success message
export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message:
      "You don't have permission to update this job listing's featured status",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  const newFeaturedStatus = !jobListing.isFeatured;

  if (
    !(await hasOrgUserPermission("org:job_listings:change_status")) ||
    (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
  ) {
    return error;
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });

  return { error: false };
}

// # Delete Job Listing
// 1. Check if user has permission to delete a job listing
// 2. Delete the job listing from the database
// 3. Redirect to the employer page
export async function deleteJobListing(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to delete this job listing",
  };

  const { orgId } = await getCurrentOrganization();
  if (orgId == null) return error;

  const jobListing = await getJobListing(id, orgId);
  if (jobListing == null) return error;

  if (!(await hasOrgUserPermission("org:job_listings:delete"))) {
    return error;
  }

  await deleteJobListingDb(id);
  redirect("/employer");
}

// # Get a job by ai search
// 1. Check if user has permission to use ai job search
// 2. Parse the search query
// 3. Get the job listings from the database
// 4. Return the job listings
export async function getAiJobListingSearchResults(
  unsafe: z.infer<typeof jobListingAiSearchSchema>
): Promise<
  { error: true; message: string } | { error: false; jobIds: string[] }
> {
  const { success, data } = jobListingAiSearchSchema.safeParse(unsafe);
  if (!success) {
    return {
      error: true,
      message: "There was an error processing your search query",
    };
  }

  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You need an account to use AI job search",
    };
  }

  const allListings = await getPublicJobListings();
  const matchedListings = await getMatchingJobListings(
    data.query,
    allListings,
    {
      maxNumberOfJobs: 10,
    }
  );

  if (matchedListings.length === 0) {
    return {
      error: true,
      message: "No jobs match your search criteria",
    };
  }

  return { error: false, jobIds: matchedListings };
}

// # Helper functions
// 1. Get a job listing by id and organization id
// 2. Check if the job listing is published
// 3. Return the job listing
// 4. Get all published job listings from the database
// 5. Return the job listings
async function getJobListing(id: string, orgId: string) {
  "use cache";

  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}

async function getPublicJobListings() {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
  });
}
