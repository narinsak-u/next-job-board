import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { JobListingItems } from "@/features/jobListings/components/JobListingItems";
import { JobListingDetails } from "@/features/jobListings/components/JobListingDetails";
import { JobListingSheet } from "@/features/jobListings/components/JobListingSheet";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const sp = await searchParams;
  const jobId = typeof sp.jobId === "string" ? sp.jobId : sp.jobId?.[0];

  return (
    <div className="m-4">
      <JobListingItems searchParams={searchParams} />
      <JobListingSheet>
        {jobId && (
          <Suspense fallback={<LoadingSpinner />}>
            <JobListingDetails jobListingId={jobId} />
          </Suspense>
        )}
      </JobListingSheet>
    </div>
  );
}
