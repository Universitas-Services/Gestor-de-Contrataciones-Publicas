"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import {
  completarEnteSchema,
  type CompletarEnteFormValues,
} from "@/lib/schemas/completarEnteSchema";
import { obtenerEnte, actualizarEnte, actualizarLogoEnte } from "@/services/enteService";
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

// --- Datos manuales para los Selects ---

const ESTADOS = ["Distrito Capital", "Miranda"];
const MUNICIPIOS = ["Libertador", "Sucre"];
const PARROQUIAS = ["Catedral", "El Recreo"];

// --- Props ---

interface CompletarEnteFormProps {
  enteId: string;
}

// --- Formatos y tamaño del logo ---

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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

  const form = useForm<CompletarEnteFormValues>({
    resolver: zodResolver(completarEnteSchema),
    defaultValues: {
      nombre: "",
      rif: "",
      siglas: "",
      direccionFiscal: "",
      estado: "",
      municipio: "",
      parroquia: "",
      nombreUnidadAdminFinanciera: "",
      nombreUnidadTecnologia: "",
      nombreUnidadContratante: "",
      organoAdscripcion: "",
    },
    mode: "onChange",
  });

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
          parroquia: ente.parroquia || "",
          nombreUnidadAdminFinanciera: ente.nombreUnidadAdminFinanciera || "",
          nombreUnidadTecnologia: ente.nombreUnidadTecnologia || "",
          nombreUnidadContratante: ente.nombreUnidadContratante || "",
          organoAdscripcion: ente.organoAdscripcion || "",
        });

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
      toast.error("Formato no válido. Usa PNG, JPG o WEBP");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo supera el tamaño máximo de 2MB");
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

  // Guardar datos del ente
  const onSubmit = async (values: CompletarEnteFormValues) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Guardando datos del ente...");

    try {
      await actualizarEnte(enteId, values);

      toast.success("Datos del ente guardados correctamente", { id: toastId });
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
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando datos del ente...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Completar Datos del Ente</CardTitle>
        <CardDescription>
          Completa la información de tu ente público para continuar al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Sección: Información del Ente ── */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Información del Ente</h3>

              {/* Nombre del Ente (full width) */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Ente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Alcaldía del Municipio Libertador"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* RIF + Siglas (2 cols) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="rif"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RIF *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: G-20000000-0" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siglas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siglas *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: AML" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dirección Fiscal (full width) */}
              <FormField
                control={form.control}
                name="direccionFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Fiscal *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Av. Urdaneta, Palacio Municipal"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado + Municipio (2 cols) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="municipio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipio *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un municipio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MUNICIPIOS.map((municipio) => (
                            <SelectItem key={municipio} value={municipio}>
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

              {/* Parroquia + Órgano de Adscripción (2 cols) */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="parroquia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parroquia *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una parroquia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PARROQUIAS.map((parroquia) => (
                            <SelectItem key={parroquia} value={parroquia}>
                              {parroquia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organoAdscripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Órgano de Adscripción *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Ministerio del Poder Popular para..."
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ── Sección: Unidades del Ente ── */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Unidades del Ente</h3>

              <FormField
                control={form.control}
                name="nombreUnidadAdminFinanciera"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Unidad Administrativa Financiera *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Oficina de Planificación y Presupuesto"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombreUnidadTecnologia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Unidad de Tecnología *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Centro de Tecnologías de Información"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombreUnidadContratante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Unidad Contratante *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Oficina de Adquisiciones"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Sección: Logo del Ente ── */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Logo del Ente</h3>

              <div className="space-y-3">
                {/* Área de upload */}
                <div
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Preview del logo"
                        className="h-32 w-32 rounded-lg object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLogo();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Haz clic para seleccionar una imagen</p>
                        <p className="text-xs text-muted-foreground">
                          Formatos: PNG, JPG, WEBP | Máximo: 2MB
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Botón Enviar Logo */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!logoFile || isUploadingLogo || logoUploaded}
                    onClick={handleUploadLogo}
                    className="min-w-37.5"
                  >
                    {isUploadingLogo ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Subiendo...
                      </>
                    ) : logoUploaded ? (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Logo enviado
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Logo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Botón Guardar datos ── */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
                className="min-w-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar datos"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
