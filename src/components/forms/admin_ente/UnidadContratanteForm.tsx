"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  unidadContratanteSchema,
  type UnidadContratanteFormValues,
} from "@/lib/schemas/unidadContratanteSchema";
import { registrarUnidadContratante } from "@/services/unidadContratanteService";
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

export function UnidadContratanteForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UnidadContratanteFormValues>({
    resolver: zodResolver(unidadContratanteSchema),
    defaultValues: {
      nombreUnidadContratante: "",
      nombreResponsableUnidad: "",
      cargoResponsable: "",
      activa: false,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: UnidadContratanteFormValues) => {
    setIsLoading(true);
    try {
      await registrarUnidadContratante(values);
      toast.success("Unidad creada exitosamente.");
      form.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar la Unidad Contratante";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombreUnidadContratante"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Unidad Contratante</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Comisión de Contrataciones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombreResponsableUnidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Responsable de la Unidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Ana Gómez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargoResponsable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo del Responsable</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Presidenta de la Comisión" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activa"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 rounded-lg border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  id="activa"
                  className="h-4 w-4 accent-primary cursor-pointer"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel htmlFor="activa" className="cursor-pointer font-normal mb-0">
                Activa
              </FormLabel>
            </FormItem>
          )}
        />

        {/* ── Botón de Submit ── */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isLoading}
            className="min-w-[220px]"
          >
            {isLoading ? "Registrando..." : "Registrar Unidad Contratante"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
