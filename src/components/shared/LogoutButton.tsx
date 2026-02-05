"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { logoutAction } from "@/app/actions";

export function LogoutButton() {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="cursor-pointer">
            <LogOut className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cerrar sesión</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
