import { integer, pgTable, varchar } from "drizzle-orm/pg-core"
import { organization } from "./auth"

export const OrganizationPlanFeaturesTable = pgTable(
  "organization_plan_features",
  {
    organizationId: varchar("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    maxPublishedJobListings: integer("max_published_job_listings"),
    maxFeaturedJobListings: integer("max_featured_job_listings"),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
  },
)
