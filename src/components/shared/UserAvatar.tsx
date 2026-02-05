"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserRole } from "@/types/role.types";

interface UserAvatarProps {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function UserAvatar({ name, email, avatar, size = "md" }: UserAvatarProps) {
  // Obtener iniciales del nombre
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatar} alt={name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
