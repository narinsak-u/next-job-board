"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "../lib/client"

export function OrgInviteForm() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    const result = await authClient.organization.inviteMember({
      email,
      role: role as "member" | "admin",
    })
    if (result.error) {
      setStatus({ type: "error", message: result.error.message ?? "Failed to send invitation" })
      return
    }
    setStatus({ type: "success", message: "Invitation sent!" })
    setEmail("")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Invite Member</h2>
      <form onSubmit={handleInvite} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="inviteEmail">Email Address</Label>
          <Input id="inviteEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {status && (
          <p className={`text-sm ${status.type === "error" ? "text-destructive" : "text-green-600"}`}>
            {status.message}
          </p>
        )}
        <Button type="submit">Send Invitation</Button>
      </form>
    </div>
  )
}
