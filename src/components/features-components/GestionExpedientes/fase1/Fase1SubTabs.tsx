"use client";

import { FileSignature, Layers } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Fase1InicialSubTab } from "./types/fase1Inicial.types";

export interface Fase1SubTabsProps {
  value: Fase1InicialSubTab;
  onChange: (value: Fase1InicialSubTab) => void;
}

const subTabTriggerClassName = [
  "h-full w-full cursor-pointer rounded-lg border border-transparent bg-transparent px-3 text-sm font-semibold text-slate-500 shadow-none transition-all duration-200 ease-in-out after:hidden",
  "hover:bg-white/80 hover:text-slate-700",
  "data-[state=active]:border-navy/15 data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm",
  "focus-visible:ring-0 focus-visible:ring-offset-0",
].join(" ");

export function Fase1SubTabs({ value, onChange }: Fase1SubTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as Fase1InicialSubTab)}
      className="flex w-full flex-col items-center"
    >
      <TabsList className="grid h-11 w-full max-w-3xl grid-cols-2 gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1 shadow-inner">
        <TabsTrigger value="preparatoria" className={subTabTriggerClassName}>
          <Layers className="h-4 w-4 shrink-0" />
          <span className="truncate">Preparatoria del expediente</span>
        </TabsTrigger>
        <TabsTrigger value="configuracion-pliego" className={subTabTriggerClassName}>
          <FileSignature className="h-4 w-4 shrink-0" />
          <span className="truncate">Configuración del pliego</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
