"use client"

import { useEffect, useState } from "react"
import { authClient } from "../lib/client"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  userId: string
  role: string
  user: { name: string; email: string; image: string | null }
}

export function OrgMembersList() {
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMembers = async () => {
      const result = await authClient.organization.listMembers()
      if (result.data) setMembers(result.data.members as unknown as Member[])
    }
    loadMembers()
  }, [])

  async function updateRole(memberId: string, currentRole: string) {
    setError(null)
    const newRole = currentRole === "admin" ? "member" : "admin"
    const result = await authClient.organization.updateMemberRole({ memberId, role: newRole })
    if (result.error) { setError(result.error.message ?? null); return }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Members</h2>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-muted-foreground">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm capitalize">{member.role}</span>
              {member.role !== "owner" && (
                <Button variant="outline" size="sm" onClick={() => updateRole(member.id, member.role)}>
                  Toggle Role
                </Button>
              )}
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">No members found</p>
        )}
      </div>
    </div>
  )
}
