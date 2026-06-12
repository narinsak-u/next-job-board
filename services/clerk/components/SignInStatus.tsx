"use client";

import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

export function SignedOut({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return null;
  return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return <>{children}</>;
}
