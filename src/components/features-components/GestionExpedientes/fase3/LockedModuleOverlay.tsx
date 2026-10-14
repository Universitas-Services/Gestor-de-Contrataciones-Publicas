"use client";

import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

interface LockedModuleOverlayProps {
  locked: boolean;
  message: string;
  children: React.ReactNode;
  className?: string;
}

export function LockedModuleOverlay({
  locked,
  message,
  children,
  className,
}: LockedModuleOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "transition-[opacity,filter]",
          locked && "pointer-events-none opacity-[var(--fase3-locked-opacity)] grayscale"
        )}
      >
        {children}
      </div>
      {locked ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-lg bg-[var(--fase3-locked-overlay)] backdrop-blur-[1px]">
          <Lock className="h-7 w-7 text-muted-foreground" />
          <p className="max-w-sm px-4 text-center text-sm font-semibold text-color-subtitulos">
            {message}
          </p>
        </div>
      ) : null}
    </div>
  );
}
