import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";
import { user, organization } from "./auth";
import { relations } from "drizzle-orm";

export const OrganizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: varchar()
      .notNull()
      .references(() => user.id),
    organizationId: varchar()
      .notNull()
      .references(() => organization.id),
    newApplicationEmailNotifications: boolean().notNull().default(false),
    minimumRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.userId, table.organizationId] })]
);

export const organizationUserSettingsRelations = relations(
  OrganizationUserSettingsTable,
  ({ one }) => ({
    userRef: one(user, {
      fields: [OrganizationUserSettingsTable.userId],
      references: [user.id],
    }),
    orgRef: one(organization, {
      fields: [OrganizationUserSettingsTable.organizationId],
      references: [organization.id],
    }),
  })
);
