"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  maximaAutoridadSchema,
  type MaximaAutoridadFormValues,
} from "@/lib/schemas/maximaAutoridadSchema";
import {
  registrarMaximaAutoridad,
  obtenerMaximaAutoridad,
  actualizarMaximaAutoridad,
} from "@/services/maximaAutoridadService";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MaximaAutoridadForm({ readOnly = false }: { readOnly?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Estados visuales para la Cédula Autoridad
  const [cedulaAuthTipo, setCedulaAuthTipo] = useState("V");
  const [cedulaAuthNumero, setCedulaAuthNumero] = useState("");

  // Estados visuales para la Cédula Delegado
  const [cedulaDelTipo, setCedulaDelTipo] = useState("V");
  const [cedulaDelNumero, setCedulaDelNumero] = useState("");

  const form = useForm<MaximaAutoridadFormValues>({
    resolver: zodResolver(maximaAutoridadSchema),
    defaultValues: {
      nombreCompletoAutoridad: "",
      cedulaAutoridad: "",
      cargoOficialAutoridad: "",
      datosDesignacionAutoridad: "",
      leyesAtribucionesSuscribirAutoridad: "",
      esDelegado: false,
      vigente: true,
      nombreCompletoDelegado: "",
      cedulaDelegado: "",
      cargoOficialDelegado: "",
      datosDesignacionDelegado: "",
      leyesAtribucionesSuscribirDelegado: "",
    },
    mode: "onChange",
  });

  const esDelegadoWatch = form.watch("esDelegado");

  // Sincronizar cédula autoridad
  useEffect(() => {
    if (cedulaAuthNumero) {
      form.setValue("cedulaAutoridad", `${cedulaAuthTipo}-${cedulaAuthNumero}`, {
        shouldValidate: true,
      });
    } else {
      form.setValue("cedulaAutoridad", "");
    }
  }, [cedulaAuthTipo, cedulaAuthNumero, form]);

  // Sincronizar cédula delegado
  useEffect(() => {
    if (cedulaDelNumero) {
      form.setValue("cedulaDelegado", `${cedulaDelTipo}-${cedulaDelNumero}`, {
        shouldValidate: true,
      });
    } else {
      form.setValue("cedulaDelegado", "");
    }
  }, [cedulaDelTipo, cedulaDelNumero, form]);

  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      obtenerMaximaAutoridad(editId)
        .then((data) => {
          if (data) {
            form.reset({
              nombreCompletoAutoridad: data.nombreCompletoAutoridad || "",
              cedulaAutoridad: data.cedulaAutoridad || "",
              cargoOficialAutoridad: data.cargoOficialAutoridad || "",
              datosDesignacionAutoridad: data.datosDesignacionAutoridad || "",
              leyesAtribucionesSuscribirAutoridad: data.leyesAtribucionesSuscribirAutoridad || "",
              esDelegado: !!data.esDelegado,
              vigente: data.vigente ?? true,
              nombreCompletoDelegado: data.nombreCompletoDelegado || "",
              cedulaDelegado: data.cedulaDelegado || "",
              cargoOficialDelegado: data.cargoOficialDelegado || "",
              datosDesignacionDelegado: data.datosDesignacionDelegado || "",
              leyesAtribucionesSuscribirDelegado: data.leyesAtribucionesSuscribirDelegado || "",
            });

            if (data.cedulaAutoridad) {
              const parts = data.cedulaAutoridad.split("-");
              if (parts.length === 2) {
                setCedulaAuthTipo(parts[0]);
                setCedulaAuthNumero(parts[1]);
              }
            }

            if (data.cedulaDelegado) {
              const parts = data.cedulaDelegado.split("-");
              if (parts.length === 2) {
                setCedulaDelTipo(parts[0]);
                setCedulaDelNumero(parts[1]);
              }
            }
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

  const handleNextStep = async () => {
    if (readOnly) {
      setStep(2);
      return;
    }

    // Validamos solo campos de paso 1
    const isValid = await form.trigger([
      "nombreCompletoAutoridad",
      "cedulaAutoridad",
      "cargoOficialAutoridad",
      "datosDesignacionAutoridad",
      "leyesAtribucionesSuscribirAutoridad",
    ]);

    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        form.clearErrors();
      }, 50);
    } else {
      toast.error("Por favor completa los campos requeridos.");
    }
  };

  const onSubmit = async (values: MaximaAutoridadFormValues) => {
    if (readOnly) return;
    setIsLoading(true);
    try {
      const payload = values.esDelegado
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

      if (editId) {
        await actualizarMaximaAutoridad(editId, payload);
        toast.success("Autoridad actualizada exitosamente.");
      } else {
        await registrarMaximaAutoridad(payload);
        toast.success("Autoridad creada exitosamente.");
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
            ? "Error al actualizar la Máxima Autoridad"
            : "Error al registrar la Máxima Autoridad";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          {step === 1
            ? editId
              ? "Editar datos de la Máxima Autoridad"
              : "Registra los datos de la Máxima Autoridad"
            : "Delegación de firma (Opcional)"}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Artículos 18.7 LOPA y 28 LOAP; 62 LCP; 5 NORMAS DE CONTROL INTERNO SUNAI.
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
              {/* --- PASO 1 --- */}
              {step === 1 && (
                <>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="nombreCompletoAutoridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre completo de la máxima autoridad del ente.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Pedro José Rodríguez Hernández
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
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
                      name="cedulaAutoridad"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique cédula de identidad de la máxima autoridad del ente.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: V-00000000
                          </p>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={cedulaAuthTipo}
                                onValueChange={setCedulaAuthTipo}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="w-[70px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-500 font-inter">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="V">V</SelectItem>
                                  <SelectItem value="E">E</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={cedulaAuthNumero}
                                onChange={(e) =>
                                  setCedulaAuthNumero(e.target.value.replace(/\D/g, ""))
                                }
                                disabled={isLoading}
                                maxLength={8}
                                className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-[150px]"
                                placeholder="00000000"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="cargoOficialAutoridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique cargo de la máxima autoridad del ente.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Presidente, Director
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
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
                      name="datosDesignacionAutoridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique datos de la Resolución, Decreto, Acta o Acuerdo de designación
                            de la máxima autoridad del ente.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Resolución N° 000/00 de fecha 00-00-0000 publicado en Gaceta N°
                            0000 de fecha 00-00-0000
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-3/4"
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
                      name="leyesAtribucionesSuscribirAutoridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique Ley(es) que le confieren las atribuciones a la máxima autoridad
                            del ente para suscribir el acto administrativo.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Artículos 00 y 00 de la Ley Orgánica de la Administración
                            Pública...
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-3/4"
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
                      name="esDelegado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base block mb-3">
                            ¿La Máxima Autoridad ha delegado funciones de firma?
                          </FormLabel>
                          <div className="flex gap-4">
                            <Button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={`h-11 w-24 rounded-md border font-inter font-medium transition-colors ${
                                field.value === true
                                  ? "bg-color-boton-2 text-white border-color-boton-2 hover:bg-color-boton-2/90"
                                  : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              SI
                            </Button>
                            <Button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={`h-11 w-24 rounded-md border font-inter font-medium transition-colors ${
                                field.value === false
                                  ? "bg-color-boton-2 text-white border-color-boton-2 hover:bg-color-boton-2/90"
                                  : "bg-white text-slate-500 border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              NO
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4 mt-8 border-t border-slate-200">
                    {esDelegadoWatch ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11"
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                          </>
                        ) : editId ? (
                          "Actualizar"
                        ) : (
                          "Agregar"
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}

              {/* --- PASO 2 --- */}
              {step === 2 && esDelegadoWatch && (
                <>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="nombreCompletoDelegado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre del Funcionario delegado para firmar
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Luisa Maria Campos González
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
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
                      name="cedulaDelegado"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique cédula de identidad del Funcionario delegado para firmar
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: V-00000000
                          </p>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={cedulaDelTipo}
                                onValueChange={setCedulaDelTipo}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="w-[70px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-color-boton-2/30 text-slate-500 font-inter">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="V">V</SelectItem>
                                  <SelectItem value="E">E</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={cedulaDelNumero}
                                onChange={(e) =>
                                  setCedulaDelNumero(e.target.value.replace(/\D/g, ""))
                                }
                                disabled={isLoading}
                                maxLength={8}
                                className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-[150px]"
                                placeholder="00000000"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="cargoOficialDelegado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique cargo del Funcionario delegado para firmar.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Vicepresidente, Gerente General
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-1/2"
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
                      name="datosDesignacionDelegado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique los datos de la Resolución, Decreto, Acta o Acuerdo de la
                            Delegación del Funcionario autorizado para firmar.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Resolución N° 000/00 de fecha 00-00-0000 publicado en Gaceta N°
                            0000 de fecha 00-00-0000
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-3/4"
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
                      name="leyesAtribucionesSuscribirDelegado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique Ley(es) que le confieren las atribuciones al Funcionario
                            autorizado para firmar.
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isLoading}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full md:w-2/3 lg:w-3/4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between pt-4 mt-8 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-slate-500 font-inter px-8 h-11"
                      disabled={isLoading}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-color-boton-2 hover:bg-color-boton-2/90 text-white font-inter px-8 h-11"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                        </>
                      ) : editId ? (
                        "Actualizar"
                      ) : (
                        "Agregar"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
