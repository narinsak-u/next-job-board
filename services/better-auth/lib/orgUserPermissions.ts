import { auth } from "@/auth"
import { headers } from "next/headers"

export type UserPermission =
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete"
  | "job_listing:change_status"
  | "application:change_rating"
  | "application:change_stage"

export async function hasOrgUserPermission(permission: UserPermission) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })

  if (!session?.session.activeOrganizationId) return false

  const [resource, action] = permission.split(":")

  const response = await auth.api.hasPermission({
    headers: h,
    body: {
      permissions: {
        [resource]: [action],
      },
    },
  })

  const data = response as { hasPermission?: boolean } | null
  return data?.hasPermission ?? false
}
