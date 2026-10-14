"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { ACTIVIDADES_PREVIAS_STEP_SECTIONS } from "@/lib/constants/actividadesPrevias";
import type { ActividadesPreviasFormInputValues } from "@/lib/schemas/actividadesPreviasSchema";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Fase1SectionHeader } from "@/components/features-components/ElaboracionExpediente/fase-1/Fase1SectionHeader";
import { ActividadesPreviasFieldCopy } from "../ActividadesPreviasFieldCopy";
import { SiNoToggleField } from "../SiNoToggleField";

interface Paso5GarantiasAnticiposStepProps {
  form: UseFormReturn<ActividadesPreviasFormInputValues>;
  readOnly?: boolean;
}

const inputClass =
  "h-10 rounded-lg border-slate-300 bg-white text-sm shadow-none focus-visible:ring-2 focus-visible:ring-navy/30";
const conditionalBlockClass =
  "space-y-5 rounded-lg border border-border border-l-4 border-l-navy bg-muted/40 p-4 md:p-5";

export function Paso5GarantiasAnticiposStep({
  form,
  readOnly = false,
}: Paso5GarantiasAnticiposStepProps) {
  const section = ACTIVIDADES_PREVIAS_STEP_SECTIONS[5];
  const requiereGarantiaLaboral = form.watch("requiereGarantiaLaboralAuAu");
  const polizaResponsabilidadCivil = form.watch("polizaResponsabilidadCivilAuAu");
  const anticipoContrato = form.watch("anticipoContratoAuAu");

  return (
    <div className="space-y-6">
      <Fase1SectionHeader title={section.title} description={section.description} />

      <div className="space-y-5">
        <div className="space-y-1 border-t border-border pt-5">
          <h3 className="text-[14px] font-bold text-color-titulos">Fianza laboral</h3>
        </div>

        <FormField
          control={form.control}
          name="requiereGarantiaLaboralAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <ActividadesPreviasFieldCopy fieldKey="requiereGarantiaLaboralAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {requiereGarantiaLaboral === true ? (
          <div className={conditionalBlockClass}>
            <FormField
              control={form.control}
              name="porcentajeGarantiaLaboralAuAu"
              render={() => (
                <FormItem className="max-w-3xl">
                  <ActividadesPreviasFieldCopy fieldKey="porcentajeGarantiaLaboralAuAu" />
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="porcentajeGarantiaLaboralAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          max={100}
                          className={`${inputClass} max-w-[160px]`}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="retencionFianzaLaboralAuAu"
              render={({ field }) => (
                <FormItem className="max-w-3xl">
                  <ActividadesPreviasFieldCopy fieldKey="retencionFianzaLaboralAuAu" />
                  <FormControl>
                    <SiNoToggleField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                      className="max-w-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <div className="space-y-1 border-t border-border pt-5">
          <h3 className="text-[14px] font-bold text-color-titulos">Responsabilidad civil</h3>
        </div>

        <FormField
          control={form.control}
          name="polizaResponsabilidadCivilAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <ActividadesPreviasFieldCopy fieldKey="polizaResponsabilidadCivilAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {polizaResponsabilidadCivil === true ? (
          <div className={conditionalBlockClass}>
            <FormField
              control={form.control}
              name="porcentajeResponsabilidadCivilAuAu"
              render={() => (
                <FormItem className="max-w-3xl">
                  <ActividadesPreviasFieldCopy fieldKey="porcentajeResponsabilidadCivilAuAu" />
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="porcentajeResponsabilidadCivilAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          max={100}
                          className={`${inputClass} max-w-[160px]`}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="montoResponsabilidadCivilBsAuAu"
              render={() => (
                <FormItem className="max-w-3xl">
                  <ActividadesPreviasFieldCopy fieldKey="montoResponsabilidadCivilBsAuAu" />
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="montoResponsabilidadCivilBsAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          className={`${inputClass} max-w-[200px]`}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <div className="space-y-1 border-t border-border pt-5">
          <h3 className="text-[14px] font-bold text-color-titulos">Anticipo contractual</h3>
        </div>

        <FormField
          control={form.control}
          name="anticipoContratoAuAu"
          render={({ field }) => (
            <FormItem className="max-w-3xl">
              <ActividadesPreviasFieldCopy fieldKey="anticipoContratoAuAu" />
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={field.onChange}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {anticipoContrato === true ? (
          <div className={conditionalBlockClass}>
            <FormField
              control={form.control}
              name="porcentajeAnticipoAuAu"
              render={() => (
                <FormItem className="max-w-3xl">
                  <ActividadesPreviasFieldCopy fieldKey="porcentajeAnticipoAuAu" />
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="porcentajeAnticipoAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          max={50}
                          className={`${inputClass} max-w-[160px]`}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
