"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  unidadContratanteSchema,
  type UnidadContratanteFormValues,
} from "@/lib/schemas/unidadContratanteSchema";
import {
  registrarUnidadContratante,
  obtenerUnidadContratante,
  actualizarUnidadContratante,
} from "@/services/unidadContratanteService";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UnidadContratanteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UnidadContratanteFormValues>({
    resolver: zodResolver(unidadContratanteSchema),
    defaultValues: {
      nombreUnidadContratante: "",
      nombreResponsableUnidad: "",
      cargoResponsable: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      obtenerUnidadContratante(editId)
        .then((data) => {
          if (data) {
            form.reset({
              nombreUnidadContratante: data.nombreUnidadContratante || "",
              nombreResponsableUnidad: data.nombreResponsableUnidad || "",
              cargoResponsable: data.cargoResponsable || "",
            });
          }
        })
        .catch((err) => {
          toast.error("Error al cargar los datos para edición");
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editId, form]);

  const onSubmit = async (values: UnidadContratanteFormValues) => {
    setIsLoading(true);
    try {
      if (editId) {
        await actualizarUnidadContratante(editId, values);
        toast.success("Unidad Contratante actualizada exitosamente.");
      } else {
        await registrarUnidadContratante(values);
        toast.success("Unidad Contratante creada exitosamente.");
      }

      router.refresh();
      setTimeout(() => {
        router.push("/gestion-datos/estructura-organizativa");
      }, 500);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : editId
            ? "Error al actualizar la Unidad Contratante"
            : "Error al registrar la Unidad Contratante";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          {editId
            ? "Editar datos de la Unidad Contratante"
            : "Registra los datos de la Unidad Contratante"}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Artículos 6.2 LCP; 18.4 LOPA; 15 y 24 NORMAS DE CONTROL INTERNO SUNAI.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        <Form {...form}>
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-0">
              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="nombreUnidadContratante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el nombre de la Unidad, Gerencia u Oficina que funge como Unidad
                        Contratante.
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: División de Compras, Gerencia de Contrataciones.
                      </p>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                          className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-1/2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="nombreResponsableUnidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el nombre y apellido del Responsable de la Unidad Contratante.
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: Luis Alberto Leal Gómez
                      </p>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                          className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-1/2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="cargoResponsable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el cargo del Responsable de la Unidad Contratante.
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: Administrador
                      </p>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          disabled={isLoading}
                          className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-1/2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4 mt-8 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isLoading}
                  className="bg-[#1B456F] hover:bg-[#1B456F]/90 text-white font-inter px-8 h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                    </>
                  ) : editId ? (
                    "Actualizar Unidad Contratante"
                  ) : (
                    "Agregar Unidad Contratante"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
