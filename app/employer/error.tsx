"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function EmployerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm">
        {error.message ?? "An unexpected error occurred"}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
