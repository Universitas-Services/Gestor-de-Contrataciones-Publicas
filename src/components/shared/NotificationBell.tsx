"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NotificationBellProps {
  count?: number;
}

export function NotificationBell({ count = 0 }: NotificationBellProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{count > 0 ? `${count} notificaciones nuevas` : "Sin notificaciones"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
