import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { JobListingDetails } from "@/features/jobListings/components/JobListingDetails";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/drizzle/db";
import { JobListingTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingIdTag } from "@/features/jobListings/db/cache/jobListings";

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

export default function JobListingPage({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button size="icon" variant="outline" asChild>
          <Link href="/">
            <span className="sr-only">Close</span>
            <XIcon />
          </Link>
        </Button>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <JobListingDetailsWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function JobListingDetailsWrapper({
  params,
}: {
  params: Promise<{ jobListingId: string }>;
}) {
  const { jobListingId } = await params;
  return <JobListingDetails jobListingId={jobListingId} />;
}
