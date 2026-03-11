"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon } from "lucide-react";

import {
  nuevoProveedorSchema,
  type NuevoProveedorFormValues,
} from "@/lib/schemas/nuevoProveedorSchema";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

// Mocks de data
const ESTADOS = ["Distrito Capital", "Miranda", "Carabobo", "Lara"];
const MUNICIPIOS = ["Libertador", "Sucre", "Valencia", "Iribarren"];
const PARROQUIAS = ["Catedral", "El Recreo", "San Blas", "Concepcion"];

export function NuevoProveedorForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados visuales duales (RIF y Cedula)
  const [rifTipo, setRifTipo] = useState("J");
  const [rifNumero, setRifNumero] = useState("");
  const [cedulaTipo, setCedulaTipo] = useState("V");
  const [cedulaNumero, setCedulaNumero] = useState("");

  // Estado Local para Documentos
  const [documentos, setDocumentos] = useState<
    { id: string; name: string; size: string; time: string; type: string; observaciones: string }[]
  >([]);

  const form = useForm<NuevoProveedorFormValues>({
    resolver: zodResolver(nuevoProveedorSchema),
    defaultValues: {
      correo: "",
      nombre: "",
      rif: "",
      formaJuridica: "",
      tipoPersona: "",
      datosRegistroMercantil: "",
      estado: "",
      parroquia: "",
      representanteNombre: "",
      municipio: "",
      representanteCedula: "",
      telefono: "",
      direccionFiscal: "",
      rnc: undefined,
      solvenciaLaboral: undefined,
      licenciaMunicipal: undefined,
      actividadPrincipal: "",
      areaEspecialidad: "",
      anosExperiencia: "",
      patrimonioNeto: "",
      fechaEstadoFinanciero: "",
      nivelContratacion: "",
    },
    mode: "onChange",
  });

  // Efecto para concatenar RIF
  useEffect(() => {
    if (rifTipo && rifNumero.length >= 8) {
      form.setValue("rif", `${rifTipo}-${rifNumero}`, { shouldValidate: true });
    } else {
      form.setValue("rif", ""); // Invalida hasta que se complete
    }
  }, [rifTipo, rifNumero, form]);

  // Efecto para concatenar Cédula Representante
  useEffect(() => {
    if (cedulaTipo && cedulaNumero.length >= 6) {
      form.setValue("representanteCedula", `${cedulaTipo}-${cedulaNumero}`, {
        shouldValidate: true,
      });
    } else {
      form.setValue("representanteCedula", "");
    }
  }, [cedulaTipo, cedulaNumero, form]);

  // Validaciones de Transición
  const handleNextStep = async () => {
    // Validar manualmente si los campos requeridos del Paso 1 están listos
    const isValid = await form.trigger([
      "correo",
      "nombre",
      "rif",
      "tipoPersona",
      "estado",
      "parroquia",
      "representanteNombre",
      "municipio",
      "representanteCedula",
      "telefono",
      "direccionFiscal",
      "rnc",
      "solvenciaLaboral",
      "licenciaMunicipal",
      "actividadPrincipal",
      "areaEspecialidad",
      "anosExperiencia",
      "patrimonioNeto",
      "fechaEstadoFinanciero",
      "nivelContratacion",
    ]);

    if (isValid) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      toast.error("Por favor, complete todos los campos obligatorios antes de continuar.");
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simular tiempo de petición al backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Proveedor registrado exitosamente");
      router.push("/registro-proveedores/listado");
    } catch (_error) {
      toast.error("Error al registrar el proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones de Dropzone mockeadas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Obtener la observación si existe (acá simplificado)
    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB",
      time: "Cargado hace 1 min",
      type: file.type.includes("pdf") ? "PDF File" : "Image",
      observaciones: form.getValues().datosRegistroMercantil || "", // Aprovechando para no crear otro local state suelto
    };

    setDocumentos((prev) => [...prev, newDoc]);
    // Resetear input real
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="w-full pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Sección 1: Identificación y validación */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#84cc16] rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">
                    1. Identificación y validación
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Correo */}
                  <FormField
                    control={form.control}
                    name="correo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Correo electrónico del proveedor
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: prueba@gmail.com
                        </p>
                        <FormControl>
                          <Input
                            placeholder="correo@proveedor.com"
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Razón Social */}
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Nombre de la empresa o Razón Social
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: Industrias Carabobo C.A
                        </p>
                        <FormControl>
                          <Input
                            placeholder="Razón social"
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* RIF */}
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-slate-700">
                      Registro de Información Fiscal (RIF)
                    </FormLabel>
                    <p className="text-xs text-slate-500 italic mb-2">Ejemplo: J-00000000-0</p>
                    <div className="flex gap-2">
                      <Select value={rifTipo} onValueChange={setRifTipo}>
                        <SelectTrigger className="w-[80px] h-11 border-slate-300">
                          <SelectValue placeholder="J" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="J">J</SelectItem>
                          <SelectItem value="V">V</SelectItem>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="00000000-0"
                        maxLength={10}
                        value={rifNumero}
                        onChange={(e) => setRifNumero(e.target.value.replace(/[^\d-]/g, ""))}
                        className="flex-1 h-11 border-slate-300 focus-visible:ring-color-boton-2"
                      />
                    </div>
                    {form.formState.errors.rif && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.rif.message}
                      </p>
                    )}
                  </div>

                  {/* Forma Jurídica */}
                  <FormField
                    control={form.control}
                    name="formaJuridica"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Forma jurídica (Si aplica)
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: C.A., S.A., S.R.L.
                        </p>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Seleccionar opciones" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="C.A.">C.A.</SelectItem>
                            <SelectItem value="S.A.">S.A.</SelectItem>
                            <SelectItem value="S.R.L.">S.R.L.</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo de Persona */}
                  <FormField
                    control={form.control}
                    name="tipoPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Tipo de Persona</FormLabel>
                        <p className="text-xs text-transparent mb-2 h-4"></p>{" "}
                        {/* Margen visual para cuadrar con la otra columna si la otra tiene hint */}
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Natural">Natural</SelectItem>
                            <SelectItem value="Juridica">Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Datos Registro Mercantil */}
                  <FormField
                    control={form.control}
                    name="datosRegistroMercantil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Indique los datos del Registro Mercantil de la empresa oferente
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: Registro Mercantil Segundo del Estado Lara, bajo el N° 0, Tomo
                          00-A del Año 0000
                        </p>
                        <FormControl>
                          <Input
                            placeholder=""
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Estado */}
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Estado</FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">Ejemplo: Lara</p>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ESTADOS.map((e) => (
                              <SelectItem key={e} value={e}>
                                {e}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parroquia */}
                  <FormField
                    control={form.control}
                    name="parroquia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Parroquia</FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">Ejemplo: Concepción</p>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Selecciona parroquia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PARROQUIAS.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Representante Nombre */}
                  <FormField
                    control={form.control}
                    name="representanteNombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Nombre del Representante Legal
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: José Ramírez González Pérez
                        </p>
                        <FormControl>
                          <Input
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Municipio */}
                  <FormField
                    control={form.control}
                    name="municipio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Municipio</FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">Ejemplo: Iribarren</p>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Selecciona municipio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MUNICIPIOS.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cedula Representante */}
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-slate-700">
                      Cédula del Representante Legal
                    </FormLabel>
                    <p className="text-xs text-slate-500 italic mb-2">Ejemplo: V-00.000.000</p>
                    <div className="flex gap-2">
                      <Select value={cedulaTipo} onValueChange={setCedulaTipo}>
                        <SelectTrigger className="w-[80px] h-11 border-slate-300">
                          <SelectValue placeholder="V" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="V">V</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="00000000"
                        maxLength={9}
                        value={cedulaNumero}
                        onChange={(e) => setCedulaNumero(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 h-11 border-slate-300 focus-visible:ring-color-boton-2"
                      />
                    </div>
                    {form.formState.errors.representanteCedula && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.representanteCedula.message}
                      </p>
                    )}
                  </div>

                  {/* Telefono */}
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Teléfono de contacto
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">Ejemplo: 0412-5555555</p>
                        <FormControl>
                          <Input
                            placeholder="0000-0000000"
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dirección Fiscal (Toma todo el ancho) */}
                  <FormField
                    control={form.control}
                    name="direccionFiscal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-bold text-slate-700">
                          Dirección fiscal (como se indica en el RIF)
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: Avenida 00, entre calles 00 y 00, Centro Comercial Central, Piso
                          2, Local 3
                        </p>
                        <FormControl>
                          <Input
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-slate-200"></div>

              {/* Sección 2: Validación de requisitos */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-color-boton-2 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">2. Validación de requisitos</h2>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Preguntas de requisitos */}
                  {[
                    {
                      name: "rnc",
                      label: "¿Está registrado en el Registro Nacional de Contratista (RNC)?",
                    },
                    { name: "solvenciaLaboral", label: "¿Tiene solvencia laboral vigente?" },
                    {
                      name: "licenciaMunicipal",
                      label: "¿Tiene licencia de funcionamiento municipal vigente?",
                    },
                  ].map((req) => (
                    <FormField
                      key={req.name}
                      control={form.control}
                      // @ts-expect-error dynamic strict
                      name={req.name}
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
                          <FormLabel className="text-[15px] text-slate-700 font-semibold m-0 flex-1">
                            {req.label}
                          </FormLabel>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant={field.value === "Si" ? "default" : "outline"}
                              className={`rounded w-14 h-10 ${field.value === "Si" ? "bg-color-boton-2 hover:bg-navy" : "border-slate-300 text-slate-600"}`}
                              onClick={() => field.onChange("Si")}
                            >
                              Si
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "No" ? "default" : "outline"}
                              className={`rounded w-14 h-10 ${field.value === "No" ? "bg-white text-slate-900 border border-slate-300 shadow-inner" : "border-slate-300 text-slate-600"}`}
                              onClick={() => field.onChange("No")}
                            >
                              No
                            </Button>
                          </div>
                          <FormMessage className="absolute mt-14" />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-slate-200"></div>

              {/* Sección 3: Capacidad Técnica y Financiera */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-navy rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">
                    3. Capacidad técnica y financiera
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Actividad Comercial */}
                  <FormField
                    control={form.control}
                    name="actividadPrincipal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-bold text-slate-700">
                          Actividad comercial principal
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic mb-2">
                          Ejemplo: El objeto principal es la prestación de servicios de consultoría
                          y asesoría en el área de tecnología de información...
                        </p>
                        <FormControl>
                          <Textarea
                            className="resize-none min-h-[80px] border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Area Especialidad */}
                  <FormField
                    control={form.control}
                    name="areaEspecialidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700 block mb-2">
                          Área de especialidad
                        </FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Bienes", "Obras", "Servicio"].map((area) => (
                            <Button
                              key={area}
                              type="button"
                              variant="outline"
                              className={`rounded-full px-6 h-10 transition-colors ${field.value === area ? "bg-df-bg border-color-boton-2 text-color-boton-2 font-bold" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                              onClick={() => field.onChange(area)}
                            >
                              {area}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="hidden md:block"></div> {/* Espaciador */}
                  {/* Años de experiencia */}
                  <FormField
                    control={form.control}
                    name="anosExperiencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Años de experiencia comprobable
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Patrimonio */}
                  <FormField
                    control={form.control}
                    name="patrimonioNeto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Patrimonio neto reportado
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 10,000.00"
                            className="h-11 border-slate-300 focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Fecha ultimo Estado */}
                  <FormField
                    control={form.control}
                    name="fechaEstadoFinanciero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">
                          Fecha del último estado financiero
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              className="h-11 border-slate-300 focus-visible:ring-color-boton-2 pl-4 pr-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Nivel Contratacion */}
                  <FormField
                    control={form.control}
                    name="nivelContratacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700 block mb-2">
                          Nivel de contratación
                        </FormLabel>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Alta", "Media", "Baja"].map((nivel) => (
                            <Button
                              key={nivel}
                              type="button"
                              variant="outline"
                              className={`rounded px-6 h-10 transition-colors min-w-[80px] ${field.value === nivel ? "bg-df-bg border-color-boton-2 text-color-boton-2 font-bold" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                              onClick={() => field.onChange(nivel)}
                            >
                              {nivel}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botón Siguiente */}
                <div className="flex justify-end pt-8">
                  <Button
                    type="button"
                    className="bg-navy hover:bg-navy-hover h-12 px-8 text-white font-semibold rounded-md shadow"
                    onClick={handleNextStep}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Sección 4: Carga de documentos */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#0ea5e9] rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">4. Carga de documentos</h2>
                </div>

                <div className="max-w-[700px]">
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold text-slate-700">Tipo de documento</FormLabel>
                    <p className="text-xs text-slate-500 italic mb-2">
                      Seleccione el tipo de documento.
                    </p>
                    <Select defaultValue="rif">
                      <FormControl>
                        <SelectTrigger className="h-11 border-slate-300 focus-visible:ring-color-boton-2">
                          <SelectValue placeholder="Selecciona el tipo de documento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rif">Copia del RIF actualizado</SelectItem>
                        <SelectItem value="cedula">Cédula del Representante</SelectItem>
                        <SelectItem value="rnc">Certificado del RNC</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>

                  {/* Dropzone Simulada */}
                  <div
                    className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl bg-slate-100 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200/50 transition-colors mb-6 group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <span className="text-slate-800 font-bold text-lg mb-1">
                      Adjunta el archivo aquí
                    </span>
                    <span className="text-slate-500 text-sm">
                      Arrastra y suelta o haz click para buscar
                    </span>

                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                  </div>

                  {/* Observaciones extra */}
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold text-slate-700">Observaciones</FormLabel>
                    <p className="text-xs text-slate-500 italic mb-2">
                      Ingrese comentarios adicionales sobre este documento
                    </p>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese comentarios adicionales sobre este documento..."
                        className="resize-none min-h-[120px] border-slate-300 focus-visible:ring-color-boton-2"
                      />
                    </FormControl>
                  </FormItem>

                  {/* Lista de Documentos Cargados */}
                  {documentos.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <FormLabel className="font-bold text-slate-700 block">
                          Documentos cargados
                        </FormLabel>
                        <p className="text-xs text-slate-500 italic">Detalles de los archivos</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {documentos.map((doc) => (
                          <Card key={doc.id} className="border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-5 h-5 text-slate-600" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800">
                                    {doc.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {doc.type} • {doc.size} • {doc.time}
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles de avance final */}
                <div className="flex justify-between pt-8 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-8 font-semibold rounded-md border-slate-300 text-slate-600 shadow-sm"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-navy hover:bg-navy-hover h-12 px-8 text-white font-semibold rounded-md shadow"
                  >
                    {isSubmitting && <Upload className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
