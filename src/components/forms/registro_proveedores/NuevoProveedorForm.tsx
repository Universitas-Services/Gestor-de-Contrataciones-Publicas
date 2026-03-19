"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  MinusIcon,
  ImageIcon,
  Trash2,
  Loader2,
} from "lucide-react";
import { BsCloudUploadFill } from "react-icons/bs";
import {
  registrarProveedor,
  getProveedorById,
  editarProveedor,
} from "@/services/proveedores.service";
import { cn } from "@/lib/utils";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mocks de data
const ESTADOS = ["Distrito Capital", "Miranda", "Carabobo", "Lara"];
const MUNICIPIOS = ["Libertador", "Sucre", "Valencia", "Iribarren"];
const PARROQUIAS = ["Catedral", "El Recreo", "San Blas", "Concepcion"];

// Tipos de documento para la carga de documentos del proveedor
const TIPOS_DOCUMENTO = [
  { value: "doc_registro_mercantil", label: "Acta constitutiva" },
  { value: "doc_rif", label: "RIF" },
  { value: "doc_referencias_bancarias", label: "Fotocopia de la cédula del representante legal" },
  { value: "doc_rnc", label: "Certificado RNC" },
  { value: "doc_estados_financieros", label: "Resumen informativo RNC" },
  { value: "doc_solvencia_laboral", label: "Solvencia Laboral" },
  { value: "doc_licencia_municipal", label: "Licencia de funcionamiento Municipal" },
  { value: "doc_otro", label: "Otro" },
] as const;

interface NuevoProveedorFormProps {
  providerId?: string;
}

