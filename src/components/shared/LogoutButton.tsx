"use client";

import type { ComponentProps } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LogoutButtonProps extends Omit<ComponentProps<typeof Button>, "onClick"> {
  showTooltip?: boolean;
}

export function LogoutButton({
  children,
  className,
  showTooltip = !children,
  size,
  variant = "ghost",
  ...props
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await logoutAction();
  };

  const button = (
    <Button
      variant={variant}
      size={size ?? (children ? "default" : "icon")}
      onClick={handleLogout}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      <LogOut className={children ? "h-4 w-4" : "h-5 w-5"} />
      {children}
    </Button>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>Cerrar sesion</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
