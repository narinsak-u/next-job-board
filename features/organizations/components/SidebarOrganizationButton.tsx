import { Suspense } from "react";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/better-auth/lib/getCurrentAuth";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { SidebarOrganizationButtonClient } from "./_SidebarOrganizationButtonClient";
import Link from "next/link";

export function SidebarOrganizationButton() {
  return (
    <Suspense>
      <SidebarOrganizationSuspense />
    </Suspense>
  );
}

async function SidebarOrganizationSuspense() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);

  if (user == null || organization == null) {
    return (
      <SidebarMenuButton asChild>
        <Link href="/org-select">
          <LogOutIcon />
          <span>Select Org</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarOrganizationButtonClient
      user={{ email: user.email }}
      organization={{ name: organization.name, logo: organization.logo ?? null }}
    />
  );
}
