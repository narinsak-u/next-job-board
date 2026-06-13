"use client";

import { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/services/better-auth/lib/client";

export function SidebarNavMenuGroup({
  items,
  className,
}: {
  items: {
    href: string;
    icon: ReactNode;
    label: string;
    authStatus?: "signedOut" | "signedIn";
  }[];
  className?: string;
}) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session;

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item) => {
          const html = (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );

          if (item.authStatus === "signedOut" && isSignedIn) {
            return null;
          }

          if (item.authStatus === "signedIn" && !isSignedIn) {
            return null;
          }

          return html;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
