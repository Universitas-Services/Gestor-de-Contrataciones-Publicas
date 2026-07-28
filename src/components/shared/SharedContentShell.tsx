"use client";

import type { ReactNode } from "react";

import { NavigationGuardProvider } from "@/components/shared/NavigationGuardContext";

export function SharedContentShell({ children }: { children: ReactNode }) {
  return <NavigationGuardProvider>{children}</NavigationGuardProvider>;
}
