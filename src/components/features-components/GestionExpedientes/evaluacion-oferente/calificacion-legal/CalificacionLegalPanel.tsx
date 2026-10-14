"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CircleCheck, Loader2 } from "lucide-react";
import { IoEyeOutline } from "react-icons/io5";
import { toast } from "sonner";

import { RecaudoCotejoCard } from "@/components/features-components/GestionExpedientes/evaluacion-oferente/calificacion-legal/RecaudoCotejoCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CALIFICACION_LEGAL_ALERT_CUMPLE,
  CALIFICACION_LEGAL_ALERT_NO_CUMPLE,
  CALIFICACION_LEGAL_EVAL_SUBTITLE,
  CALIFICACION_LEGAL_EVAL_TITLE,
  CALIFICACION_LEGAL_JUSTIFICACION_ARTICULOS,
  CALIFICACION_LEGAL_JUSTIF_CUMPLE,
  CALIFICACION_LEGAL_JUSTIF_NO_CUMPLE,
  itemsBySobre,
  OBS_MAX_LEN,
  resolveDictamenLegal,
  resolveDictamenLegalConVerificaciones,
  VERIFICACION_CRS_LEGAL,
  VERIFICACION_CRS_PREGUNTA,
  VERIFICACION_GARANTIA_LEGAL,
  VERIFICACION_GARANTIA_PREGUNTA,
} from "@/lib/constants/calificacionLegalEvaluacion";
import { cn } from "@/lib/utils";
import {
  createCalificacionLegalSubmitSchema,
  createSobre1SiguienteSchema,
} from "@/lib/schemas/calificacionLegalEvaluacionSchema";
import type {
  CalificacionLegalEvaluacionValues,
  ChecklistSiNo,
  RecaudoCotejoItem,
} from "@/types/evaluacionOferente.types";

interface CalificacionLegalPanelProps {
  items: RecaudoCotejoItem[];
  defaultValues: CalificacionLegalEvaluacionValues;
  readOnly?: boolean;
  saving?: boolean;
  onDraft: (values: CalificacionLegalEvaluacionValues) => void;
  onConfirm: (values: CalificacionLegalEvaluacionValues, cumple: boolean) => void;
}

