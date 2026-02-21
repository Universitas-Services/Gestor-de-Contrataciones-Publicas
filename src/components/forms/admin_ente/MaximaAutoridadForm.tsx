"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  maximaAutoridadSchema,
  type MaximaAutoridadFormValues,
} from "@/lib/schemas/maximaAutoridadSchema";
import { registrarMaximaAutoridad } from "@/services/maximaAutoridadService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MaximaAutoridadForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MaximaAutoridadFormValues>({
    resolver: zodResolver(maximaAutoridadSchema),
    defaultValues: {
      nombreCompletoAutoridad: "",
      cedulaAutoridad: "",
      cargoOficialAutoridad: "",
      datosDesignacionAutoridad: "",
      leyesAtribucionesSuscribirAutoridad: "",
      esDelegado: false,
      vigente: false,
      nombreCompletoDelegado: "",
      cedulaDelegado: "",
      cargoOficialDelegado: "",
      datosDesignacionDelegado: "",
      leyesAtribucionesSuscribirDelegado: "",
    },
    mode: "onChange",
  });

  const esDelegado = form.watch("esDelegado");

  const onSubmit = async (values: MaximaAutoridadFormValues) => {
    setIsLoading(true);
    try {
      // Si no es delegado, se omiten los campos del delegado del payload
      const payload = esDelegado
        ? values
        : {
            nombreCompletoAutoridad: values.nombreCompletoAutoridad,
            cedulaAutoridad: values.cedulaAutoridad,
            cargoOficialAutoridad: values.cargoOficialAutoridad,
            datosDesignacionAutoridad: values.datosDesignacionAutoridad,
            leyesAtribucionesSuscribirAutoridad: values.leyesAtribucionesSuscribirAutoridad,
            esDelegado: false,
            vigente: values.vigente,
          };

      await registrarMaximaAutoridad(payload);
      toast.success("Autoridad creada exitosamente.");
      form.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar la Máxima Autoridad";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* ── Sección: Datos de la Autoridad ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground border-b pb-2">
            Datos de la Autoridad
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nombreCompletoAutoridad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo de la Autoridad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. María Rodríguez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cedulaAutoridad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de la Autoridad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. V-12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="cargoOficialAutoridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo Oficial de la Autoridad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Alcaldesa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="datosDesignacionAutoridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datos de Designación de la Autoridad</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Gaceta Municipal Nro. 123 de fecha 01/01/2024"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="leyesAtribucionesSuscribirAutoridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leyes y Atribuciones para Suscribir (Autoridad)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Artículos 45 y 46 de la Ley Orgánica de..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Sección: Estado ── */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground border-b pb-2">Estado</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="vigente"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-lg border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="vigente"
                      className="h-4 w-4 accent-primary cursor-pointer"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="vigente" className="cursor-pointer font-normal mb-0">
                    Vigente
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="esDelegado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-lg border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="esDelegado"
                      className="h-4 w-4 accent-primary cursor-pointer"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="esDelegado" className="cursor-pointer font-normal mb-0">
                    Es Delegado
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ── Sección: Datos del Delegado (condicional) ── */}
        {esDelegado && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground border-b pb-2">
              Datos del Delegado
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nombreCompletoDelegado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo del Delegado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Pedro Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cedulaDelegado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula del Delegado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. V-87654321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cargoOficialDelegado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo Oficial del Delegado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Director General" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="datosDesignacionDelegado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datos de Designación del Delegado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Resolución Nro. 001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leyesAtribucionesSuscribirDelegado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leyes y Atribuciones para Suscribir (Delegado)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Artículo 12 de la Ley..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ── Botón de Submit ── */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className="min-w-[220px]"
          >
            {isLoading ? "Registrando..." : "Registrar Máxima Autoridad"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
