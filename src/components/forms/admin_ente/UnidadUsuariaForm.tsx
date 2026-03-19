"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  unidadUsuariaSchema,
  type UnidadUsuariaFormValues,
} from "@/lib/schemas/unidadUsuariaSchema";
import {
  registrarUnidadUsuaria,
  obtenerUnidadUsuaria,
  actualizarUnidadUsuaria,
} from "@/services/unidadUsuariaService";

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

export function UnidadUsuariaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
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

  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      obtenerUnidadUsuaria(editId)
        .then((data) => {
          if (data) {
            form.reset({
              nombreUnidadUsuaria: data.nombreUnidadUsuaria || "",
              nombreResponsableUnidadUsuaria: data.nombreResponsableUnidadUsuaria || "",
              cargoResponsableUnidadUsuaria: data.cargoResponsableUnidadUsuaria || "",
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

  const onSubmit = async (values: UnidadUsuariaFormValues) => {
    setIsLoading(true);
    try {
      if (editId) {
        await actualizarUnidadUsuaria(editId, values);
        toast.success("Unidad Usuaria actualizada exitosamente.");
      } else {
        await registrarUnidadUsuaria(values);
        toast.success("Unidad Usuaria creada exitosamente.");
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
            ? "Error al actualizar la Unidad Usuaria"
            : "Error al registrar la Unidad Usuaria";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          {editId ? "Editar datos de la Unidad Usuaria" : "Registra los datos de la Unidad Usuaria"}
        </CardTitle>

        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Artículo 18.4 LOPA.
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
                  name="nombreUnidadUsuaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el nombre de la Unidad, Gerencia u Oficina Usuaria
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: Dirección de Infraestructura, Gerencia de Tecnología.
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
                  name="nombreResponsableUnidadUsuaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el nombre y apellido del responsable de la Unidad Usuaria.
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: Hernán Perez González
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
                  name="cargoResponsableUnidadUsuaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                        Indique el cargo del Responsable de la Unidad Usuaria.
                      </FormLabel>
                      <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                        Ejemplo: Gerente, Coordinador, Supervisor
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
                    "Actualizar Unidad Usuaria"
                  ) : (
                    "Agregar Unidad Usuaria"
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
