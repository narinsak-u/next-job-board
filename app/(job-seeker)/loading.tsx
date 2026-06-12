import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function JobSeekerLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner className="size-12" />
    </div>
  );
}
