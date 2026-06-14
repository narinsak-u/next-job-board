import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { revalidateTag } from "next/cache"
import { getGlobalTag, getIdTag } from "@/lib/dataCache"

export function getPlanFeaturesGlobalTag() {
  return getGlobalTag("organizationPlanFeatures")
}

export function getPlanFeaturesIdTag(organizationId: string) {
  return getIdTag("organizationPlanFeatures", organizationId)
}

export function revalidatePlanFeaturesCache(organizationId: string) {
  revalidateTag(getPlanFeaturesGlobalTag(), "max")
  revalidateTag(getPlanFeaturesIdTag(organizationId), "max")
}
