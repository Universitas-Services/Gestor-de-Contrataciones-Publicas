"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SidebarItem as SidebarItemType } from "./SidebarConfig";

interface SidebarItemProps {
  item: SidebarItemType;
  roleColor: string;
}

export function SidebarItem({ item, roleColor }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
        isActive && "bg-accent shadow-sm"
      )}
    >
      <Icon
        className={cn("h-5 w-5", isActive && "text-primary")}
        style={
          isActive
            ? {
                color: `oklch(var(--${roleColor}))`,
              }
            : undefined
        }
      />
      <span className={cn(isActive && "font-semibold")}>{item.label}</span>
    </Link>
  );
}
