"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Loader2, MinusIcon } from "lucide-react";
import {
  completarEnteSchema,
  type CompletarEnteFormValues,
} from "@/lib/schemas/completarEnteSchema";
import { obtenerEnte, actualizarEnte, actualizarLogoEnte } from "@/services/enteService";
import { generarManual } from "@/services/manualService";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

// --- Datos manuales para los Selects ---

const ESTADOS = ["Distrito Capital", "Miranda", "Lara"];
const MUNICIPIOS = ["Libertador", "Sucre", "Iribarren"];
const CIUDADES = ["Caracas", "Los Teques", "Barquisimeto"];
const PARROQUIAS = ["Catedral", "El Recreo", "Concepcion"];

// --- Props ---

interface CompletarEnteFormProps {
  enteId: string;
}

// --- Formatos y tamaño del logo ---

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// --- Componente ---

export function CompletarEnteForm({ enteId }: CompletarEnteFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [step, setStep] = useState(1);

  // Estados visuales para el RIF
  const [rifTipo, setRifTipo] = useState("G");
  const [rifCuerpo, setRifCuerpo] = useState(""); // 8 dígitos del cuerpo
  const [rifVerificador, setRifVerificador] = useState(""); // 1 dígito verificador
  const verificadorInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CompletarEnteFormValues>({
    resolver: zodResolver(completarEnteSchema),
    defaultValues: {
      nombre: "",
      rif: "",
      siglas: "",
      direccionFiscal: "",
      estado: "",
      municipio: "",
      ciudad: "",
      parroquia: "",
      nombreUnidadAdminFinanciera: "",
      nombreUnidadTecnologia: "",
      nombreUnidadContratante: "",
      organoAdscripcion: "",
    },
  });

  // Sincronizar estados locales de RIF con react-hook-form
  useEffect(() => {
    if (rifTipo && rifCuerpo.length === 8 && rifVerificador.length === 1) {
      const formattedRif = `${rifTipo}-${rifCuerpo}-${rifVerificador}`;
      form.setValue("rif", formattedRif, { shouldValidate: true });
    } else {
      form.setValue("rif", "");
    }
  }, [rifTipo, rifCuerpo, rifVerificador, form]);

  // Cargar datos del ente al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ente = await obtenerEnte(enteId);
        form.reset({
          nombre: ente.nombre || "",
          rif: ente.rif || "",
          siglas: ente.siglas || "",
          direccionFiscal: ente.direccionFiscal || "",
          estado: ente.estado || "",
          municipio: ente.municipio || "",
          ciudad: ente.ciudad || "",
          parroquia: ente.parroquia || "",
          nombreUnidadAdminFinanciera: ente.nombreUnidadAdminFinanciera || "",
          nombreUnidadTecnologia: ente.nombreUnidadTecnologia || "",
          nombreUnidadContratante: ente.nombreUnidadContratante || "",
          organoAdscripcion: ente.organoAdscripcion || "",
        });

        // Cargar RIF dividido si existe
        if (ente.rif) {
          const parts = ente.rif.split("-");
          if (parts.length === 3) {
            setRifTipo(parts[0]);
            setRifCuerpo(parts[1]);
            setRifVerificador(parts[2]);
          } else if (parts.length === 2) {
            setRifTipo(parts[0]);
            // Si viene G-XXXXXXXXX (sin el segundo guión)
            const numericPart = parts[1].replace(/-/g, "").slice(0, 9);
            setRifCuerpo(numericPart.slice(0, 8));
            setRifVerificador(numericPart.slice(8));
          } else {
            // fallback
            const numericPart = ente.rif.replace(/[^\d]/g, "").slice(0, 9);
            setRifCuerpo(numericPart.slice(0, 8));
            setRifVerificador(numericPart.slice(8));
            if (/^[GJ]/.test(ente.rif)) {
              setRifTipo(ente.rif[0]);
            }
          }
        }

        // Si ya tiene logo, mostrar la URL
        if (ente.logoUrl) {
          setLogoPreview(ente.logoUrl);
          setLogoUploaded(true);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al cargar datos del ente";
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    cargarDatos();
  }, [enteId, form]);

  // Manejar selección de archivo del logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Formato no válido. Usa PNG o JPG");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo supera el tamaño máximo de 1MB");
      return;
    }

    setLogoFile(file);
    setLogoUploaded(false);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remover logo seleccionado
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Subir logo al backend
  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error("Selecciona una imagen primero");
      return;
    }

    setIsUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("file", logoFile);

      await actualizarLogoEnte(enteId, formData);
      toast.success("Logo actualizado correctamente");
      setLogoUploaded(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al subir el logo";
      toast.error(message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleNextStep = async () => {
    // Validamos solo campos de paso 1
    const isValid = await form.trigger(["nombre", "rif", "siglas", "organoAdscripcion"]);

    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Limpiamos los errores del paso 2 una vez que los campos ya estén renderizados en el DOM
      setTimeout(() => {
        form.clearErrors();
      }, 50);
    } else {
      console.log("Validacion fallida paso 1:", form.formState.errors);
      toast.error("Por favor completa los campos requeridos marcados en rojo.");
    }
  };

  // Guardar datos del ente
  const onSubmit = async (values: CompletarEnteFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Guardando datos del ente...");

    try {
      const payload = {
        nombre: values.nombre,
        rif: values.rif,
        siglas: values.siglas,
        direccionFiscal: values.direccionFiscal || "",
        estado: values.estado || "",
        municipio: values.municipio || "",
        ciudad: values.ciudad || "",
        parroquia: values.parroquia || "",
        nombreUnidadAdminFinanciera: values.nombreUnidadAdminFinanciera || "",
        nombreUnidadTecnologia: values.nombreUnidadTecnologia || "",
        nombreUnidadContratante: values.nombreUnidadContratante || "",
        organoAdscripcion: values.organoAdscripcion || "",
      };

      await actualizarEnte(enteId, payload);

      toast.loading("Generando manual del ente...", { id: toastId });
      await generarManual();

      toast.success("Datos guardados y manual generado correctamente", { id: toastId });
      router.push("/admin_ente/dashboard");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al guardar los datos del ente";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state inicial
  if (isLoadingData) {
    return (
      <div className="mx-auto w-full max-w-6xl bg-white shadow-sm pb-16">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando datos del ente...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-6xl shadow-sm border-0 mb-16">
      <CardHeader className="px-10 pt-12 pb-6 border-b border-slate-200">
        <CardTitle className="text-[28px] font-bold text-[slate-700] font-inter">
          {step === 1 ? "Datos generales" : "Ubicación y estructura"}
        </CardTitle>
        <CardDescription className="text-slate-500 italic mt-1 font-inter text-base">
          Ingresa los datos básicos para comenzar el registro
        </CardDescription>
      </CardHeader>

      <CardContent className="px-10 pt-8 pb-10">
        <Form {...form}>
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            className="space-y-6"
          >
            {/* Contenedor principal de los campos */}
            <div className="space-y-0">
              {step === 1 && (
                <>
                  {/* Nombre del Ente (full width) */}
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre del Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Instituto Nacional de Tránsito Terrestre
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-1/2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* RIF + Siglas (separados verticalmente como pide la imagen) */}
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="siglas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el acrónimo y/o siglas del Órgano o Ente Contratante
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: INTT
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
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
                      name="rif"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el RIF del Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: G-00000000-0
                          </p>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={rifTipo}
                                onValueChange={setRifTipo}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="w-[70px] h-11 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B456F]/30 text-slate-500 font-inter">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="G" className="font-inter">
                                    G
                                  </SelectItem>
                                  <SelectItem value="J" className="font-inter">
                                    J
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <InputOTP
                                maxLength={8}
                                value={rifCuerpo}
                                onChange={(val) => {
                                  setRifCuerpo(val);
                                  if (val.length === 8) {
                                    verificadorInputRef.current?.focus();
                                  }
                                }}
                                disabled={isSubmitting}
                                pattern={REGEXP_ONLY_DIGITS}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} className="border-r-0" />
                                  <InputOTPSlot index={1} className="border-r-0" />
                                  <InputOTPSlot index={2} className="border-r-0" />
                                  <InputOTPSlot index={3} className="border-r-0" />
                                  <InputOTPSlot index={4} className="border-r-0" />
                                  <InputOTPSlot index={5} className="border-r-0" />
                                  <InputOTPSlot index={6} className="border-r-0" />
                                  <InputOTPSlot index={7} className="rounded-r-md border-r" />
                                </InputOTPGroup>
                              </InputOTP>

                              <div className="text-slate-400 font-bold px-1">
                                <MinusIcon className="h-4 w-4" />
                              </div>

                              <InputOTP
                                ref={verificadorInputRef}
                                maxLength={1}
                                value={rifVerificador}
                                onChange={(val) => setRifVerificador(val)}
                                disabled={isSubmitting}
                                pattern={REGEXP_ONLY_DIGITS}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} className="rounded-md border-l" />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Logo / Imagen */}
                  <div className="mb-8 space-y-6">
                    <h3 className="text-[slate-700] font-bold font-inter text-base leading-none block">
                      Inserte el logo del Órgano o Ente Contratante.
                    </h3>
                    <hr className="border-slate-200" />

                    <div
                      className={`border-2 border-dashed border-slate-300 rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-center bg-white mt-4 ${!logoPreview ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}`}
                      onClick={() => {
                        if (!logoPreview) fileInputRef.current?.click();
                      }}
                    >
                      {logoPreview ? (
                        <div className="relative inline-block">
                          <Image
                            src={logoPreview}
                            alt="Preview del logo"
                            width={128}
                            height={128}
                            className="max-h-32 w-auto object-contain rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLogo();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <ImageIcon className="h-6 w-6 text-slate-500" />
                          </div>
                          <p className="text-base font-semibold text-[slate-700] font-inter">
                            Haz clic para seleccionar una imagen
                          </p>
                          <p className="text-sm text-slate-400 mt-1 font-inter">
                            Formatos: PNG, JPG | Máximo: 1MB
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end pb-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-[slate-100] hover:bg-slate-200 text-slate-600 font-inter border border-slate-200 px-6 h-10"
                        disabled={!logoFile || isUploadingLogo || logoUploaded}
                        onClick={handleUploadLogo}
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4 text-slate-500" />
                        )}
                        {logoUploaded ? "Logo Enviado" : "Enviar Logo"}
                      </Button>
                    </div>

                    <hr className="border-slate-200" />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="organoAdscripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre del órgano de adscripción al que pertenece el Órgano o
                            Ente Contratante (si aplica)
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Ministerio del Poder Popular para Relaciones Interiores,
                            Justicia y Paz
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-3/4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* --- PASO 2 --- */}
              {step === 2 && (
                <>
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Seleccione el Estado donde se ubica el Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Lara
                          </p>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B456F]/30 text-slate-400 text-sm font-inter placeholder:italic">
                                <SelectValue placeholder="selecciona estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ESTADOS.map((estado) => (
                                <SelectItem key={estado} value={estado} className="font-inter">
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="municipio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Seleccione el Municipio donde se ubica el Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Iribarren
                          </p>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B456F]/30 text-slate-400 text-sm font-inter placeholder:italic">
                                <SelectValue placeholder="selecciona municipio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MUNICIPIOS.map((municipio) => (
                                <SelectItem
                                  key={municipio}
                                  value={municipio}
                                  className="font-inter"
                                >
                                  {municipio}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="ciudad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Seleccione la ciudad donde se ubica el Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Barquisimeto
                          </p>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B456F]/30 text-slate-400 text-sm font-inter placeholder:italic">
                                <SelectValue placeholder="selecciona ciudad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CIUDADES.map((ciudad) => (
                                <SelectItem key={ciudad} value={ciudad} className="font-inter">
                                  {ciudad}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="parroquia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Seleccione la parroquia donde se ubica el Órgano o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Concepcion
                          </p>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 rounded-md focus:ring-1 focus:ring-[#1B456F]/30 text-slate-400 text-sm font-inter placeholder:italic">
                                <SelectValue placeholder="selecciona parroquia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PARROQUIAS.map((parroquia) => (
                                <SelectItem
                                  key={parroquia}
                                  value={parroquia}
                                  className="font-inter"
                                >
                                  {parroquia}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="direccionFiscal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique la dirección fiscal completa (calle, edificio, etc.) del Órgano
                            o Ente Contratante.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Avenida 00, entre calles 00 y 00, Edif. Central, Piso 2.
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
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
                      name="nombreUnidadContratante"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre de la Unidad / Gerencia que cumple funciones de Unidad
                            Contratante
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Unidad de compras
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
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
                      name="nombreUnidadAdminFinanciera"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre de la Unidad / Gerencia responsable de la Gestión
                            Administrativa y Financiera.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Gerencia de administración y finanzas
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
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
                      name="nombreUnidadTecnologia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[slate-700] font-bold font-inter text-base">
                            Indique el nombre de la Unidad / Gerencia responsable del Área de
                            Sistema y Tecnología.
                          </FormLabel>
                          <p className="text-slate-500 italic text-sm mt-0.5 mb-2 font-inter">
                            Ejemplo: Unidad de telemática
                          </p>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              disabled={isSubmitting}
                              className="h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-[#1B456F]/30 w-full md:w-2/3 lg:w-1/2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Fin de campos que restan */}
            </div>

            {/* ── Botones ── */}
            <div className={`flex mt-12 ${step === 2 ? "justify-between" : "justify-end"}`}>
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={isSubmitting}
                  className="w-32 hover:bg-slate-50 font-inter h-11 border-slate-300 text-slate-500"
                >
                  Anterior
                </Button>
              )}

              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-32 bg-[#1B456F] hover:bg-[#273646] font-inter text-white h-11"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="bg-[#1B456F] hover:bg-[#273646] font-inter text-white h-11 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