export function CalificacionLegalPanel({
  items,
  defaultValues,
  readOnly = false,
  saving = false,
  onDraft,
  onConfirm,
}: CalificacionLegalPanelProps) {
  const [sobreTab, setSobreTab] = useState<"1" | "2">("1");
  const [obsAbiertas, setObsAbiertas] = useState<Record<string, boolean>>(() => ({
    obsVerificadoGarantia: Boolean(defaultValues.obsVerificadoGarantia?.trim()),
    obsVerificadoCrs: Boolean(defaultValues.obsVerificadoCrs?.trim()),
  }));
  const [sobre1Transicion, setSobre1Transicion] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const submitSchema = useMemo(() => createCalificacionLegalSubmitSchema(items), [items]);
  const siguienteSchema = useMemo(() => createSobre1SiguienteSchema(items), [items]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [sobreTab]);

  const form = useForm<CalificacionLegalEvaluacionValues>({
    resolver: zodResolver(submitSchema) as Resolver<CalificacionLegalEvaluacionValues>,
    defaultValues,
    mode: "onSubmit",
  });

  const watched = form.watch();
  const sobre1Items = itemsBySobre(items, 1);
  const sobre2Items = itemsBySobre(items, 2);

  const dictamenSobre1 = resolveDictamenLegal(items, watched.items, 1);
  const dictamenGlobal = resolveDictamenLegalConVerificaciones(items, watched);

  const showJustificacion = dictamenGlobal !== null;
  const justifLabel =
    dictamenGlobal === false
      ? CALIFICACION_LEGAL_JUSTIF_NO_CUMPLE
      : CALIFICACION_LEGAL_JUSTIF_CUMPLE;

  const toggleObs = (id: string) => {
    setObsAbiertas((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setConsignado = (id: string, valor: ChecklistSiNo) => {
    form.setValue(`items.${id}.consignado`, valor, { shouldDirty: true, shouldValidate: false });
    form.clearErrors(`items.${id}.consignado`);
  };

  const handleSiguiente = () => {
    const parsed = siguienteSchema.safeParse(form.getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path as (string | number)[];
        if (path[0] === "items" && typeof path[1] === "string") {
          form.setError(`items.${path[1]}.consignado`, { type: "manual", message: issue.message });
        }
      }
      toast.error("Debe evaluar todos los recaudos obligatorios del Sobre N° 1.");
      return;
    }
    const dictamen = resolveDictamenLegal(
      items,
      parsed.data.items as CalificacionLegalEvaluacionValues["items"],
      1
    );
    setSobre1Transicion(dictamen);
    setSobreTab("2");
  };

  const handleDraft = () => {
    onDraft(form.getValues());
    toast.success("Progreso guardado");
  };

  const handleConfirm = form.handleSubmit(
    (values) => {
      const cumple = resolveDictamenLegalConVerificaciones(items, values) === true;
      onConfirm(values, cumple);
    },
    (errors) => {
      toast.error("Complete todos los recaudos obligatorios y la justificación.");
      const itemErrors = errors.items;
      const hasSobre1 = sobre1Items.some((item) => itemErrors?.[item.id]);
      const hasSobre2 =
        sobre2Items.some((item) => itemErrors?.[item.id]) ||
        Boolean(errors.indVerificadoGarantia || errors.indVerificadoCrs);
      if (hasSobre1) setSobreTab("1");
      else if (hasSobre2) setSobreTab("2");
    }
  );

  const renderLista = (lista: RecaudoCotejoItem[]) =>
    lista.map((item, index) => (
      <RecaudoCotejoCard
        key={item.id}
        index={index + 1}
        item={item}
        consignado={watched.items[item.id]?.consignado}
        observacion={watched.items[item.id]?.observacion ?? ""}
        obsAbierta={Boolean(obsAbiertas[item.id])}
        error={Boolean(form.formState.errors.items?.[item.id]?.consignado)}
        readOnly={readOnly}
        onToggle={(valor) => setConsignado(item.id, valor)}
        onToggleObs={() => toggleObs(item.id)}
        onChangeObs={(value) =>
          form.setValue(`items.${item.id}.observacion`, value, { shouldDirty: true })
        }
      />
    ));

  const renderVerificacion = (
    index: number,
    field: "indVerificadoGarantia" | "indVerificadoCrs",
    pregunta: string,
    legal: string
  ) => {
    const valor = watched[field];
    const error = form.formState.errors[field]?.message;
    const optionClass = (active: boolean) =>
      cn(
        "h-8 rounded border px-4 text-[11px] font-bold transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500",
        readOnly && "cursor-not-allowed opacity-60"
      );
    const select = (v: boolean) => {
      form.setValue(field, v, { shouldDirty: true });
      form.clearErrors(field);
    };
    const obsField =
      field === "indVerificadoGarantia" ? "obsVerificadoGarantia" : "obsVerificadoCrs";
    const observacion = watched[obsField] ?? "";
    const obsAbierta = Boolean(obsAbiertas[obsField]);
    const hasObs = observacion.trim().length > 0;

    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all",
          error ? "border-destructive" : "border-slate-200 hover:border-slate-300"
        )}
      >
        <div className="flex min-h-[72px] items-center justify-between gap-3 p-4">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[13px] font-bold leading-snug text-color-titulos">
              <span className="mr-1">{index}.</span> {pregunta}
            </p>
            <p className="mt-1 text-[11px] italic text-muted-foreground">
              Sobre N° 2 · Documento obligatorio · {legal}
            </p>
            {error ? (
              <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => select(true)}
              className={optionClass(valor === true)}
            >
              SI
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => select(false)}
              className={optionClass(valor === false)}
            >
              NO
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => toggleObs(obsField)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded border px-3 text-[11px] font-bold transition-colors",
                hasObs || obsAbierta
                  ? "border-[var(--obs-button)] bg-[var(--obs-bg)] text-[var(--obs-button)]"
                  : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-500",
                readOnly && "cursor-not-allowed opacity-60"
              )}
            >
              <IoEyeOutline className="h-[14px] w-[14px]" />
              OBSERVACIÓN
            </button>
          </div>
        </div>
        {obsAbierta ? (
          <div className="animate-in slide-in-from-top-2 px-4 pb-4">
            <Textarea
              value={observacion}
              disabled={readOnly}
              maxLength={OBS_MAX_LEN}
              rows={2}
              placeholder="Escriba su observación aquí..."
              onChange={(e) => form.setValue(obsField, e.target.value, { shouldDirty: true })}
              className="min-h-16 resize-none border-[var(--obs-button)] bg-[var(--obs-bg)] text-[12px] italic text-color-titulos focus-visible:ring-[var(--obs-button)]"
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <div className="z-10 flex shrink-0 flex-col gap-4 border-b border-slate-200 bg-white px-6 py-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-color-titulos">
            {CALIFICACION_LEGAL_EVAL_TITLE}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{CALIFICACION_LEGAL_EVAL_SUBTITLE}</p>
        </div>
        <Tabs
          value={sobreTab}
          onValueChange={(v) => setSobreTab(v as "1" | "2")}
          className="shrink-0"
        >
          <TabsList>
            <TabsTrigger value="1">Sobre N° 1</TabsTrigger>
            <TabsTrigger value="2">Sobre N° 2</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-4xl space-y-4 pb-8">
          {sobreTab === "1" ? (
            <>
              {dictamenSobre1 === false ? (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertDescription className="text-sm font-semibold">
                    {CALIFICACION_LEGAL_ALERT_NO_CUMPLE}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="mb-2 flex items-center gap-3 py-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white shadow-sm">
                  A
                </div>
                <div>
                  <h3 className="text-[17px] font-bold leading-tight text-navy">
                    Contenido sobre N° 1
                  </h3>
                  <p className="text-[13px] italic text-muted-foreground">
                    Recaudos legales y financieros
                  </p>
                </div>
              </div>

              <div className="space-y-3">{renderLista(sobre1Items)}</div>
            </>
          ) : (
            <>
              {sobre1Transicion === true && dictamenGlobal !== false ? (
                <Alert className="border-success/30 bg-success-bg text-success-text">
                  <CircleCheck />
                  <AlertDescription className="text-sm font-semibold text-success-text">
                    {CALIFICACION_LEGAL_ALERT_CUMPLE}
                  </AlertDescription>
                </Alert>
              ) : null}
              {sobre1Transicion === false || dictamenGlobal === false ? (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertDescription className="text-sm font-semibold">
                    {CALIFICACION_LEGAL_ALERT_NO_CUMPLE}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="mb-2 flex items-center gap-3 py-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white shadow-sm">
                  B
                </div>
                <div>
                  <h3 className="text-[17px] font-bold leading-tight text-navy">
                    Contenido sobre N° 2
                  </h3>
                  <p className="text-[13px] italic text-muted-foreground">
                    Oferta técnica y económica
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {renderLista(sobre2Items)}
                {renderVerificacion(
                  sobre2Items.length + 1,
                  "indVerificadoGarantia",
                  VERIFICACION_GARANTIA_PREGUNTA,
                  VERIFICACION_GARANTIA_LEGAL
                )}
                {renderVerificacion(
                  sobre2Items.length + 2,
                  "indVerificadoCrs",
                  VERIFICACION_CRS_PREGUNTA,
                  VERIFICACION_CRS_LEGAL
                )}
              </div>
            </>
          )}

          {showJustificacion ? (
            <Card className="mt-4 overflow-hidden rounded-lg border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div>
                  <h4 className="text-sm font-bold text-color-titulos">
                    Justificación de la Calificación Legal
                  </h4>
                  <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                    {CALIFICACION_LEGAL_JUSTIFICACION_ARTICULOS}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-color-titulos">{justifLabel}</Label>
                  <Textarea
                    value={watched.justificacion}
                    disabled={readOnly}
                    rows={3}
                    placeholder="Redacte su justificación..."
                    onChange={(e) =>
                      form.setValue("justificacion", e.target.value, { shouldDirty: true })
                    }
                    className="resize-none"
                    aria-invalid={Boolean(form.formState.errors.justificacion)}
                  />
                  {form.formState.errors.justificacion ? (
                    <p className="text-[11px] font-medium text-destructive">
                      {form.formState.errors.justificacion.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <div className="z-20 flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-5 md:px-8">
        <Button
          type="button"
          variant="outline"
          disabled={saving || readOnly}
          onClick={handleDraft}
          className="h-11 rounded-md border-slate-200 px-8 font-semibold text-slate-500 hover:bg-slate-50"
        >
          Guardar borrador
        </Button>

        {sobreTab === "1" ? (
          <Button
            type="button"
            disabled={readOnly || saving}
            onClick={handleSiguiente}
            className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            disabled={readOnly || saving}
            onClick={() => void handleConfirm()}
            className="h-11 rounded-md bg-navy px-8 font-semibold text-white hover:bg-navy-hover disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </span>
            ) : (
              "Guardar calificación legal y continuar"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
