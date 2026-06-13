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

  const { data } = await auth.api.hasPermission({
    headers: h,
    body: { permission },
  })

  return data?.hasPermission ?? false
}
