"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export function JobListingSheet({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasJobId = searchParams.has("jobId");

  return (
    <Sheet
      open={hasJobId}
      onOpenChange={(open) => {
        if (!open) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("jobId");
          router.push(`/?${params.toString()}`);
        }
      }}
    >
      <SheetContent className="p-4 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Job Listing Details</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
