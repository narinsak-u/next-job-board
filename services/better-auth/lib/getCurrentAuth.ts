import { auth } from "@/auth"
import { headers } from "next/headers"

export async function getCurrentUser({ allData = false }: { allData?: boolean } = {}) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })

  if (!session) return { userId: null, user: null }

  return {
    userId: session.user.id,
    user: allData ? session.user : null,
  }
}

export async function getCurrentOrganization({ allData = false }: { allData?: boolean } = {}) {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })

  if (!session?.session.activeOrganizationId) return { orgId: null, organization: null }

  const orgId = session.session.activeOrganizationId

  if (allData) {
    const org = await auth.api.getFullOrganization({ headers: h })
    return { orgId, organization: org }
  }

  return { orgId, organization: null }
}
