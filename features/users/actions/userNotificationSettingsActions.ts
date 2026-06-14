"use server";

import { z } from "zod";
import { userNotificationSettingsSchema } from "./schemas";
import { getCurrentUser } from "@/services/better-auth/lib/getCurrentAuth";
import { updateUserNotificationSettings as updateUserNotificationSettingsDb } from "@/features/users/db/userNotificationSettings";

// # Update User Notification Settings
// 1. Check if user is signed in
// 2. Check if user has permission to update notification settings
// 3. Update user notification settings in the database
// 4. Return success message
export async function updateUserNotificationSettings(
  unsafeData: z.infer<typeof userNotificationSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    userNotificationSettingsSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }

  await updateUserNotificationSettingsDb(userId, data);

  return {
    error: false,
    message: "Successfully updated your notification settings",
  };
}
