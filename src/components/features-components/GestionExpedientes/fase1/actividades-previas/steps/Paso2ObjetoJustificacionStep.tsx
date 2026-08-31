"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  ACTIVIDADES_PREVIAS_PLURIANUAL_WARNING,
  ACTIVIDADES_PREVIAS_STEP_SECTIONS,
} from "@/lib/constants/actividadesPrevias";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Fase1SectionHeader } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1SectionHeader";
import { ActividadesPreviasFieldCopy } from "../ActividadesPreviasFieldCopy";
import { FormCallout } from "../FormCallout";
import { SiNoToggleField } from "../SiNoToggleField";

interface Paso2ObjetoJustificacionStepProps {
  form: UseFormReturn<ActividadesPreviasFormInputValues>;
  tipoContratacion: TipoContratacionBackend;
  readOnly?: boolean;
}

const inputClass =
  "rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const textareaClass = `${inputClass} min-h-[88px] resize-none`;

export function Paso2ObjetoJustificacionStep({
  form,
  tipoContratacion,
  readOnly = false,
}: Paso2ObjetoJustificacionStepProps) {
  const condicionPlurianual = form.watch("condicionPlurianualAuAu");
  const permitePymes = form.watch("permitePymesCooperativasAuAu");
  const viabilidadContratoMarco = form.watch("viabilidadContratoMarcoAuAu");
  const section = ACTIVIDADES_PREVIAS_STEP_SECTIONS[2];

  return (
    <div className="space-y-6">
      <Fase1SectionHeader title={section.title} description={section.description} />

      <FormField
        control={form.control}
        name="justificacionNecesidadContratacionAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="justificacionNecesidadContratacionAuAu" />
            <FormControl>
              <Textarea
                {...field}
                disabled={readOnly}
                rows={3}
                placeholder="Redacte la justificación de la necesidad..."
                className={textareaClass}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="justificacionVentajasAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="justificacionVentajasAuAu" />
            <FormControl>
              <Textarea
                {...field}
                disabled={readOnly}
                rows={2}
                placeholder="Describa las ventajas..."
                className={textareaClass}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="condicionPlurianualAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="condicionPlurianualAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {condicionPlurianual === true ? (
        <FormCallout variant="warning">{ACTIVIDADES_PREVIAS_PLURIANUAL_WARNING}</FormCallout>
      ) : null}

      {tipoContratacion === "OBRAS" ? (
        <FormField
          control={form.control}
          name="proyectoAprobadoAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <ActividadesPreviasFieldCopy fieldKey="proyectoAprobadoAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="permitePymesCooperativasAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="permitePymesCooperativasAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {permitePymes === false ? (
        <FormField
          control={form.control}
          name="justificacionPermitePymesCooperativasAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ActividadesPreviasFieldCopy fieldKey="justificacionPermitePymesCooperativasAuAu" />
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                  placeholder="Justifique las razones técnicas o de escala..."
                  className={`h-10 ${inputClass}`}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      <FormField
        control={form.control}
        name="viabilidadContratoMarcoAuAu"
        render={({ field }) => (
          <FormItem>
            <ActividadesPreviasFieldCopy fieldKey="viabilidadContratoMarcoAuAu" />
            <FormControl>
              <SiNoToggleField value={field.value} onChange={field.onChange} disabled={readOnly} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {viabilidadContratoMarco === true ? (
        <FormField
          control={form.control}
          name="justificacionContratoMarcoAuAu"
          render={({ field }) => (
            <FormItem className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <ActividadesPreviasFieldCopy fieldKey="justificacionContratoMarcoAuAu" />
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                  placeholder="Justifique detalladamente..."
                  className={`h-10 ${inputClass}`}
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
