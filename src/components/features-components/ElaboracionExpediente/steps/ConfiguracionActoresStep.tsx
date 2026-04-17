"use client";

import React, { useState, useEffect } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { configuracionActoresSchema } from "@/lib/schemas/expedienteSchema";
import type { ConfiguracionActoresFormValues } from "@/lib/schemas/expedienteSchema";
import { listarMaximasAutoridades } from "@/services/maximaAutoridadService";
import { listarComisionesContrataciones } from "@/services/comisionContratacionesService";
import { listarUnidadesUsuarias } from "@/services/unidadUsuariaService";

// ─── Tipos ────────────────────────────────────────────────────────────

interface AutoridadOption {
  value: string; // UUID de la autoridad
  label: string; // Texto a mostrar
  esDelegado: boolean; // true → este ítem representa al delegado
}

// ─── Props ────────────────────────────────────────────────────────────

interface ConfiguracionActoresStepProps {
  onFinish: (data: ConfiguracionActoresFormValues) => void;
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────

export function ConfiguracionActoresStep({
  onFinish,
  isLoading = false,
}: ConfiguracionActoresStepProps) {
  const [autoridades, setAutoridades] = useState<AutoridadOption[]>([]);
  const [comisiones, setComisiones] = useState<{ value: string; label: string }[]>([]);
  const [unidades, setUnidades] = useState<{ value: string; label: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const form = useForm<ConfiguracionActoresFormValues>({
    resolver: zodResolver(configuracionActoresSchema),
    defaultValues: {
      autoridadId: "",
      autoridadFirmaComoDelegado: false,
      comisionId: "",
      unidadUsuariaId: "",
      fechaLlamadoParticipar: "",
    },
  });

  // Carga de opciones desde el backend
  useEffect(() => {
    const load = async () => {
      setLoadingOptions(true);
      try {
        const [autoridadesData, comisionesData, unidadesData] = await Promise.all([
          listarMaximasAutoridades(),
          listarComisionesContrataciones(),
          listarUnidadesUsuarias(),
        ]);

        // Construir opciones de autoridades — una opción por autoridad, y si tiene
        // delegado ("esDelegado": true), una opción adicional para el delegado.
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
          // Opción 1: la autoridad propia
          autoridadOpts.push({
            value: a.id,
            label: `${a.nombreCompletoAutoridad} — ${a.cargoOficialAutoridad}`,
            esDelegado: false,
          });

          // Opción 2 (si tiene delegado): el delegado usa el mismo autoridadId
          if (a.esDelegado && a.nombreCompletoDelegado) {
            autoridadOpts.push({
              value: `${a.id}__delegado`,
              label: `${a.nombreCompletoDelegado} — ${a.cargoOficialDelegado ?? "Delegado"} (Delegado)`,
              esDelegado: true,
            });
          }
        }
        setAutoridades(autoridadOpts);

        setComisiones(
          (Array.isArray(comisionesData)
            ? (comisionesData as Array<{ id: string | number; denominacionComision?: string }>)
            : []
          ).map((c) => ({
            value: String(c.id),
            label: c.denominacionComision ?? `Comisión ${c.id}`,
          }))
        );

        setUnidades(
          (Array.isArray(unidadesData)
            ? (unidadesData as Array<{ id: string | number; nombreUnidadUsuaria?: string }>)
            : []
          ).map((u) => ({
            value: String(u.id),
            label: u.nombreUnidadUsuaria ?? `Unidad ${u.id}`,
          }))
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al cargar actores");
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, []);

  // Cuando el usuario elige una autoridad/delegado:
  // — Se guarda el UUID real (sin el sufijo __delegado)
  // — Se activa/desactiva autoridadFirmaComoDelegado
  const handleAutoridadChange = (rawValue: string) => {
    const esDelegado = rawValue.endsWith("__delegado");
    const realId = esDelegado ? rawValue.replace("__delegado", "") : rawValue;
    form.setValue("autoridadId", realId, { shouldValidate: true });
    form.setValue("autoridadFirmaComoDelegado", esDelegado);
  };

  // Valor compuesto para mostrar el select correctamente
  const autoridadRawValue = form.watch("autoridadFirmaComoDelegado")
    ? `${form.watch("autoridadId")}__delegado`
    : form.watch("autoridadId");

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) onFinish(form.getValues());
  };

  if (loadingOptions) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
        <p className="text-slate-500 text-sm">Cargando actores disponibles...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-0">
        {/* Máxima Autoridad / Delegado */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="autoridadId"
            render={() => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Seleccione la Máxima Autoridad o Delegado que suscribe los actos
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                  Si selecciona al delegado, el campo &quot;Autoridad firma como delegado&quot; se
                  marcará automáticamente en el expediente.
                </p>
                <Select
                  onValueChange={handleAutoridadChange}
                  value={autoridadRawValue || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-600">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {autoridades.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className={`font-inter ${opt.esDelegado ? "pl-6 text-slate-500 italic" : ""}`}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Comisión de Contrataciones */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="comisionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Seleccione la Comisión de Contrataciones encargada del procedimiento
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-600">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {comisiones.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="font-inter">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Unidad Usuaria */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="unidadUsuariaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Seleccione la Unidad Usuaria solicitante
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="w-full md:w-2/3 lg:w-1/2 h-10 bg-white border-slate-300 rounded-md text-sm font-inter text-slate-600">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unidades.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="font-inter">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fecha del Llamado */}
        <div className="mb-8">
          <FormField
            control={form.control}
            name="fechaLlamadoParticipar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading-dark font-bold font-inter text-base">
                  Indique la fecha del Llamado a participar
                </FormLabel>
                <p className="text-slate-500 italic text-sm mt-0.5 mb-3 font-inter">
                  Artículos 79, 95 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-[260px] h-10 justify-start text-left font-normal border-slate-300 rounded-md ${
                          !field.value ? "text-slate-400" : "text-heading-dark"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                        {field.value
                          ? format(new Date(field.value + "T00:00:00"), "PPP", { locale: es })
                          : "Seleccione una fecha"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        if (date) field.onChange(format(date, "yyyy-MM-dd"));
                      }}
                      disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Crear Cronograma"
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
