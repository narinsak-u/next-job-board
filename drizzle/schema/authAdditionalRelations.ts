import { relations } from "drizzle-orm"
import { user } from "./auth"
import { UserResumeTable } from "./userResume"
import { UserNotificationSettingsTable } from "./userNotificationSettings"

export const authUserAdditionalRelations = relations(user, ({ one }) => ({
  resume: one(UserResumeTable),
  notificationSettings: one(UserNotificationSettingsTable),
}))
