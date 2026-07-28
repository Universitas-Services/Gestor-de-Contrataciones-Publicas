"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import { BusinessDayCalendar } from "@/components/shared/BusinessDayCalendar";
import { completarCronogramaDesdeFechaAncla } from "@/lib/modalidades/completarCronogramaDesdeFechaAncla";
import {
  getFechaAnclaLabel,
  isConsultaPrecios,
  isContratacionDirecta,
  isModalidadExcluida,
} from "@/lib/modalidades/modalidadDisplay";
import { useDiasNoLaborables } from "@/hooks/useDiasNoLaborables";
import { cn } from "@/lib/utils";
import {
  editarExpediente,
  guardarCronograma,
  type ExpedienteResponse,
} from "@/services/expedienteService";
import { listarComisionesContrataciones } from "@/services/comisionContratacionesService";
import { listarMaximasAutoridades } from "@/services/maximaAutoridadService";
import { listarUnidadesUsuarias } from "@/services/unidadUsuariaService";

interface AutoridadOption {
  value: string;
  label: string;
  esDelegado: boolean;
}

const editarFichaFieldsSchema = z.object({
  descripcionObjeto: z
    .string()
    .min(1, "La descripción del objeto del procedimiento es requerida")
    .max(500, "Máximo 500 caracteres"),
  codigoNomenclatura: z
    .string()
    .min(1, "El código de nomenclatura es requerido")
    .max(100, "Máximo 100 caracteres"),
  autoridadId: z.string().min(1, "Debe seleccionar una Máxima Autoridad"),
  autoridadFirmaComoDelegado: z.boolean(),
  unidadUsuariaId: z.string().min(1, "Debe seleccionar una Unidad Usuaria"),
  comisionId: z.string().optional(),
  fechaAncla: z.string().optional(),
});

type EditarFichaFormValues = z.infer<typeof editarFichaFieldsSchema>;

function buildEditarFichaSchema(requiresComision: boolean, needsCronogramaSetup: boolean) {
  return editarFichaFieldsSchema.superRefine((data, ctx) => {
    if (requiresComision && !data.comisionId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["comisionId"],
        message: "Debe seleccionar una Comisión de Contrataciones",
      });
    }
    if (needsCronogramaSetup && !data.fechaAncla?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaAncla"],
        message: "Debe seleccionar la fecha ancla del procedimiento",
      });
    }
  });
}

function shouldRequireComision(expediente: ExpedienteResponse) {
  const modalidadCode = expediente.modalidad?.modalidadSeleccion ?? "";
  const comisionOmitida =
    isModalidadExcluida(modalidadCode) ||
    ((isContratacionDirecta(modalidadCode) || isConsultaPrecios(modalidadCode)) &&
      !expediente.comision);

  return !comisionOmitida;
}

function needsCronogramaSetup(expediente: ExpedienteResponse): boolean {
  return !expediente.cronograma?.fechaLlamadoParticipar;
}

function buildDefaultValues(expediente: ExpedienteResponse): EditarFichaFormValues {
  return {
    descripcionObjeto: expediente.descripcionObjeto ?? "",
    codigoNomenclatura: expediente.codigoNomenclatura ?? "",
    autoridadId: expediente.autoridad?.id ?? "",
    autoridadFirmaComoDelegado: expediente.autoridadFirmaComoDelegado ?? false,
    unidadUsuariaId: expediente.unidadUsuaria?.id ?? "",
    comisionId: expediente.comision?.id ? String(expediente.comision.id) : "",
    fechaAncla: "",
  };
}

export interface EditarFichaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expediente: ExpedienteResponse;
}

