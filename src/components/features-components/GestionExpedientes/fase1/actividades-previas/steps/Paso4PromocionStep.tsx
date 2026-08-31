"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  ACTIVIDADES_PREVIAS_CONTROL_INTERNO_WARNING,
  ACTIVIDADES_PREVIAS_STEP_SECTIONS,
} from "@/lib/constants/actividadesPrevias";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Fase1SectionHeader } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1SectionHeader";
import { ActividadesPreviasFieldCopy } from "../ActividadesPreviasFieldCopy";
import { FormCallout } from "../FormCallout";
import { SiNoToggleField } from "../SiNoToggleField";
import { VanPuntajeInput } from "../VanPuntajeInput";

interface Paso4PromocionStepProps {
  form: UseFormReturn<ActividadesPreviasFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const subModuleClass = "rounded-lg border border-slate-200 p-5";

export function Paso4PromocionStep({ form, readOnly = false }: Paso4PromocionStepProps) {
  const activaPromocion = form.watch("activaPromocionEconomicaAuAu");
  const requiereVan = form.watch("requiereVanAuAu");
  const indPrefLocal = form.watch("indPrefLocalAuAu");
  const indBonoSujeto = form.watch("indBonoSujetoAuAu");
  const section = ACTIVIDADES_PREVIAS_STEP_SECTIONS[4];

  return (
    <div className="space-y-6">
      <Fase1SectionHeader title={section.title} description={section.description} />

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <FormField
          control={form.control}
          name="activaPromocionEconomicaAuAu"
          render={({ field }) => (
            <FormItem>
              <ActividadesPreviasFieldCopy
                fieldKey="activaPromocionEconomicaAuAu"
                labelClassName="text-sm font-bold text-blue-900"
                descriptionClassName="mt-1 text-[11px] italic text-blue-700"
              />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="mt-3"
                  buttonClassName="!bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {activaPromocion === false ? (
        <FormCallout variant="controlInterno" title="Aviso de Control Interno:">
          {ACTIVIDADES_PREVIAS_CONTROL_INTERNO_WARNING}
        </FormCallout>
      ) : null}

      {activaPromocion === true ? (
        <div className="space-y-6">
          <div className={subModuleClass}>
            <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800">
              SUB-MÓDULO A: VALOR AGREGADO NACIONAL (VAN)
            </h4>
            <FormField
              control={form.control}
              name="requiereVanAuAu"
              render={({ field }) => (
                <FormItem>
                  <ActividadesPreviasFieldCopy fieldKey="requiereVanAuAu" />
                  <FormControl>
                    <SiNoToggleField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                      className="max-w-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiereVan === true ? (
              <FormField
                control={form.control}
                name="puntajeVanAuAu"
                render={({ field }) => (
                  <FormItem className="mt-4 rounded-lg bg-slate-50 p-4">
                    <ActividadesPreviasFieldCopy fieldKey="puntajeVanAuAu" />
                    <FormControl>
                      <VanPuntajeInput
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={readOnly}
                        className={`max-w-xs ${inputClass}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>

          <div className={subModuleClass}>
            <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800">
              SUB-MÓDULO B: PREFERENCIA TERRITORIAL (REGIONALIZACIÓN)
            </h4>
            <FormField
              control={form.control}
              name="indPrefLocalAuAu"
              render={({ field }) => (
                <FormItem>
                  <ActividadesPreviasFieldCopy fieldKey="indPrefLocalAuAu" />
                  <FormControl>
                    <SiNoToggleField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                      className="max-w-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {indPrefLocal === true ? (
              <FormField
                control={form.control}
                name="puntuacionBonoLocalAuAu"
                render={({ field }) => (
                  <FormItem className="mt-4 rounded-lg bg-slate-50 p-4">
                    <ActividadesPreviasFieldCopy fieldKey="puntuacionBonoLocalAuAu" />
                    <FormControl>
                      <LocalizedDecimalInput
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                        placeholder="Ej: 2,50"
                        className={`max-w-xs ${inputClass}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>

          <div className={subModuleClass}>
            <h4 className="mb-3 border-b border-slate-200 pb-2 text-sm font-bold text-slate-800">
              SUB-MÓDULO C: CATEGORÍA DE SUJETO (PROTECCIÓN A PyMES Y COOPERATIVAS)
            </h4>
            <FormField
              control={form.control}
              name="indBonoSujetoAuAu"
              render={({ field }) => (
                <FormItem>
                  <ActividadesPreviasFieldCopy fieldKey="indBonoSujetoAuAu" />
                  <FormControl>
                    <SiNoToggleField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                      className="max-w-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {indBonoSujeto === true ? (
              <FormField
                control={form.control}
                name="puntuacionBonoSujetoAuAu"
                render={({ field }) => (
                  <FormItem className="mt-4 rounded-lg bg-slate-50 p-4">
                    <ActividadesPreviasFieldCopy fieldKey="puntuacionBonoSujetoAuAu" />
                    <FormControl>
                      <LocalizedDecimalInput
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                        placeholder="Ej: 3,00"
                        className={`max-w-xs ${inputClass}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
