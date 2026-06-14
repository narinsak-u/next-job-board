import { OrgMembersList } from "@/services/better-auth/components/OrgMembersList"
import { OrgInviteForm } from "@/services/better-auth/components/OrgInviteForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrgSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <Button variant="outline" asChild>
          <Link href="/employer">Back to Dashboard</Link>
        </Button>
      </div>
      <OrgMembersList />
      <OrgInviteForm />
    </div>
  )
}