export function NuevoProveedorForm({ providerId }: NuevoProveedorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(!!providerId);

  // Estados visuales duales (RIF y Cedula)
  const [rifTipo, setRifTipo] = useState("J");
  const [rifCuerpo, setRifCuerpo] = useState(""); // 8 dígitos
  const [rifVerificador, setRifVerificador] = useState(""); // 1 dígito
  const rifVerificadorRef = useRef<HTMLInputElement>(null);
  const [cedulaTipo, setCedulaTipo] = useState("V");
  const [cedulaNumero, setCedulaNumero] = useState("");

  // Estado para Teléfono
  const [phonePrefix, setPhonePrefix] = useState("0414");
  const [phoneBody, setPhoneBody] = useState("");

  // Estado Local para Documentos
  const [tipoDocActual, setTipoDocActual] = useState("doc_rif");
  const [obsActual, setObsActual] = useState("");

  const [documentos, setDocumentos] = useState<
    {
      id: string;
      tipoDoc: string;
      file: File;
      name: string;
      size: string;
      time: string;
      type: string;
      observaciones: string;
    }[]
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
      actividadPrincipal: "No" as any,
      areaEspecialidad: "",
      anosExperiencia: "",
      patrimonioNeto: "",
      fechaEstadoFinanciero: "",
      nivelContratacion: "",
    },
    mode: "onChange",
  });

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (!providerId) return;

    const cargarDatos = async () => {
      try {
        const response = await getProveedorById(providerId);
        const data = response.data || response;

        const normalizeFormaJuridica = (val: string) => {
          if (!val) return "";
          const v = val.toUpperCase();
          if (v === "COOPERATIVA" || v === "COOPERATIVAS") return "Cooperativas";
          if (v === "PYME" || v === "PYMES") return "Pymes";
          if (v === "COMPANIA_ANONIMA" || v === "C.A." || v === "C.A" || v.includes("ANONIMA"))
            return "Compañía Anónima";
          if (v === "ASOCIACION_CIVIL") return "Asociación Civil";
          if (v === "SRL" || v.includes("LIMITADA"))
            return "Sociedades de Responsabilidad Limitada (S.R.L.)";
          if (v === "FUNDACION" || v === "FUNDACIONES") return "Fundaciones";
          return val;
        };

        // Mapear datos al formulario
        form.reset({
          correo: data.correo || "",
          nombre: data.nombre || "",
          rif: data.rif || "",
          formaJuridica: normalizeFormaJuridica(data.tipoEntidadJuridica),
          tipoPersona: data.tipoPersona || "",
          datosRegistroMercantil: data.datosRegistroMercantil || "",
          estado: data.estado || "",
          municipio: data.municipio || "",
          parroquia: data.parroquia || "",
          direccionFiscal: data.direccionFiscal || "",
          telefono: data.telefono || "",
          representanteNombre: data.nombreRepLegal || "",
          representanteCedula: data.cedulaRepLegal || "",
          rnc: data.registroRnc ? "Si" : "No",
          solvenciaLaboral: data.solvenciaLaboral ? "Si" : "No",
          licenciaMunicipal: data.licenciaFuncionamientoMunicipal ? "Si" : "No",
          actividadPrincipal: data.actividadComercial === "Si" ? "Si" : "No",
          areaEspecialidad:
            data.areaEspecialidad === "SERVICIO" || data.areaEspecialidad === "SERVICIOS"
              ? "SERVICIOS"
              : data.areaEspecialidad || "",
          anosExperiencia: data.anosExperiencia?.toString() || "",
          patrimonioNeto: data.patrimonioReportado?.toString() || "",
          fechaEstadoFinanciero: data.fechaEstadoFinanciero || "",
          nivelContratacion: data.nivelContratacion || "",
        });

        // Fragmentar RIF
        if (data.rif) {
          const rifParts = data.rif.split("-");
          if (rifParts.length === 3) {
            setRifTipo(rifParts[0]);
            setRifCuerpo(rifParts[1]);
            setRifVerificador(rifParts[2]);
          }
        }

        // Fragmentar Cédula
        if (data.cedulaRepLegal) {
          const cidParts = data.cedulaRepLegal.split("-");
          if (cidParts.length === 2) {
            setCedulaTipo(cidParts[0]);
            setCedulaNumero(cidParts[1]);
          }
        }

        // Fragmentar Teléfono
        if (data.telefono) {
          setPhonePrefix(data.telefono.slice(0, 4));
          setPhoneBody(data.telefono.slice(4));
        }

        // Manejar documentos existentes (opcional: mostrar historial)
        // Por ahora nos enfocamos en permitir cargar nuevos
      } catch (error) {
        toast.error("Error al cargar los datos del proveedor");
        console.error(error);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    cargarDatos();
  }, [providerId, form]);

  // Efecto para concatenar RIF
  useEffect(() => {
    if (isLoadingInitialData) return;
    if (rifTipo && rifCuerpo.length === 8 && rifVerificador.length === 1) {
      form.setValue("rif", `${rifTipo}-${rifCuerpo}-${rifVerificador}`, {
        shouldValidate: true,
      });
    } else if (rifCuerpo.length > 0 || rifVerificador.length > 0) {
      // Solo limpiar si el usuario realmente está interactuando
      form.setValue("rif", "");
    }
  }, [rifTipo, rifCuerpo, rifVerificador, form, isLoadingInitialData]);

  // Efecto para concatenar Cédula Representante
  useEffect(() => {
    if (isLoadingInitialData) return;
    if (cedulaTipo && cedulaNumero.length >= 6) {
      form.setValue("representanteCedula", `${cedulaTipo}-${cedulaNumero}`, {
        shouldValidate: true,
      });
    } else if (cedulaNumero.length > 0) {
      form.setValue("representanteCedula", "");
    }
  }, [cedulaTipo, cedulaNumero, form, isLoadingInitialData]);

  // Efecto para concatenar Teléfono
  useEffect(() => {
    if (isLoadingInitialData) return;
    if (phonePrefix && phoneBody.length === 7) {
      form.setValue("telefono", `${phonePrefix}${phoneBody}`, {
        shouldValidate: true,
      });
    } else if (phoneBody.length > 0) {
      form.setValue("telefono", "");
    }
  }, [phonePrefix, phoneBody, form, isLoadingInitialData]);

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
      const data = form.getValues();
      const formData = new FormData();

      formData.append("correo", data.correo);
      formData.append("nombre", data.nombre);
      formData.append("rif", data.rif);
      formData.append("tipoPersona", data.tipoPersona);
      if (data.formaJuridica) formData.append("tipoEntidadJuridica", data.formaJuridica);
      if (data.datosRegistroMercantil)
        formData.append("datosRegistroMercantil", data.datosRegistroMercantil);
      formData.append("estado", data.estado);
      formData.append("municipio", data.municipio);
      formData.append("parroquia", data.parroquia);
      formData.append("direccionFiscal", data.direccionFiscal);
      formData.append("telefono", data.telefono);
      formData.append("nombreRepLegal", data.representanteNombre);
      formData.append("cedulaRepLegal", data.representanteCedula);

      formData.append("registroRnc", data.rnc === "Si" ? "true" : "false");
      formData.append("solvenciaLaboral", data.solvenciaLaboral === "Si" ? "true" : "false");
      formData.append(
        "licenciaFuncionamientoMunicipal",
        data.licenciaMunicipal === "Si" ? "true" : "false"
      );

      formData.append("actividadComercial", data.actividadPrincipal);
      formData.append("areaEspecialidad", data.areaEspecialidad);
      formData.append("anosExperiencia", data.anosExperiencia.toString());
      if (data.fechaEstadoFinanciero)
        formData.append("fechaEstadoFinanciero", data.fechaEstadoFinanciero);
      formData.append("patrimonioReportado", data.patrimonioNeto);
      formData.append("nivelContratacion", data.nivelContratacion);

      // Adjuntar archivos y observaciones
      documentos.forEach((doc) => {
        formData.append(doc.tipoDoc, doc.file);
        if (doc.observaciones) {
          formData.append(`obs_${doc.tipoDoc}`, doc.observaciones);
        }
      });

      if (providerId) {
        await editarProveedor(providerId, formData);
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await registrarProveedor(formData);
        toast.success("Proveedor registrado exitosamente");
      }

      router.push("/registro-proveedores/listado");
    } catch (error: unknown) {
      console.error("Error en registrar/editar Proveedor:", error);
      const msg = error instanceof Error ? error.message : "Error al procesar el proveedor";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones de Dropzone
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      tipoDoc: tipoDocActual,
      file: file,
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB",
      time: "Cargado justo ahora",
      type: file.type.includes("pdf") ? "PDF File" : "Image",
      observaciones: obsActual,
    };

    // Agregar reemplazando si ya existe un documento de ese tipo
    setDocumentos((prev) => [...prev.filter((d) => d.tipoDoc !== tipoDocActual), newDoc]);
    setObsActual(""); // Limpiar observaciones

    // Resetear input real
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  };

  if (isLoadingInitialData) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-navy" />
        <p className="text-muted-foreground font-medium animate-pulse">
          Cargando datos del proveedor...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      {/* Dynamic Header */}
      <div className="mb-10">
        <h1 className="text-[28px] font-extrabold text-color-titulos tracking-tight">
          {providerId
            ? "Editar proveedor"
            : step === 1
              ? "Identificación y validación"
              : "Carga de documentos"}
        </h1>
        <p className="text-muted-foreground italic mt-1 text-sm">
          {providerId
            ? "Actualice la información del proveedor y sus documentos legales"
            : step === 1
              ? "Complete los datos iniciales para el registro formal del proveedor en el sistema centralizado"
              : "Por favor cargar los documentos legales del proveedor que valide los datos suministrados."}
        </p>
        <hr className="mt-8 border-border" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Sección 1: Identificación y validación */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#84cc16] rounded-full"></div>
                  <h2 className="text-xl font-bold text-color-titulos">
                    1. Identificación y validación
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 max-w-[800px]">
                  {/* Correo */}
                  <FormField
                    control={form.control}
                    name="correo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos">
                          Correo electrónico del proveedor
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: prueba@gmail.com
                        </p>
                        <FormControl>
                          <Input
                            placeholder="correo@proveedor.com"
                            className="h-11 border-border focus-visible:ring-color-boton-2"
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
                        <FormLabel className="font-bold text-color-subtitulos">
                          Nombre de la empresa o Razón Social
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: Industrias Carabobo C.A
                        </p>
                        <FormControl>
                          <Input
                            placeholder="Razón social"
                            className="h-11 border-border focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* RIF */}
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-subtitulos">
                      Registro de Información Fiscal (RIF)
                    </FormLabel>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Ejemplo: J-12345678-9
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={rifTipo} onValueChange={setRifTipo}>
                        <SelectTrigger className="w-[80px] h-11 border border-border bg-white">
                          <SelectValue placeholder="J" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G">G</SelectItem>
                          <SelectItem value="J">J</SelectItem>
                        </SelectContent>
                      </Select>

                      <InputOTP
                        maxLength={8}
                        value={rifCuerpo}
                        onChange={(val) => {
                          setRifCuerpo(val);
                          if (val.length === 8) {
                            rifVerificadorRef.current?.focus();
                          }
                        }}
                        disabled={isSubmitting}
                        pattern={REGEXP_ONLY_DIGITS}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={1} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={2} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={3} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={4} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={5} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={6} className="border-r-0 shadow-none" />
                          <InputOTPSlot index={7} className="rounded-r-md border-r shadow-none" />
                        </InputOTPGroup>
                      </InputOTP>

                      <div className="text-slate-400 font-bold px-1 flex items-center">
                        <MinusIcon className="h-4 w-4" />
                      </div>

                      <InputOTP
                        ref={rifVerificadorRef}
                        maxLength={1}
                        value={rifVerificador}
                        onChange={(val) => setRifVerificador(val)}
                        disabled={isSubmitting}
                        pattern={REGEXP_ONLY_DIGITS}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="rounded-md border-l shadow-none" />
                        </InputOTPGroup>
                      </InputOTP>
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
                        <FormLabel className="font-bold text-color-subtitulos">
                          Forma jurídica (Si aplica)
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: C.A., S.A., S.R.L.
                        </p>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Seleccionar opciones" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Compañía Anónima">Compañía Anónima (C.A)</SelectItem>
                            <SelectItem value="Asociación Civil">Asociación Civil</SelectItem>
                            <SelectItem value="Sociedades de Responsabilidad Limitada (S.R.L.)">
                              Sociedades de Responsabilidad Limitada (S.R.L.)
                            </SelectItem>
                            <SelectItem value="Fundaciones">Fundaciones</SelectItem>
                            <SelectItem value="Cooperativas">Cooperativas</SelectItem>
                            <SelectItem value="Pymes">Pymes</SelectItem>
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
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel className="font-bold text-color-subtitulos mb-2">
                          Tipo de Persona
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border focus-visible:ring-color-boton-2">
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NATURAL">NATURAL</SelectItem>
                            <SelectItem value="JURIDICA">JURIDICA</SelectItem>
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
                        <FormLabel className="font-bold text-color-subtitulos">
                          Indique los datos del Registro Mercantil de la empresa oferente
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: Registro Mercantil Segundo del Estado Lara, bajo el N° 0, Tomo
                          00-A del Año 0000
                        </p>
                        <FormControl>
                          <Input
                            placeholder=""
                            className="h-11 border-border focus-visible:ring-color-boton-2"
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
                        <FormLabel className="font-bold text-color-subtitulos">Estado</FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">Ejemplo: Lara</p>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border focus-visible:ring-color-boton-2">
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
                        <FormLabel className="font-bold text-color-subtitulos">Parroquia</FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: Concepción
                        </p>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border focus-visible:ring-color-boton-2">
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
                        <FormLabel className="font-bold text-color-subtitulos">
                          Nombre del Representante Legal
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: José Ramírez González Pérez
                        </p>
                        <FormControl>
                          <Input
                            className="h-11 border-border focus-visible:ring-color-boton-2"
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
                        <FormLabel className="font-bold text-color-subtitulos">Municipio</FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: Iribarren
                        </p>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border focus-visible:ring-color-boton-2">
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
                    <FormLabel className="font-bold text-color-subtitulos">
                      Cédula del Representante Legal
                    </FormLabel>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Ejemplo: V-00.000.000
                    </p>
                    <div className="flex items-center gap-2">
                      <Select value={cedulaTipo} onValueChange={setCedulaTipo}>
                        <SelectTrigger className="w-[100px] h-11 border-border bg-white shadow-sm">
                          <SelectValue placeholder="V" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="V">V</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="00000000"
                        maxLength={8}
                        value={cedulaNumero}
                        onChange={(e) => setCedulaNumero(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 max-w-[200px] h-11 border border-slate-300 focus-visible:ring-1 focus-visible:ring-color-boton-2 bg-white"
                      />
                    </div>
                    {form.formState.errors.representanteCedula && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.representanteCedula.message}
                      </p>
                    )}
                  </div>

                  {/* Telefono */}
                  <div className="space-y-2">
                    <FormLabel className="font-bold text-color-subtitulos">
                      Teléfono de contacto
                    </FormLabel>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Ejemplo: 0412-5555555
                    </p>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-11 w-[90px] border border-slate-300 font-inter text-slate-500 justify-between bg-white"
                          >
                            {phonePrefix}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[90px]">
                          {["0414", "0424", "0412", "0422", "0416", "0426"].map((p) => (
                            <DropdownMenuItem key={p} onClick={() => setPhonePrefix(p)}>
                              {p}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Input
                        type="text"
                        maxLength={7}
                        value={phoneBody}
                        onChange={(e) => setPhoneBody(e.target.value.replace(/\D/g, ""))}
                        placeholder="7894561"
                        className="h-11 border border-slate-300 flex-1 focus-visible:ring-1 focus-visible:ring-color-boton-2"
                      />
                    </div>
                    {form.formState.errors.telefono && (
                      <p className="text-sm font-medium text-destructive">
                        {form.formState.errors.telefono.message}
                      </p>
                    )}
                  </div>

                  {/* Dirección Fiscal (Más pequeña) */}
                  <FormField
                    control={form.control}
                    name="direccionFiscal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos">
                          Dirección fiscal (como se indica en el RIF)
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: Avenida 00, entre calles 00 y 00, Centro Comercial Central, Piso
                          2, Local 3
                        </p>
                        <FormControl>
                          <Input
                            className="h-11 border-border focus-visible:ring-color-boton-2"
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
              <div className="border-t border-border"></div>

              {/* Sección 2: Validación de requisitos */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-color-boton-2 rounded-full"></div>
                  <h2 className="text-xl font-bold text-color-titulos">
                    2. Validación de requisitos
                  </h2>
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
                        <FormItem className="flex items-center justify-between p-4 bg-white border border-border shadow-sm rounded-lg">
                          <FormLabel className="text-[15px] text-color-subtitulos font-semibold m-0 flex-1">
                            {req.label}
                          </FormLabel>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className={`rounded w-14 h-10 transition-colors ${
                                field.value === "Si"
                                  ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                  : "border-border text-muted-foreground font-medium bg-white hover:bg-muted hover:text-muted-foreground"
                              }`}
                              onClick={() => field.onChange("Si")}
                            >
                              Si
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={`rounded w-14 h-10 transition-colors ${
                                field.value === "No"
                                  ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                  : "border-border text-muted-foreground font-medium bg-white hover:bg-muted hover:text-muted-foreground"
                              }`}
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
              <div className="border-t border-border"></div>

              {/* Sección 3: Capacidad Técnica y Financiera */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-navy rounded-full"></div>
                  <h2 className="text-xl font-bold text-color-titulos">
                    3. Capacidad técnica y financiera
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-[800px]">
                  {/* Row 1: Actividad Comercial (Now at the top) */}
                  <FormField
                    control={form.control}
                    name="actividadPrincipal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-bold text-color-subtitulos">
                          Actividad comercial principal
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: El objeto principal es la prestación de servicios de consultoría
                          y asesoría en el área de tecnología de la información, lo que incluye el
                          desarrollo de software, diseño de páginas web, y manejo de redes sociales.
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            className={`rounded w-14 h-10 transition-colors ${
                              field.value === "Si"
                                ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                : "border-border text-muted-foreground font-medium bg-white hover:bg-muted"
                            }`}
                            onClick={() => field.onChange("Si")}
                          >
                            Si
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className={`rounded w-14 h-10 transition-colors ${
                              field.value === "No"
                                ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                : "border-border text-muted-foreground font-medium bg-white hover:bg-muted"
                            }`}
                            onClick={() => field.onChange("No")}
                          >
                            No
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 2: Area Especialidad (Left) */}
                  <FormField
                    control={form.control}
                    name="areaEspecialidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos block mb-2">
                          Área de especialidad
                        </FormLabel>
                        <div className="flex flex-row items-center gap-2 mt-2">
                          {["BIENES", "OBRAS", "SERVICIOS"].map((area) => (
                            <Button
                              key={area}
                              type="button"
                              variant="outline"
                              className={`rounded px-3 h-9 text-[10px] transition-colors ${
                                field.value === area
                                  ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                  : "border-border text-muted-foreground font-medium bg-white hover:bg-muted"
                              }`}
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
                  <div className="hidden md:block"></div>

                  {/* Row 3: Años de experiencia (Left) | Patrimonio (Right) */}
                  <FormField
                    control={form.control}
                    name="anosExperiencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos">
                          Años de experiencia comprobable
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="h-11 border-border focus-visible:ring-color-boton-2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patrimonioNeto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos">
                          Patrimonio neto reportado
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 10000"
                            type="text"
                            className="h-11 border-border focus-visible:ring-color-boton-2"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Row 4: Fecha (Left) | Nivel (Right) */}
                  <FormField
                    control={form.control}
                    name="fechaEstadoFinanciero"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="font-bold text-color-subtitulos mb-2">
                          Fecha del último estado financiero
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full h-11 pl-3 text-left font-normal border-border bg-white",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              fromYear={1900}
                              toYear={new Date().getFullYear()}
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date?.toISOString())}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nivelContratacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-color-subtitulos block mb-2">
                          Nivel de contratación
                        </FormLabel>
                        <div className="flex flex-row items-center gap-2 mt-2">
                          {["ALTA", "MEDIA", "BAJA"].map((nivel) => (
                            <Button
                              key={nivel}
                              type="button"
                              variant="outline"
                              className={`rounded px-3 h-9 text-[10px] transition-colors ${
                                field.value === nivel
                                  ? "border-ring text-color-titulos font-bold bg-muted shadow-sm"
                                  : "border-border text-muted-foreground font-medium bg-white hover:bg-muted"
                              }`}
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
                  <div className="w-1 h-6 bg-section-docs rounded-full"></div>
                  <h2 className="text-xl font-bold text-color-titulos">4. Carga de documentos</h2>
                </div>

                <div className="max-w-[700px]">
                  <FormItem className="mb-6">
                    <FormLabel className="font-bold text-color-subtitulos">
                      Tipo de documento
                    </FormLabel>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Seleccione el tipo de documento.
                    </p>
                    <Select value={tipoDocActual} onValueChange={setTipoDocActual}>
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "h-11 border-border focus-visible:ring-color-boton-2 transition-all",
                            documentos.some((d) => d.tipoDoc === tipoDocActual) &&
                              "border-success bg-success-bg/50"
                          )}
                        >
                          <SelectValue placeholder="Selecciona el tipo de documento" />
                          {documentos.some((d) => d.tipoDoc === tipoDocActual) && (
                            <CheckCircle2 className="h-4 w-4 text-success-text ml-2" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_DOCUMENTO.map((tipo) => {
                          const isUploaded = documentos.some((d) => d.tipoDoc === tipo.value);
                          return (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              <div className="flex items-center justify-between w-full min-w-[300px]">
                                <span>{tipo.label}</span>
                                {isUploaded && (
                                  <div className="flex items-center gap-1.5 text-success-text font-bold text-[10px] bg-success-bg px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>CARGADO</span>
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormItem>

                  {/* Dropzone Simulada */}
                  <div
                    className="w-full h-64 border-2 border-dashed border-dropzone-border rounded-xl bg-dropzone-bg flex flex-col items-center justify-center cursor-pointer hover:bg-dropzone-border/20 transition-colors mb-6 group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-dropzone-border rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <BsCloudUploadFill className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-color-titulos font-bold text-lg mb-1">
                      Adjunta el archivo aquí
                    </span>
                    <span className="text-muted-foreground text-sm">
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
                    <FormLabel className="font-bold text-color-subtitulos">Observaciones</FormLabel>
                    <p className="text-xs text-muted-foreground italic mb-2">
                      Ingrese comentarios adicionales sobre este documento
                    </p>
                    <FormControl>
                      <Textarea
                        value={obsActual}
                        onChange={(e) => setObsActual(e.target.value)}
                        placeholder="Ingrese comentarios adicionales sobre este documento..."
                        className="resize-none min-h-[120px] border-border focus-visible:ring-color-boton-2"
                      />
                    </FormControl>
                  </FormItem>

                  {/* Lista de Documentos Cargados */}
                  {documentos.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <FormLabel className="font-bold text-color-subtitulos block">
                          Documentos cargados
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic">
                          Detalles de los archivos
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {documentos.map((doc) => (
                          <Card key={doc.id} className="border border-border shadow-sm">
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-color-titulos">
                                    {doc.name}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground font-medium">
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
                <div className="flex justify-between pt-8 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-8 font-semibold rounded-md border-border text-muted-foreground shadow-sm"
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
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {providerId ? "Guardar cambios" : "Registrar"}
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
