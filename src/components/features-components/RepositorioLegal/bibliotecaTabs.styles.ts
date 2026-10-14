import { cn } from "@/lib/utils";

/** Contenedor pill a ancho completo (anula inline-flex / w-fit del TabsList base). */
export const bibliotecaTabsListClassName = cn(
  "!flex !h-auto !w-full !min-w-0 items-stretch gap-1.5 overflow-hidden rounded-full border border-slate-200/80 bg-slate-50 p-1.5 shadow-inner"
);

/** Trigger centrado e igual ancho; evita desborde del estado activo. */
export const bibliotecaTabTriggerClassName = cn(
  "relative z-0 !m-0 !box-border !flex !h-11 !min-h-11 !min-w-0 !flex-1 !shrink",
  "!items-center !justify-center !gap-2 !rounded-full !border !border-transparent",
  "!bg-transparent !px-4 !py-0 !text-sm !font-semibold !whitespace-nowrap !text-slate-400 !shadow-none",
  "transition-all duration-200 ease-in-out after:!hidden",
  "hover:!border-slate-200 hover:!bg-white/70 hover:!text-slate-700",
  "data-[state=active]:!z-[1] data-[state=active]:!border-color-boton-1/20",
  "data-[state=active]:!bg-white data-[state=active]:!text-color-boton-1",
  "data-[state=active]:!shadow-sm"
);
