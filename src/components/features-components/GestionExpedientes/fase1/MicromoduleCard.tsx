"use client";

import type { LucideIcon } from "lucide-react";
import {
  ChartPie,
  Megaphone,
  ClipboardCheck,
  FileSignature,
  FileText,
  Layers,
  ListChecks,
  MailOpen,
  Scale,
  Wrench,
  Wallet,
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { MicromoduleConfig, MicromoduleStatus } from "./types/fase1Inicial.types";

const MICROMODULE_ICONS: Record<MicromoduleConfig["id"], LucideIcon> = {
  "actividades-previas": ListChecks,
  "especificaciones-tecnicas": Wrench,
  llamado: Megaphone,
  "aspectos-generales-pliego": FileText,
  "modelo-contrato": FileSignature,
  "presupuesto-base": Wallet,
  "calificacion-legal": MailOpen,
  "calificacion-financiera": Scale,
  "calificacion-tecnica": ClipboardCheck,
  "evaluacion-tecnica-economica": ChartPie,
};

/** Altura uniforme del CTA: solo verbo corto (Crear, Cargar, Editar, etc.). */
const CTA_CLASSNAME =
  "flex h-10 w-full items-center justify-center rounded-md bg-navy px-3 text-center text-sm font-semibold text-white transition-colors hover:bg-navy-hover disabled:cursor-not-allowed disabled:opacity-50";

export interface MicromoduleCardProps {
  config: MicromoduleConfig;
  status: MicromoduleStatus;
  readOnly?: boolean;
  onAction: () => void;
}

export function MicromoduleCard({
  config,
  status,
  readOnly = false,
  onAction,
}: MicromoduleCardProps) {
  const Icon = MICROMODULE_ICONS[config.id] ?? Layers;
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isDraft = status === "draft";
  const isDisabled = isLocked || readOnly;

  // Presupuesto base: siempre "Cargar" (se pueden añadir ítems en cualquier momento).
  const buttonLabel =
    config.id === "presupuesto-base"
      ? config.ctaLabel
      : isCompleted
        ? "Editar"
        : isDraft
          ? "Continuar"
          : config.ctaLabel;

  const card = (
    <div
      className={[
        "flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        isLocked ? "opacity-60 grayscale-[30%]" : "",
        isCompleted ? "border-green-200 bg-green-50/30" : "",
        isDraft ? "border-amber-200 bg-amber-50/20" : "",
      ].join(" ")}
    >
      <div className="min-h-0 flex-1">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-navy">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-1 font-bold text-slate-800">{config.title}</h3>
        <p className="text-xs text-slate-500">{config.description}</p>
      </div>

      <div className="mt-4 flex min-h-5 items-center">
        {isCompleted ? <p className="text-xs font-semibold text-green-600">Completado</p> : null}
        {isDraft ? <p className="text-xs font-semibold text-amber-600">Borrador</p> : null}
      </div>

      <button
        type="button"
        disabled={isDisabled}
        onClick={onAction}
        className={`mt-2 ${CTA_CLASSNAME}`}
      >
        {buttonLabel}
      </button>
    </div>
  );

  if (!isLocked) return card;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-full">{card}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-center text-xs">
          Complete Actividades Previas primero para habilitar este micromódulo.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { MICROMODULE_ICONS };
