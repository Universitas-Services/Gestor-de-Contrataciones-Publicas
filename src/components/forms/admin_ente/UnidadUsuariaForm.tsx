"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import {
  unidadUsuariaSchema,
  type UnidadUsuariaFormValues,
} from "@/lib/schemas/unidadUsuariaSchema";
import { registrarUnidadUsuaria } from "@/services/unidadUsuariaService";
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

export function UnidadUsuariaForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UnidadUsuariaFormValues>({
    resolver: zodResolver(unidadUsuariaSchema),
    defaultValues: {
      nombreUnidadUsuaria: "",
      nombreResponsableUnidadUsuaria: "",
      cargoResponsableUnidadUsuaria: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: UnidadUsuariaFormValues) => {
    setIsLoading(true);
    try {
      await registrarUnidadUsuaria(values);
      toast.success("Unidad creada exitosamente.");
      form.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar la Unidad Usuaria";
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
          name="nombreUnidadUsuaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Unidad Usuaria</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Dirección de Tecnología" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombreResponsableUnidadUsuaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Responsable</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargoResponsableUnidadUsuaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo del Responsable</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Director" {...field} />
              </FormControl>
              <FormMessage />
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
            {isLoading ? "Registrando..." : "Registrar Unidad Usuaria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
