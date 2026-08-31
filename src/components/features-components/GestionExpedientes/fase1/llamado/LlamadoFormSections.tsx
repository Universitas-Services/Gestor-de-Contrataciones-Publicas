"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Controller, type UseFormReturn } from "react-hook-form";

import {
  formatCuentaBancariaOptionLabel,
  LLAMADO_CUENTA_SELECT_EMPTY,
  LLAMADO_CUENTA_SELECT_LABEL,
  LLAMADO_CUENTA_SELECT_PLACEHOLDER,
  loadCuentasBancariasEnte,
  type CuentaBancariaEnte,
} from "@/lib/constants/cuentasBancariasEnte";
import {
  LLAMADO_PUBLICO_FIELD_COPY,
  LLAMADO_PUBLICO_SECTIONS,
} from "@/lib/constants/llamadoPublico";
import { ROLE_ROUTES } from "@/lib/constants/routes";
import type { LlamadoPublicoFormInputValues } from "@/lib/schemas/llamadoPublicoSchema";
import { cn } from "@/lib/utils";
import { HorarioRetiroPliegoFields } from "@/components/features-components/ElaboracionExpediente/fase-1/HorarioRetiroPliegoFields";
import { HoraActoRecepFields } from "@/components/features-components/ElaboracionExpediente/fase-1/HoraActoRecepFields";
import { SiNoToggleField } from "@/components/features-components/GestionExpedientes/fase1/actividades-previas/SiNoToggleField";
import { BankAccountInput } from "@/components/bank-account-input";
import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { RifJgInput } from "@/components/rif-jg-input";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LlamadoFormSectionsProps {
  form: UseFormReturn<LlamadoPublicoFormInputValues>;
  enteId?: string;
  readOnly?: boolean;
}

const labelClass = "font-bold text-color-titulos text-[12px] leading-snug";
const descriptionClass = "text-[11px] text-muted-foreground italic leading-relaxed";
const inputClass =
  "h-10 rounded-md border-border bg-card text-[13px] font-medium text-foreground shadow-none placeholder:italic placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-[2px]";
const messageClass = "text-[11px]";

