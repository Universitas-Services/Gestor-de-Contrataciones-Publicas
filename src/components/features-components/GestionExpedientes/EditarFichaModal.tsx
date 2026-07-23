"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { FormDropdownSelect } from "@/components/features-components/GestionExpedientes/FormDropdownSelect";
import {
  isConsultaPrecios,
  isContratacionDirecta,
  isModalidadExcluida,
} from "@/lib/modalidades/modalidadDisplay";
import { editarExpediente, type ExpedienteResponse } from "@/services/expedienteService";
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
});

type EditarFichaFormValues = z.infer<typeof editarFichaFieldsSchema>;

function buildEditarFichaSchema(requiresComision: boolean) {
  return editarFichaFieldsSchema.superRefine((data, ctx) => {
    if (requiresComision && !data.comisionId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["comisionId"],
        message: "Debe seleccionar una Comisión de Contrataciones",
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

function buildDefaultValues(expediente: ExpedienteResponse): EditarFichaFormValues {
  return {
    descripcionObjeto: expediente.descripcionObjeto ?? "",
    codigoNomenclatura: expediente.codigoNomenclatura ?? "",
    autoridadId: expediente.autoridad?.id ?? "",
    autoridadFirmaComoDelegado: expediente.autoridadFirmaComoDelegado ?? false,
    unidadUsuariaId: expediente.unidadUsuaria?.id ?? "",
    comisionId: expediente.comision?.id ? String(expediente.comision.id) : "",
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
  const schema = useMemo(() => buildEditarFichaSchema(requiresComision), [requiresComision]);

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
      await editarExpediente(expediente.id, {
        descripcionObjeto: values.descripcionObjeto,
        codigoNomenclatura: values.codigoNomenclatura,
        autoridadId: values.autoridadId,
        autoridadFirmaComoDelegado: values.autoridadFirmaComoDelegado,
        unidadUsuariaId: values.unidadUsuariaId,
        ...(requiresComision && values.comisionId ? { comisionId: values.comisionId } : {}),
      });

      toast.success("Ficha actualizada correctamente.");
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
