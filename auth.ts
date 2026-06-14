import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { organization } from "better-auth/plugins"
import { db } from "@/drizzle/db"
import * as schema from "@/drizzle/schema"
import { UserNotificationSettingsTable } from "@/drizzle/schema"
import { OrganizationPlanFeaturesTable } from "@/drizzle/schema"
import { env } from "@/data/env/server"

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {}
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
}
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }
}

export const auth = betterAuth({
  appName: "Next Job Board",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      teams: {
        enabled: true,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      hooks: {
        organization: {
          afterCreate: async ({ organization: org }: Record<string, any>) => {
            await db
              .insert(OrganizationPlanFeaturesTable)
              .values({
                organizationId: org.id,
                maxPublishedJobListings: 3,
                maxFeaturedJobListings: 1,
              })
              .onConflictDoNothing()
          },
        },
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(UserNotificationSettingsTable)
            .values({ userId: user.id })
            .onConflictDoNothing()
        },
      },
    },
  },
})
