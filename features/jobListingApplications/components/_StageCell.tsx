"use client";

import { memo, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApplicationStage, applicationStages } from "@/drizzle/schema";
import { StageIcon } from "./StageIcon";
import { sortApplicationsByStage } from "../lib/utils";
import { formatJobListingApplicationStage } from "../lib/formatters";
import { updateJobListingApplicationStage } from "../actions/actions";

export function StageDetails({ stage }: { stage: ApplicationStage }) {
  return (
    <div className="flex gap-2 items-center">
      <StageIcon stage={stage} className="size-5 text-inherit" />
      <div>{formatJobListingApplicationStage(stage)}</div>
    </div>
  );
}

export const StageCell = memo(function StageCell({
  stage,
  jobListingId,
  userId,
  canUpdate,
}: {
  stage: ApplicationStage;
  jobListingId: string;
  userId: string;
  canUpdate: boolean;
}) {
  const [optimisticStage, setOptimisticStage] = useOptimistic(stage);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    return <StageDetails stage={optimisticStage} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <StageDetails stage={optimisticStage} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {applicationStages
          .toSorted(sortApplicationsByStage)
          .map((stageValue) => (
            <DropdownMenuItem
              key={stageValue}
              onClick={() => {
                startTransition(async () => {
                  setOptimisticStage(stageValue);
                  const res = await updateJobListingApplicationStage(
                    { jobListingId, userId },
                    stageValue
                  );
                  if (res?.error) {
                    toast.error(res.message);
                  }
                });
              }}
            >
              <StageDetails stage={stageValue} />
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
