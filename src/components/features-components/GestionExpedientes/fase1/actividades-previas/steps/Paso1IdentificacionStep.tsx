"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  ACTIVIDADES_PREVIAS_INFO_SYNC,
  ACTIVIDADES_PREVIAS_STEP_SECTIONS,
} from "@/lib/constants/actividadesPrevias";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Fase1SectionHeader } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1SectionHeader";
import { ActividadesPreviasFieldCopy } from "../ActividadesPreviasFieldCopy";
import { FormCallout } from "../FormCallout";
import { SiNoToggleField } from "../SiNoToggleField";

interface Paso1IdentificacionStepProps {
  form: UseFormReturn<ActividadesPreviasFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";

export function Paso1IdentificacionStep({ form, readOnly = false }: Paso1IdentificacionStepProps) {
  const modifRequerimiento = form.watch("modifRequerimientoSncAuAu");
  const section = ACTIVIDADES_PREVIAS_STEP_SECTIONS[1];

  return (
    <div className="space-y-6">
      <Fase1SectionHeader title={section.title} description={section.description} />

      <FormCallout variant="info">{ACTIVIDADES_PREVIAS_INFO_SYNC}</FormCallout>

      <FormField
        control={form.control}
        name="numReferenciaSncAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="numReferenciaSncAuAu" />
            <FormControl>
              <Input
                {...field}
                disabled={readOnly}
                placeholder="Ej: PAC-SNC-2026-0045"
                className={inputClass}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="modifRequerimientoSncAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="modifRequerimientoSncAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {modifRequerimiento === true ? (
        <FormField
          control={form.control}
          name="numeroModifRequerimientoSncAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ActividadesPreviasFieldCopy fieldKey="numeroModifRequerimientoSncAuAu" />
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                  placeholder="Ej: MOD-SNC-2026-001"
                  className={inputClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
}
