"use server";

import { z } from "zod";
import { organizationUserSettingsSchema } from "./schemas";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/better-auth/lib/getCurrentAuth";
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from "@/features/organizations/db/organizationUserSettings";

// # Update Organization User Settings
// 1. Check if user is signed in
// 2. Check if user has permission to update organization user settings
// 3. Update organization user settings in the database
export async function updateOrganizationUserSettings(
  unsafeData: z.infer<typeof organizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();
  if (userId == null || orgId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    organizationUserSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }

  await updateOrganizationUserSettingsDb(
    {
      userId,
      organizationId: orgId,
    },
    data
  );

  return {
    error: false,
    message: "Successfully updated your notification settings",
  };
}
