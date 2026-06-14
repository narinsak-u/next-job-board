import { Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { JobListingItems } from "./_shared/JobListingItems";
import { JobListingDetails } from "./_shared/JobListingDetails";
import { JobListingSheet } from "./_shared/JobListingSheet";

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
