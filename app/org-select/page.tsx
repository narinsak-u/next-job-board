"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/services/better-auth/lib/client"

interface Org {
  id: string
  name: string
  slug: string
  logo: string | null
}

export default function OrgSelectPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadOrgs = async () => {
      const { data } = await authClient.organization.list()
      if (data) setOrgs(data as Org[])
    }
    loadOrgs()
  }, [])

  async function selectOrg(orgId: string) {
    const result = await authClient.organization.setActive({ organizationId: orgId })
    if (result.error) {
      setError(result.error.message ?? "Failed to select organization")
      return
    }
    router.push("/employer")
  }

  async function createOrg() {
    if (!newOrgName.trim()) return
    setError(null)

    const result = await authClient.organization.create({
      name: newOrgName,
      slug: newOrgName.toLowerCase().replace(/\s+/g, "-"),
    })

    if (result.error) {
      setError(result.error.message ?? "Failed to create organization")
      return
    }

    if (result.data) {
      await selectOrg(result.data.id)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Select Organization</h1>
          <p className="text-muted-foreground">Choose an organization to manage</p>
        </div>

        {orgs.length > 0 ? (
          <div className="space-y-2">
            {orgs.map((org) => (
              <Button key={org.id} variant="outline" className="w-full justify-start" onClick={() => selectOrg(org.id)}>
                {org.name}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No organizations yet</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {showCreate ? (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="My Company" />
            </div>
            <div className="flex gap-2">
              <Button onClick={createOrg}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setShowCreate(true)}>
            Create Organization
          </Button>
        )}
      </div>
    </div>
  )
}
