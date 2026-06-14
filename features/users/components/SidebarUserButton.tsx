import { Suspense } from "react";
import { SidebarUserButtonClient } from "./_SidebarUserButtonClient";
import { getCurrentUser } from "@/services/better-auth/lib/getCurrentAuth";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Link from "next/link";

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  const { user } = await getCurrentUser({ allData: true });

  if (user == null) {
    return (
      <SidebarMenuButton asChild>
        <Link href="/sign-in">
          <LogOutIcon />
          <span>Sign In</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarUserButtonClient
      user={{ name: user.name, image: user.image ?? null, email: user.email }}
    />
  );
}
