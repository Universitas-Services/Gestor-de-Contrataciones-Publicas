"use client";

import type { UseFormReturn } from "react-hook-form";

import { ACTIVIDADES_PREVIAS_STEP_SECTIONS } from "@/lib/constants/actividadesPrevias";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1SectionHeader";
import { ActividadesPreviasFieldCopy } from "../ActividadesPreviasFieldCopy";
import { OpenDatePickerField } from "../OpenDatePickerField";
import { SiNoToggleField } from "../SiNoToggleField";

interface Paso3LogisticaStepProps {
  form: UseFormReturn<ActividadesPreviasFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const textareaClass =
  "rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30 min-h-[96px] resize-none";
const gridFieldItemClass = "flex h-full flex-col";
const gridFieldCopyClass = "flex flex-1 flex-col gap-1 pb-3";
const gridFieldControlClass = "mt-auto space-y-2";

export function Paso3LogisticaStep({ form, readOnly = false }: Paso3LogisticaStepProps) {
  const requiereEspecializado = form.watch("requiereEspecializadoAuAu");
  const requiereMuestras = form.watch("requiereMuestrasAuAu");
  const section = ACTIVIDADES_PREVIAS_STEP_SECTIONS[3];

  return (
    <div className="space-y-6">
      <Fase1SectionHeader title={section.title} description={section.description} />

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="fecEstudioMercadoAuAu"
          render={({ field }) => (
            <FormItem className={gridFieldItemClass}>
              <div className={gridFieldCopyClass}>
                <ActividadesPreviasFieldCopy fieldKey="fecEstudioMercadoAuAu" />
              </div>
              <div className={gridFieldControlClass}>
                <FormControl>
                  <OpenDatePickerField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numCertificacionPresupuestariaAuAu"
          render={({ field }) => (
            <FormItem className={gridFieldItemClass}>
              <div className={gridFieldCopyClass}>
                <ActividadesPreviasFieldCopy fieldKey="numCertificacionPresupuestariaAuAu" />
              </div>
              <div className={gridFieldControlClass}>
                <FormControl>
                  <Input
                    {...field}
                    disabled={readOnly}
                    placeholder="Ej: CDP-2026-0098"
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plazoEjecucionProcedimientoAuAu"
          render={({ field }) => (
            <FormItem className={gridFieldItemClass}>
              <div className={gridFieldCopyClass}>
                <ActividadesPreviasFieldCopy fieldKey="plazoEjecucionProcedimientoAuAu" />
              </div>
              <div className={gridFieldControlClass}>
                <FormControl>
                  <Input
                    {...field}
                    disabled={readOnly}
                    inputMode="numeric"
                    placeholder="Ej: 45"
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="lugarLogisticaEjecucionAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="lugarLogisticaEjecucionAuAu" />
            <FormControl>
              <Input
                {...field}
                disabled={readOnly}
                placeholder="Ej: Estado Lara, Municipio Iribarren, Sede Principal..."
                className={inputClass}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requiereEspecializadoAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="requiereEspecializadoAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {requiereEspecializado === true ? (
        <FormField
          control={form.control}
          name="detalleEspecializadoAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ActividadesPreviasFieldCopy fieldKey="detalleEspecializadoAuAu" />
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  rows={3}
                  placeholder="Especifique los requerimientos..."
                  className={textareaClass}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="requiereMuestrasAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="requiereMuestrasAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {requiereMuestras === true ? (
        <FormField
          control={form.control}
          name="detalleProcedimientoMuestrasAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ActividadesPreviasFieldCopy fieldKey="detalleProcedimientoMuestrasAuAu" />
              <FormControl>
                <Textarea
                  {...field}
                  disabled={readOnly}
                  rows={3}
                  placeholder="Ej: pruebas de resistencia, validación de material, encendido..."
                  className={textareaClass}
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
