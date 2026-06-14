import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ReactNode } from "react";

export function AvatarInfo({
  imageUrl,
  name,
  subtitle,
  children,
}: {
  imageUrl?: string | null;
  name: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage src={imageUrl ?? undefined} alt={name} />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">{name}</span>
        {subtitle && <span className="truncate text-xs">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