function SectionHeader({
  badge,
  title,
  description,
  legal,
}: {
  badge: string;
  title: string;
  description?: string;
  legal?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Badge
        variant="outline"
        className="mt-0.5 h-7 w-7 shrink-0 items-center justify-center rounded-md border-navy/20 bg-muted px-0 text-[13px] font-bold text-navy"
      >
        {badge}
      </Badge>
      <div className="min-w-0 space-y-1">
        <h2 className="text-[16px] font-bold leading-tight text-color-titulos md:text-[17px]">
          {title}
        </h2>
        {description ? (
          <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
        {legal ? <p className={descriptionClass}>{legal}</p> : null}
      </div>
    </div>
  );
}

function applyCuentaToForm(
  form: UseFormReturn<LlamadoPublicoFormInputValues>,
  cuenta: CuentaBancariaEnte
) {
  form.setValue("bancoPagoPliegoAuAu", cuenta.bancoPagoPliego, {
    shouldDirty: true,
    shouldValidate: true,
  });
  form.setValue("cuentaPagoPliegoAuAu", cuenta.cuentaPagoPliego, {
    shouldDirty: true,
    shouldValidate: true,
  });
  form.setValue("titularPagoPliegoAuAu", cuenta.titularPagoPliego, {
    shouldDirty: true,
    shouldValidate: true,
  });
  form.setValue("rifPagoPliegoAuAu", cuenta.rifPagoPliego, {
    shouldDirty: true,
    shouldValidate: true,
  });
}

export function LlamadoFormSections({ form, enteId, readOnly = false }: LlamadoFormSectionsProps) {
  const pliegoCosto = form.watch("pliegoCostoAuAu");
  const [cuentas, setCuentas] = useState<CuentaBancariaEnte[]>([]);
  const [selectedCuentaId, setSelectedCuentaId] = useState("");

  useEffect(() => {
    if (!enteId) {
      queueMicrotask(() => setCuentas([]));
      return;
    }
    const refresh = () => {
      queueMicrotask(() => setCuentas(loadCuentasBancariasEnte(enteId)));
    };
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [enteId]);

  const activeSelectedCuentaId = pliegoCosto === true ? selectedCuentaId : "";

  const handleSelectCuenta = (cuentaId: string) => {
    setSelectedCuentaId(cuentaId);
    const cuenta = cuentas.find((c) => c.id === cuentaId);
    if (!cuenta) return;
    applyCuentaToForm(form, cuenta);
  };

  return (
    <div className="space-y-8 px-5 py-6 md:px-8">
      {/* Sección A */}
      <section className="space-y-5">
        <SectionHeader
          badge={LLAMADO_PUBLICO_SECTIONS.A.badge}
          title={LLAMADO_PUBLICO_SECTIONS.A.title}
          description={LLAMADO_PUBLICO_SECTIONS.A.description}
          legal={LLAMADO_PUBLICO_SECTIONS.A.legal}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="objetivosEspecificosLlamado1AuAu"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={labelClass}>
                  {LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado1AuAu.label}
                </p>
                <FormControl>
                  <Input
                    {...field}
                    disabled={readOnly}
                    placeholder={
                      LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado1AuAu.placeholder
                    }
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificosLlamado2AuAu"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={labelClass}>
                  {LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado2AuAu.label}
                </p>
                <FormControl>
                  <Input
                    {...field}
                    disabled={readOnly}
                    placeholder={
                      LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado2AuAu.placeholder
                    }
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="objetivosEspecificosLlamado3AuAu"
            render={({ field }) => (
              <FormItem className="max-w-2xl">
                <p className={labelClass}>
                  {LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado3AuAu.label}
                </p>
                <FormControl>
                  <Input
                    {...field}
                    disabled={readOnly}
                    placeholder={
                      LLAMADO_PUBLICO_FIELD_COPY.objetivosEspecificosLlamado3AuAu.placeholder
                    }
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage className={messageClass} />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* Sección B */}
      <section className="space-y-5 border-t border-border pt-8">
        <SectionHeader
          badge={LLAMADO_PUBLICO_SECTIONS.B.badge}
          title={LLAMADO_PUBLICO_SECTIONS.B.title}
        />

        <FormField
          control={form.control}
          name="direccionRetiroPliegoAuAu"
          render={({ field }) => (
            <FormItem className="max-w-2xl">
              <p className={labelClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.direccionRetiroPliegoAuAu.label}
              </p>
              <FormDescription className={descriptionClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.direccionRetiroPliegoAuAu.description}
              </FormDescription>
              <FormControl>
                <Input {...field} disabled={readOnly} className={inputClass} />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horarioRetiroPliegoAuAu"
          render={({ field }) => (
            <FormItem className="max-w-4xl">
              <p className={labelClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.horarioRetiroPliegoAuAu.label}
              </p>
              <FormDescription className={descriptionClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.horarioRetiroPliegoAuAu.description}
              </FormDescription>
              <p className="text-[11px] italic text-muted-foreground/70">
                {LLAMADO_PUBLICO_FIELD_COPY.horarioRetiroPliegoAuAu.placeholder}
              </p>
              <FormControl>
                <div className={cn(readOnly && "pointer-events-none opacity-60")}>
                  <HorarioRetiroPliegoFields
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </div>
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pliegoCostoAuAu"
          render={({ field }) => (
            <FormItem className="max-w-md">
              <p className={labelClass}>{LLAMADO_PUBLICO_FIELD_COPY.pliegoCostoAuAu.label}</p>
              <FormDescription className={descriptionClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.pliegoCostoAuAu.description}
              </FormDescription>
              <FormControl>
                <SiNoToggleField
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    if (value !== true) setSelectedCuentaId("");
                  }}
                  disabled={readOnly}
                  className="max-w-xs"
                />
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />

        {pliegoCosto === true ? (
          <div className="space-y-5 rounded-lg border border-border border-l-4 border-l-navy bg-muted/40 p-4 md:p-5">
            <div className="space-y-1">
              <h3 className="text-[14px] font-bold text-color-titulos">
                {LLAMADO_PUBLICO_FIELD_COPY.pagoPliego.title}
              </h3>
              <p className={descriptionClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.pagoPliego.description}
              </p>
            </div>

            <FormField
              control={form.control}
              name="costoPliegoBsAuAu"
              render={() => (
                <FormItem className="max-w-xl">
                  <p className={labelClass}>{LLAMADO_PUBLICO_FIELD_COPY.costoPliegoBsAuAu.label}</p>
                  <FormDescription className={descriptionClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.costoPliegoBsAuAu.description}
                  </FormDescription>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="costoPliegoBsAuAu"
                      render={({ field }) => (
                        <LocalizedDecimalInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          placeholder={LLAMADO_PUBLICO_FIELD_COPY.costoPliegoBsAuAu.placeholder}
                          className={inputClass}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <div className="max-w-2xl space-y-2 rounded-md border border-dashed border-navy/25 bg-white/70 p-3">
              <p className={labelClass}>{LLAMADO_CUENTA_SELECT_LABEL}</p>
              {cuentas.length > 0 ? (
                <Select
                  value={activeSelectedCuentaId || undefined}
                  onValueChange={handleSelectCuenta}
                  disabled={readOnly}
                >
                  <SelectTrigger className={cn(inputClass, "w-full")}>
                    <SelectValue placeholder={LLAMADO_CUENTA_SELECT_PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.id}>
                        {formatCuentaBancariaOptionLabel(cuenta)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {LLAMADO_CUENTA_SELECT_EMPTY}{" "}
                  <Link
                    href={ROLE_ROUTES.admin_ente.perfilEnte}
                    className="font-semibold text-navy underline-offset-2 hover:underline"
                  >
                    Ir al Perfil del Ente
                  </Link>
                </p>
              )}
              {activeSelectedCuentaId ? (
                <p className="text-[11px] text-muted-foreground">
                  Datos de pago autocompletados. Puede ajustarlos abajo si lo necesita.
                </p>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="bancoPagoPliegoAuAu"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <p className={labelClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.bancoPagoPliegoAuAu.label}
                  </p>
                  <FormDescription className={descriptionClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.bancoPagoPliegoAuAu.description}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} disabled={readOnly} className={inputClass} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rifPagoPliegoAuAu"
              render={() => (
                <FormItem className="max-w-2xl">
                  <p className={labelClass}>{LLAMADO_PUBLICO_FIELD_COPY.rifPagoPliegoAuAu.label}</p>
                  <FormDescription className={descriptionClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.rifPagoPliegoAuAu.description}
                  </FormDescription>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="rifPagoPliegoAuAu"
                      render={({ field }) => (
                        <RifJgInput
                          name={field.name}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuentaPagoPliegoAuAu"
              render={() => (
                <FormItem className="max-w-2xl">
                  <p className={labelClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.cuentaPagoPliegoAuAu.label}
                  </p>
                  <FormDescription className={descriptionClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.cuentaPagoPliegoAuAu.description}
                  </FormDescription>
                  <FormControl>
                    <Controller
                      control={form.control}
                      name="cuentaPagoPliegoAuAu"
                      render={({ field }) => (
                        <BankAccountInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onBlur={field.onBlur}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                          inputClassName={inputClass}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="titularPagoPliegoAuAu"
              render={({ field }) => (
                <FormItem className="max-w-2xl">
                  <p className={labelClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.titularPagoPliegoAuAu.label}
                  </p>
                  <FormDescription className={descriptionClass}>
                    {LLAMADO_PUBLICO_FIELD_COPY.titularPagoPliegoAuAu.description}
                  </FormDescription>
                  <FormControl>
                    <Input {...field} disabled={readOnly} className={inputClass} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />
          </div>
        ) : null}
      </section>

      {/* Sección C */}
      <section className="space-y-5 border-t border-border pt-8">
        <SectionHeader
          badge={LLAMADO_PUBLICO_SECTIONS.C.badge}
          title={LLAMADO_PUBLICO_SECTIONS.C.title}
        />

        <FormField
          control={form.control}
          name="horaActoRecepAperAuAu"
          render={({ field }) => (
            <FormItem className="max-w-md">
              <p className={labelClass}>{LLAMADO_PUBLICO_FIELD_COPY.horaActoRecepAperAuAu.label}</p>
              <FormDescription className={descriptionClass}>
                {LLAMADO_PUBLICO_FIELD_COPY.horaActoRecepAperAuAu.description}
              </FormDescription>
              <p className="text-[11px] italic text-muted-foreground/70">
                {LLAMADO_PUBLICO_FIELD_COPY.horaActoRecepAperAuAu.placeholder}
              </p>
              <FormControl>
                <div className={cn(readOnly && "pointer-events-none opacity-60")}>
                  <HoraActoRecepFields
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </div>
              </FormControl>
              <FormMessage className={messageClass} />
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
