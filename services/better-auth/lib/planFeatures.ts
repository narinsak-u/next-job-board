import { getCurrentOrganization } from "./getCurrentAuth"
import { getPlanFeatures } from "@/features/planFeatures/db/planFeatures"

export async function hasPlanFeature(feature: "max_published_job_listings" | "max_featured_job_listings"): Promise<number | null> {
  const { orgId } = await getCurrentOrganization()
  if (!orgId) return null

  const features = await getPlanFeatures(orgId)
  if (!features) return null

  switch (feature) {
    case "max_published_job_listings":
      return features.maxPublishedJobListings ?? null
    case "max_featured_job_listings":
      return features.maxFeaturedJobListings ?? null
  }
}