export function EditarFichaModal({ open, onOpenChange, expediente }: EditarFichaModalProps) {
  const router = useRouter();
  const requiresComision = useMemo(() => shouldRequireComision(expediente), [expediente]);
  const showFechaAncla = useMemo(() => needsCronogramaSetup(expediente), [expediente]);
  const modalidadCode = expediente.modalidad?.modalidadSeleccion ?? "";
  const fechaAnclaLabel = getFechaAnclaLabel(modalidadCode);
  const schema = useMemo(
    () => buildEditarFichaSchema(requiresComision, showFechaAncla),
    [requiresComision, showFechaAncla]
  );

  const feriadosRange = useMemo(() => {
    const year = new Date().getFullYear();
    return {
      desde: `${year - 1}-01-01`,
      hasta: `${year + 5}-12-31`,
      fromYear: year - 1,
      toYear: year + 5,
    };
  }, []);
  const { nonWorkingDays, feriadoDescriptions } = useDiasNoLaborables(
    showFechaAncla ? feriadosRange.desde : null,
    showFechaAncla ? feriadosRange.hasta : null
  );

  const [autoridades, setAutoridades] = useState<AutoridadOption[]>([]);
  const [comisiones, setComisiones] = useState<{ value: string; label: string }[]>([]);
  const [unidades, setUnidades] = useState<{ value: string; label: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<EditarFichaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(expediente),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(buildDefaultValues(expediente));
  }, [open, expediente, form]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const load = async () => {
      setLoadingOptions(true);
      try {
        const [autoridadesData, unidadesData, comisionesData] = await Promise.all([
          listarMaximasAutoridades(),
          listarUnidadesUsuarias(),
          requiresComision ? listarComisionesContrataciones() : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const autoridadOpts: AutoridadOption[] = [];
        for (const a of Array.isArray(autoridadesData)
          ? (autoridadesData as Array<{
              id: string;
              nombreCompletoAutoridad: string;
              cargoOficialAutoridad: string;
              esDelegado: boolean;
              nombreCompletoDelegado?: string;
              cargoOficialDelegado?: string;
            }>)
          : []) {
          autoridadOpts.push({
            value: a.id,
            label: `${a.nombreCompletoAutoridad} — ${a.cargoOficialAutoridad}`,
            esDelegado: false,
          });

          if (a.esDelegado && a.nombreCompletoDelegado) {
            autoridadOpts.push({
              value: `${a.id}__delegado`,
              label: `${a.nombreCompletoDelegado} — ${a.cargoOficialDelegado ?? "Delegado"} (Delegado)`,
              esDelegado: true,
            });
          }
        }
        setAutoridades(autoridadOpts);

        setUnidades(
          (Array.isArray(unidadesData)
            ? (unidadesData as Array<{ id: string | number; nombreUnidadUsuaria?: string }>)
            : []
          ).map((u) => ({
            value: String(u.id),
            label: u.nombreUnidadUsuaria ?? `Unidad ${u.id}`,
          }))
        );

        setComisiones(
          (Array.isArray(comisionesData)
            ? (comisionesData as Array<{ id: string | number; denominacionComision?: string }>)
            : []
          ).map((c) => ({
            value: String(c.id),
            label: c.denominacionComision ?? `Comisión ${c.id}`,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Error al cargar actores");
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, requiresComision]);

  const handleAutoridadChange = (rawValue: string) => {
    const esDelegado = rawValue.endsWith("__delegado");
    const realId = esDelegado ? rawValue.replace("__delegado", "") : rawValue;
    form.setValue("autoridadId", realId, { shouldValidate: true });
    form.setValue("autoridadFirmaComoDelegado", esDelegado);
  };

  const autoridadRawValue = form.watch("autoridadFirmaComoDelegado")
    ? `${form.watch("autoridadId")}__delegado`
    : form.watch("autoridadId");

  const onSubmit = async (values: EditarFichaFormValues) => {
    setIsSaving(true);
    try {
      const fechaAncla = values.fechaAncla?.trim();

      await editarExpediente(expediente.id, {
        descripcionObjeto: values.descripcionObjeto,
        codigoNomenclatura: values.codigoNomenclatura,
        autoridadId: values.autoridadId,
        autoridadFirmaComoDelegado: values.autoridadFirmaComoDelegado,
        unidadUsuariaId: values.unidadUsuariaId,
        ...(requiresComision && values.comisionId ? { comisionId: values.comisionId } : {}),
        ...(showFechaAncla && fechaAncla ? { fechaLlamadoParticipar: fechaAncla } : {}),
      });

      if (showFechaAncla && fechaAncla) {
        const { cronograma, usedLocalFallback } = await completarCronogramaDesdeFechaAncla({
          modalidadCode,
          tipoContratacion: expediente.modalidad?.tipoContratacion,
          fechaAncla,
          feriados: nonWorkingDays,
        });

        if (usedLocalFallback) {
          toast.warning("No se pudo obtener el cronograma del servidor; se usó el cálculo local.");
        }

        await guardarCronograma(expediente.id, cronograma);
        toast.success("Ficha y cronograma actualizados correctamente.");
      } else {
        toast.success("Ficha actualizada correctamente.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la ficha.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-inter text-lg font-semibold text-color-titulos">
            Editar ficha
          </DialogTitle>
        </DialogHeader>

        {loadingOptions ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-navy" />
            <p className="text-sm text-slate-500">Cargando datos...</p>
          </div>
        ) : (
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="descripcionObjeto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                      Objeto del procedimiento
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        maxLength={500}
                        className="resize-none border-slate-300 bg-white font-inter text-sm text-slate-700 shadow-none placeholder:text-slate-400"
                        placeholder="Describa el objeto del procedimiento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoNomenclatura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                      Nomenclatura / código
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={100}
                        className="h-10 border-slate-300 bg-white font-inter text-sm text-slate-700 shadow-none placeholder:text-slate-400"
                        placeholder="Indique el número o nomenclatura"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoridadId"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                      Máxima Autoridad
                    </FormLabel>
                    <FormControl>
                      <FormDropdownSelect
                        value={autoridadRawValue || ""}
                        onValueChange={handleAutoridadChange}
                        disabled={isSaving}
                        triggerClassName="h-10 border-slate-300 bg-white text-slate-700 shadow-none"
                        options={autoridades.map((opt) => ({
                          value: opt.value,
                          label: opt.label,
                          className: opt.esDelegado ? "pl-6 text-slate-500 italic" : undefined,
                        }))}
                        placeholder="Seleccione una autoridad"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidadUsuariaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                      Unidad Usuaria
                    </FormLabel>
                    <FormControl>
                      <FormDropdownSelect
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={isSaving}
                        triggerClassName="h-10 border-slate-300 bg-white text-slate-700 shadow-none"
                        options={unidades}
                        placeholder="Seleccione una unidad usuaria"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresComision && (
                <FormField
                  control={form.control}
                  name="comisionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                        Comisión de Contrataciones
                      </FormLabel>
                      <FormControl>
                        <FormDropdownSelect
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={isSaving}
                          triggerClassName="h-10 border-slate-300 bg-white text-slate-700 shadow-none"
                          options={comisiones}
                          placeholder="Seleccione una comisión"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {showFechaAncla && (
                <FormField
                  control={form.control}
                  name="fechaAncla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-inter text-sm font-semibold text-slate-700">
                        {fechaAnclaLabel}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isSaving}
                              className={cn(
                                "h-10 w-full justify-between border-slate-300 bg-white px-3 text-left font-inter text-sm font-normal shadow-none",
                                !field.value ? "text-slate-400" : "text-slate-700"
                              )}
                            >
                              {field.value
                                ? format(new Date(field.value + "T00:00:00"), "dd/MM/yyyy")
                                : "Seleccione una fecha"}
                              <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <BusinessDayCalendar
                            mode="single"
                            captionLayout="dropdown"
                            fromYear={feriadosRange.fromYear}
                            toYear={feriadosRange.toYear}
                            selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                            onSelect={(date) => {
                              if (date) field.onChange(format(date, "yyyy-MM-dd"));
                            }}
                            nonWorkingDays={nonWorkingDays}
                            feriadoDescriptions={feriadoDescriptions}
                            locale={es}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-slate-500 font-inter">
                        Al guardar se calcularán las fechas sugeridas del cronograma.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() => onOpenChange(false)}
                  className="border-slate-300 bg-white font-inter text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-navy font-inter text-white hover:bg-navy-hover"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
