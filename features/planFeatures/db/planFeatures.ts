import { db } from "@/drizzle/db"
import { OrganizationPlanFeaturesTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/dist/server/use-cache/cache-tag"
import { getPlanFeaturesIdTag, getPlanFeaturesGlobalTag } from "./cache/planFeatures"

export function getPlanFeatures(organizationId: string) {
  "use cache"
  cacheTag(getPlanFeaturesGlobalTag(), getPlanFeaturesIdTag(organizationId))

  return db.query.OrganizationPlanFeaturesTable.findFirst({
    where: eq(OrganizationPlanFeaturesTable.organizationId, organizationId),
  })
}

export function upsertPlanFeatures(
  organizationId: string,
  data: {
    maxPublishedJobListings?: number | null
    maxFeaturedJobListings?: number | null
    stripeSubscriptionId?: string | null
  },
) {
  return db
    .insert(OrganizationPlanFeaturesTable)
    .values({ organizationId, ...data })
    .onConflictDoUpdate({
      target: OrganizationPlanFeaturesTable.organizationId,
      set: data,
    })
    .returning()
}
