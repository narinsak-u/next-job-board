"use client";

import { AvatarInfo } from "@/components/AvatarInfo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/services/better-auth/lib/client";
import {
  ArrowLeftRightIcon,
  Building2Icon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
  UserRoundCogIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  email: string;
};

type Organization = {
  name: string;
  logo: string | null;
};

export function SidebarOrganizationButtonClient({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <AvatarInfo imageUrl={organization.logo} name={organization.name} subtitle={user.email} />
          <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={4}
        align="end"
        side={isMobile ? "bottom" : "right"}
        className="min-w-64 max-w-80"
      >
        <DropdownMenuLabel className="font-normal p-1">
          <AvatarInfo imageUrl={organization.logo} name={organization.name} subtitle={user.email} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/org-settings">
            <Building2Icon className="mr-1" /> Manage Organization
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/user-settings">
            <UserRoundCogIcon className="mr-1" /> User Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/pricing">
            <CreditCardIcon className="mr-1" /> Change Plan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/org-select">
            <ArrowLeftRightIcon className="mr-1" /> Switch Organizations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon className="mr-1" /> Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


