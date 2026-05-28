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
import { MoneyInput } from "@/components/ui/money-input";

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
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UniversitasAPI, Estado, Municipio, Parroquia } from "@universitas/sdk-global";

// Lazy getter: el SDK solo se instancia cuando se invoca por primera vez (en runtime),
// no durante la importación del módulo (build-time). Evita el crash en Vercel.
let _universitasClient: UniversitasAPI | null = null;
function getClient(): UniversitasAPI {
  if (!_universitasClient) {
    _universitasClient = new UniversitasAPI(process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL ?? "");
  }
  return _universitasClient;
}

// Tipos de documento para la carga de documentos del proveedor — dinámicos por tipo de persona
type TipoDocItem = { value: string; label: string; shortLabel: string; description: string };

const TIPOS_DOCUMENTO_BY_PERSONA: Record<string, TipoDocItem[]> = {
  JURIDICA: [
    {
      value: "doc_acta_constitutiva",
      label: "Acta constitutiva",
      shortLabel: "Acta constitutiva",
      description: "Cargue el documento completo en PDF",
    },
    {
      value: "doc_rif",
      label: "Registro de Información Fiscal (RIF)",
      shortLabel: "RIF",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_cedula",
      label: "Fotocopia de la cédula del representante legal",
      shortLabel: "Cédula",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_rnc",
      label:
        "Planilla de inscripción, actualización o calificación ante el Registro Nacional de Contratista (RNC)",
      shortLabel: "RNC",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_solvencia_laboral",
      label: "Solvencia Laboral",
      shortLabel: "Solvencia Laboral",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_licencia_municipal",
      label: "Licencia de funcionamiento Municipal",
      shortLabel: "Licencia Municipal",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_islr",
      label: "Declaración de Impuesto Sobre la Renta del último ejercicio fiscal",
      shortLabel: "ISLR",
      description: "Cargue documento vigente en PDF",
    },
  ],
  NATURAL: [
    {
      value: "doc_rif",
      label: "Registro de Información Fiscal",
      shortLabel: "RIF",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_cedula",
      label: "Fotocopia de la cédula del proveedor",
      shortLabel: "Cédula",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_rnc",
      label:
        "Planilla de inscripción, actualización o calificación ante el Registro Nacional de Contratista (RNC)",
      shortLabel: "RNC",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_curriculum",
      label: "Curriculum Vitae",
      shortLabel: "Curriculum",
      description: "Cargue documento en PDF",
    },
    {
      value: "doc_titulo",
      label: "Fondo negro del Título Universitario",
      shortLabel: "Título",
      description: "Cargue documento en PDF",
    },
    {
      value: "doc_islr",
      label: "Declaración de Impuesto Sobre la Renta del último ejercicio fiscal",
      shortLabel: "ISLR",
      description: "Cargue documento vigente en PDF",
    },
  ],
  ADMINISTRACION_PUBLICA: [
    {
      value: "doc_rif",
      label: "Registro de Información Fiscal",
      shortLabel: "RIF",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_cedula",
      label:
        "Fotocopia de la cédula de la Máxima Autoridad del Órgano o Ente de la Administración Pública",
      shortLabel: "Cédula",
      description: "Cargue documento vigente en PDF",
    },
    {
      value: "doc_resolucion",
      label:
        "Resolución, Decreto, Acta o Acuerdo de designación de la Máxima Autoridad del Órgano o Ente de la Administración Pública",
      shortLabel: "Resolución",
      description: "Cargue documento en PDF",
    },
    {
      value: "doc_gaceta",
      label: "Gaceta de creación del Órgano o Ente de la Administración Pública",
      shortLabel: "Gaceta",
      description: "Cargue documento en PDF",
    },
  ],
};

// Fallback por si el tipo aún no está seleccionado
const TIPOS_DOCUMENTO_DEFAULT: TipoDocItem[] = TIPOS_DOCUMENTO_BY_PERSONA.JURIDICA;

const FORMA_JURIDICA_LABELS: Record<string, string> = {
  COMPANIA_ANONIMA: "Compañía Anónima (C.A)",
  ASOCIACION_CIVIL: "Asociación Civil",
  SRL: "Sociedades de Responsabilidad Limitada (S.R.L.)",
  FUNDACION: "Fundaciones",
  COOPERATIVA: "Cooperativas",
  PYME: "Pymes",
  SOCIEDAD_CIVIL: "Sociedad Civil",
};

const TIPO_PERSONA_LABELS: Record<string, string> = {
  JURIDICA: "Persona Jurídica",
  NATURAL: "Persona Natural",
  ADMINISTRACION_PUBLICA: "Órganos y Entes de la Administración Pública",
};

const STEP1_BASE_FIELDS: (keyof NuevoProveedorFormValues)[] = [
  "correo",
  "nombre",
  "rif",
  "tipoPersona",
];

const STEP1_COMMON_DYNAMIC_FIELDS: (keyof NuevoProveedorFormValues)[] = [
  "telefono",
  "estado",
  "municipio",
  "parroquia",
  "direccionFiscal",
  "areaEspecialidad",
  "nivelContratacion",
];

const STEP1_FIELDS_BY_PERSONA: Record<string, (keyof NuevoProveedorFormValues)[]> = {
  JURIDICA: [
    ...STEP1_BASE_FIELDS,
    ...STEP1_COMMON_DYNAMIC_FIELDS,
    "rnc",
    "formaJuridica",
    "datosRegistroMercantil",
    "representanteNombre",
    "representanteCedula",
    "solvenciaLaboral",
    "licenciaMunicipal",
    "islr",
    "actividadPrincipal",
    "anosExperiencia",
    "patrimonioNeto",
    "fechaEstadoFinanciero",
  ],
  NATURAL: [
    ...STEP1_BASE_FIELDS,
    ...STEP1_COMMON_DYNAMIC_FIELDS,
    "rnc",
    "cedulaNatural",
    "islr",
    "actividadPrincipal",
    "anosExperiencia",
  ],
  ADMINISTRACION_PUBLICA: [
    ...STEP1_BASE_FIELDS,
    ...STEP1_COMMON_DYNAMIC_FIELDS,
    "nombreAutoridad",
    "cedulaAutoridad",
    "datosDesignacionAutoridad",
  ],
};

function getTipoPersonaFromRifPrefix(prefix: string): string {
  if (prefix === "J") return "JURIDICA";
  if (prefix === "G") return "ADMINISTRACION_PUBLICA";
  if (prefix === "V") return "NATURAL";
  return "";
}

interface NuevoProveedorFormProps {
  providerId?: string;
  readOnly?: boolean;
}

export function NuevoProveedorForm({ providerId, readOnly = false }: NuevoProveedorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousRifTipoRef = useRef<string>("");

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(!!providerId);

  // Estados visuales duales (RIF y Cedula)
  const [rifTipo, setRifTipo] = useState("");
  const [rifCuerpo, setRifCuerpo] = useState(""); // 8 dígitos
  const [rifVerificador, setRifVerificador] = useState(""); // 1 dígito
  const rifVerificadorRef = useRef<HTMLInputElement>(null);
  const [cedulaTipo, setCedulaTipo] = useState("V");
  const [cedulaNumero, setCedulaNumero] = useState("");
  const [cedulaNaturalTipo, setCedulaNaturalTipo] = useState("V");
  const [cedulaNaturalNumero, setCedulaNaturalNumero] = useState("");
  const [cedulaAutoridadTipo, setCedulaAutoridadTipo] = useState("V");
  const [cedulaAutoridadNumero, setCedulaAutoridadNumero] = useState("");

  // Estado para Teléfono
  const [phonePrefix, setPhonePrefix] = useState("0414");
  const [phoneBody, setPhoneBody] = useState("");

  // Estado Local para Documentos
  const [docStepIndex, setDocStepIndex] = useState(0);
  // Observaciones persistidas por tipo de documento
  const [obsMap, setObsMap] = useState<Record<string, string>>({});
  const [isUploadingFile, setIsUploadingFile] = useState(false);

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

  // Bytes totales ocupados por los archivos adjuntos (debe ir después de documentos)
  //
  // LÍMITE MOSTRADO AL USUARIO (UI): 10 MB — es lo que ve en el banner y el contador.
  // LÍMITE REAL DE VALIDACIÓN: 9.5 MB — margen silencioso de ~512 KB para el JSON del
  // formulario + overhead multipart que también consume cuota en el endpoint.
  const DISPLAY_LIMIT_BYTES = 10 * 1024 * 1024; // 10.00 MB  (solo para UI)
  const MAX_UPLOAD_BYTES = 9.5 * 1024 * 1024; //  9.50 MB  (validación real)

  const totalUploadedBytes = documentos.reduce((acc, d) => acc + d.file.size, 0);
  // Métricas de UI calculadas sobre el límite visible (10 MB) para que los números cuadren
  const usedMB = (totalUploadedBytes / (1024 * 1024)).toFixed(2);
  const remainingMB = Math.max(
    0,
    (DISPLAY_LIMIT_BYTES - totalUploadedBytes) / (1024 * 1024)
  ).toFixed(2);
  const storagePercent = Math.min(100, (totalUploadedBytes / DISPLAY_LIMIT_BYTES) * 100);

  const form = useForm<NuevoProveedorFormValues>({
    resolver: zodResolver(nuevoProveedorSchema),
    defaultValues: {
      correo: "",
      nombre: "",
      rif: "",
      formaJuridica: "",
      tipoPersona: "",
      datosRegistroMercantil: "",
      cedulaNatural: "",
      nombreAutoridad: "",
      cedulaAutoridad: "",
      datosDesignacionAutoridad: "",
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
      islr: undefined,
      actividadPrincipal: "",
      areaEspecialidad: "",
      anosExperiencia: "",
      patrimonioNeto: "",
      fechaEstadoFinanciero: "",
      nivelContratacion: "",
    },
    mode: "onChange",
  });

  // --- Estados Territoriales Dinámicos ---
  const [estadosList, setEstadosList] = useState<Estado[]>([]);
  const [municipiosList, setMunicipiosList] = useState<Municipio[]>([]);
  const [parroquiasList, setParroquiasList] = useState<Parroquia[]>([]);

  const selectedEstado = form.watch("estado");
  const selectedMunicipio = form.watch("municipio");
  const currentTipoPersona = form.watch("tipoPersona");
  const hasTipoPersonaSelected = Boolean(currentTipoPersona);

  // Lista de documentos requeridos según el tipo de persona
  const tiposDocumento: TipoDocItem[] =
    TIPOS_DOCUMENTO_BY_PERSONA[currentTipoPersona] ?? TIPOS_DOCUMENTO_DEFAULT;
  const tipoDocActual = tiposDocumento[docStepIndex]?.value ?? tiposDocumento[0]?.value ?? "";

  // Resetear el paso de documentos cuando cambia el tipo de persona
  useEffect(() => {
    setDocStepIndex(0);
  }, [currentTipoPersona]);

  // Cargar estados iniciales
  useEffect(() => {
    getClient()
      .territorio.getEstados()
      .then((res) => setEstadosList(res.data))
      .catch(console.error);
  }, []);

  // Cargar municipios cuando cambia estado
  useEffect(() => {
    if (!selectedEstado) {
      setMunicipiosList([]);
      setParroquiasList([]);
      return;
    }
    const estadoObj = estadosList.find((e) => e.nombre === selectedEstado);
    if (estadoObj) {
      getClient()
        .territorio.getMunicipios(estadoObj.id)
        .then((res) => setMunicipiosList(res.data))
        .catch(console.error);
    }
  }, [selectedEstado, estadosList]);

  // Cargar parroquias cuando cambia municipio
  useEffect(() => {
    if (!selectedMunicipio) {
      setParroquiasList([]);
      return;
    }
    const municipioObj = municipiosList.find((m) => m.nombre === selectedMunicipio);
    if (municipioObj) {
      getClient()
        .territorio.getParroquias(municipioObj.id)
        .then((res) => setParroquiasList(res.data))
        .catch(console.error);
    }
  }, [selectedMunicipio, municipiosList]);

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
          if (v === "COOPERATIVA" || v === "COOPERATIVA") return "COOPERATIVA";
          if (v === "PYME" || v === "PYME") return "PYME";
          if (v === "COMPANIA_ANONIMA" || v === "C.A." || v === "C.A" || v.includes("ANONIMA"))
            return "COMPANIA_ANONIMA";
          if (v === "ASOCIACION_CIVIL") return "ASOCIACION_CIVIL";
          if (v === "SOCIEDAD_CIVIL") return "SOCIEDAD_CIVIL";
          if (v === "SRL" || v.includes("LIMITADA")) return "SRL";
          if (v === "FUNDACION" || v === "FUNDACION") return "FUNDACION";
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
          cedulaNatural: data.cedulaNatural || "",
          nombreAutoridad: data.nombreAutoridad || "",
          cedulaAutoridad: data.cedulaAutoridad || "",
          datosDesignacionAutoridad: data.datosDesignacionAutoridad || "",
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
          islr: data.declaracionIslr ? "Si" : "No",
          actividadPrincipal: data.actividadComercial || "",
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
        if (data.cedulaNatural) {
          const cidParts = data.cedulaNatural.split("-");
          if (cidParts.length === 2) {
            setCedulaNaturalTipo(cidParts[0]);
            setCedulaNaturalNumero(cidParts[1]);
          }
        }
        if (data.cedulaAutoridad) {
          const cidParts = data.cedulaAutoridad.split("-");
          if (cidParts.length === 2) {
            setCedulaAutoridadTipo(cidParts[0]);
            setCedulaAutoridadNumero(cidParts[1]);
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
    const tipoPersona = getTipoPersonaFromRifPrefix(rifTipo);
    form.setValue("tipoPersona", tipoPersona, { shouldValidate: Boolean(tipoPersona) });
  }, [rifTipo, form]);

  useEffect(() => {
    if (isLoadingInitialData) return;
    const previousRifTipo = previousRifTipoRef.current;
    if (previousRifTipo && previousRifTipo !== rifTipo) {
      form.setValue("formaJuridica", "");
      form.setValue("datosRegistroMercantil", "");
      form.setValue("representanteNombre", "");
      form.setValue("representanteCedula", "");
      form.setValue("solvenciaLaboral", undefined);
      form.setValue("licenciaMunicipal", undefined);
      form.setValue("patrimonioNeto", "");
      form.setValue("fechaEstadoFinanciero", "");
      form.setValue("cedulaNatural", "");
      form.setValue("nombreAutoridad", "");
      form.setValue("cedulaAutoridad", "");
      form.setValue("datosDesignacionAutoridad", "");
      form.setValue("telefono", "");
      form.setValue("estado", "");
      form.setValue("municipio", "");
      form.setValue("parroquia", "");
      form.setValue("direccionFiscal", "");
      form.setValue("rnc", undefined);
      form.setValue("islr", undefined);
      form.setValue("actividadPrincipal", "");
      form.setValue("areaEspecialidad", "");
      form.setValue("anosExperiencia", "");
      form.setValue("nivelContratacion", "");
      setCedulaNumero("");
      setCedulaNaturalNumero("");
      setCedulaAutoridadNumero("");
      setPhoneBody("");
    }
    previousRifTipoRef.current = rifTipo;
  }, [rifTipo, form, isLoadingInitialData]);

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

  useEffect(() => {
    if (isLoadingInitialData) return;
    if (cedulaNaturalTipo && cedulaNaturalNumero.length >= 6) {
      form.setValue("cedulaNatural", `${cedulaNaturalTipo}-${cedulaNaturalNumero}`, {
        shouldValidate: true,
      });
    } else if (cedulaNaturalNumero.length > 0) {
      form.setValue("cedulaNatural", "");
    }
  }, [cedulaNaturalTipo, cedulaNaturalNumero, form, isLoadingInitialData]);

  useEffect(() => {
    if (isLoadingInitialData) return;
    if (cedulaAutoridadTipo && cedulaAutoridadNumero.length >= 6) {
      form.setValue("cedulaAutoridad", `${cedulaAutoridadTipo}-${cedulaAutoridadNumero}`, {
        shouldValidate: true,
      });
    } else if (cedulaAutoridadNumero.length > 0) {
      form.setValue("cedulaAutoridad", "");
    }
  }, [cedulaAutoridadTipo, cedulaAutoridadNumero, form, isLoadingInitialData]);

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
    if (readOnly) {
      setStep(2);
      return;
    }

    const tipoPersona = form.getValues("tipoPersona");
    const fieldsToValidate = STEP1_FIELDS_BY_PERSONA[tipoPersona] ?? STEP1_BASE_FIELDS;
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setStep(2);
      window.scrollTo(0, 0);
    } else {
      toast.error("Por favor, complete todos los campos obligatorios antes de continuar.");
    }
  };

  const onSubmit = async () => {
    if (readOnly) return;
    setIsSubmitting(true);
    try {
      const data = form.getValues();
      const formData = new FormData();
      const tipoPersona = data.tipoPersona;
      const isJuridica = tipoPersona === "JURIDICA";
      const isNatural = tipoPersona === "NATURAL";
      const isAdminPublica = tipoPersona === "ADMINISTRACION_PUBLICA";
      const appendNullable = (key: string, value?: string) => {
        formData.append(key, value && value.trim() ? value : "null");
      };

      formData.append("correo", data.correo);
      formData.append("nombre", data.nombre);
      formData.append("rif", data.rif);
      formData.append("tipoPersona", data.tipoPersona);
      appendNullable("tipoEntidadJuridica", isJuridica ? data.formaJuridica : undefined);
      appendNullable(
        "datosRegistroMercantil",
        isJuridica ? data.datosRegistroMercantil : undefined
      );
      formData.append("estado", data.estado || "");
      formData.append("municipio", data.municipio || "");
      formData.append("parroquia", data.parroquia || "");
      formData.append("direccionFiscal", data.direccionFiscal || "");
      formData.append("telefono", data.telefono || "");
      appendNullable("nombreRepLegal", isJuridica ? data.representanteNombre : undefined);
      appendNullable("cedulaRepLegal", isJuridica ? data.representanteCedula : undefined);
      appendNullable("cedulaNatural", isNatural ? data.cedulaNatural : undefined);
      appendNullable("nombreAutoridad", isAdminPublica ? data.nombreAutoridad : undefined);
      appendNullable("cedulaAutoridad", isAdminPublica ? data.cedulaAutoridad : undefined);
      appendNullable(
        "datosDesignacionAutoridad",
        isAdminPublica ? data.datosDesignacionAutoridad : undefined
      );

      formData.append("registroRnc", data.rnc === "Si" ? "true" : "false");
      formData.append(
        "solvenciaLaboral",
        isJuridica ? (data.solvenciaLaboral === "Si" ? "true" : "false") : "null"
      );
      formData.append(
        "licenciaFuncionamientoMunicipal",
        isJuridica ? (data.licenciaMunicipal === "Si" ? "true" : "false") : "null"
      );
      formData.append(
        "declaracionIslr",
        !isAdminPublica ? (data.islr === "Si" ? "true" : "false") : "null"
      );

      appendNullable("actividadComercial", !isAdminPublica ? data.actividadPrincipal : undefined);
      formData.append("areaEspecialidad", data.areaEspecialidad || "");
      appendNullable("anosExperiencia", !isAdminPublica ? data.anosExperiencia : undefined);
      appendNullable("fechaEstadoFinanciero", isJuridica ? data.fechaEstadoFinanciero : undefined);
      appendNullable("patrimonioReportado", isJuridica ? data.patrimonioNeto : undefined);
      formData.append("nivelContratacion", data.nivelContratacion || "");

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
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // ── Validación 1: Solo se permiten archivos PDF ──
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPDF) {
      toast.error("Formato no permitido", {
        description:
          "Solo se aceptan archivos en formato PDF. Por favor selecciona un archivo .pdf.",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // ── Validación 2: La suma total no puede superar los 10 MB ──
    // Si ya existe un doc del mismo tipo, su tamaño será reemplazado, no sumado.
    const bytesExistentes = documentos
      .filter((d) => d.tipoDoc !== tipoDocActual)
      .reduce((acc, d) => acc + d.file.size, 0);
    const proyectadoBytes = bytesExistentes + file.size;
    if (proyectadoBytes > MAX_UPLOAD_BYTES) {
      const proyectadoMB = (proyectadoBytes / (1024 * 1024)).toFixed(2);
      const archivoMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.warning("Límite de almacenamiento superado", {
        description: `Este archivo pesa ${archivoMB} MB y haría que el total llegara a ${proyectadoMB} MB, superando el límite de 10 MB. Elimina algún documento o selecciona un archivo más pequeño.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingFile(true);

    // Capturamos la observación actual del mapa para este tipo de doc
    const obsParaDoc = obsMap[tipoDocActual] ?? "";

    const newDoc = {
      id: Math.random().toString(36).substr(2, 9),
      tipoDoc: tipoDocActual,
      file: file,
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB",
      time: "Cargado justo ahora",
      type: "PDF File",
      observaciones: obsParaDoc,
    };

    // Simular latencia de carga para dar feedback visual al usuario
    setTimeout(() => {
      // Agregar reemplazando si ya existe un documento de ese tipo
      setDocumentos((prev) => [...prev.filter((d) => d.tipoDoc !== tipoDocActual), newDoc]);
      setIsUploadingFile(false);

      // Resetear input real
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 900);
  };

  const handleDeleteDocument = (id: string) => {
    if (readOnly) return;
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
                  <div className="w-1 h-6 bg-lime rounded-full"></div>
                  <h2 className="text-xl font-bold text-color-titulos">1. Identificación</h2>
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
                        {hasTipoPersonaSelected && <FormMessage />}
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
                          Nombre del Proveedor / Empresa o Razón Social
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[80px] h-11 font-normal border border-border bg-white justify-between"
                          >
                            <span>{rifTipo || "Tipo"}</span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setRifTipo("V")}>V</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRifTipo("G")}>G</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRifTipo("J")}>J</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

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

                  {/* Tipo de Persona */}
                  <FormField
                    control={form.control}
                    name="tipoPersona"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel className="font-bold text-color-subtitulos mb-2">
                          Tipo de Persona
                        </FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            value={
                              TIPO_PERSONA_LABELS[field.value] || "Seleccione un prefijo de RIF"
                            }
                            className="h-11 border-border bg-slate-50 text-slate-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {currentTipoPersona === "JURIDICA" && (
                    <FormField
                      control={form.control}
                      name="formaJuridica"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-color-subtitulos">
                            Forma jurídica
                          </FormLabel>
                          <p className="text-xs text-muted-foreground italic mb-2">
                            Ejemplo: Compañía Anónima C.A
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full h-11 justify-between font-normal border-border focus-visible:ring-color-boton-2 bg-white",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <span className={field.value ? "text-slate-700" : ""}>
                                    {field.value
                                      ? FORMA_JURIDICA_LABELS[field.value] || field.value
                                      : "Seleccionar opciones"}
                                  </span>
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                              <DropdownMenuItem onClick={() => field.onChange("COMPANIA_ANONIMA")}>
                                Compañía Anónima (C.A)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("ASOCIACION_CIVIL")}>
                                Asociación Civil
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("SRL")}>
                                Sociedades de Responsabilidad Limitada (S.R.L.)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("FUNDACION")}>
                                Fundaciones
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("COOPERATIVA")}>
                                Cooperativas
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("PYME")}>
                                Pymes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => field.onChange("SOCIEDAD_CIVIL")}>
                                Sociedad Civil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {currentTipoPersona === "JURIDICA" && (
                    <FormField
                      control={form.control}
                      name="datosRegistroMercantil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-color-subtitulos">
                            Indique los datos del Registro Mercantil del proveedor
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
                  )}

                  {currentTipoPersona === "JURIDICA" && (
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
                  )}
                  {currentTipoPersona === "JURIDICA" && (
                    <div className="space-y-2">
                      <FormLabel className="font-bold text-color-subtitulos">
                        Cédula del Representante Legal
                      </FormLabel>
                      <p className="text-xs text-muted-foreground italic mb-2">
                        Ejemplo: V-00.000.000
                      </p>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-[100px] h-11 font-normal border-border bg-white shadow-sm justify-between"
                            >
                              <span>{cedulaTipo || "V"}</span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setCedulaTipo("V")}>
                              V
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCedulaTipo("E")}>
                              E
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  )}

                  {currentTipoPersona === "NATURAL" && (
                    <div className="space-y-2">
                      <FormLabel className="font-bold text-color-subtitulos">
                        Cédula del Proveedor
                      </FormLabel>
                      <p className="text-xs text-muted-foreground italic mb-2">
                        Ejemplo: V-00.000.000
                      </p>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-[100px] h-11 font-normal border-border bg-white shadow-sm justify-between"
                            >
                              <span>{cedulaNaturalTipo || "V"}</span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setCedulaNaturalTipo("V")}>
                              V
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCedulaNaturalTipo("E")}>
                              E
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Input
                          placeholder="00000000"
                          maxLength={8}
                          value={cedulaNaturalNumero}
                          onChange={(e) =>
                            setCedulaNaturalNumero(e.target.value.replace(/\D/g, ""))
                          }
                          className="flex-1 max-w-[200px] h-11 border border-slate-300 focus-visible:ring-1 focus-visible:ring-color-boton-2 bg-white"
                        />
                      </div>
                      {form.formState.errors.cedulaNatural && (
                        <p className="text-sm font-medium text-destructive">
                          {form.formState.errors.cedulaNatural.message}
                        </p>
                      )}
                    </div>
                  )}

                  {currentTipoPersona === "ADMINISTRACION_PUBLICA" && (
                    <>
                      <FormField
                        control={form.control}
                        name="nombreAutoridad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-color-subtitulos">
                              Nombre de la Máxima Autoridad
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
                      <div className="space-y-2">
                        <FormLabel className="font-bold text-color-subtitulos">
                          Cédula de la Máxima Autoridad
                        </FormLabel>
                        <p className="text-xs text-muted-foreground italic mb-2">
                          Ejemplo: V-00.000.000
                        </p>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-[100px] h-11 font-normal border-border bg-white shadow-sm justify-between"
                              >
                                <span>{cedulaAutoridadTipo || "V"}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setCedulaAutoridadTipo("V")}>
                                V
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setCedulaAutoridadTipo("E")}>
                                E
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Input
                            placeholder="00000000"
                            maxLength={8}
                            value={cedulaAutoridadNumero}
                            onChange={(e) =>
                              setCedulaAutoridadNumero(e.target.value.replace(/\D/g, ""))
                            }
                            className="flex-1 max-w-[200px] h-11 border border-slate-300 focus-visible:ring-1 focus-visible:ring-color-boton-2 bg-white"
                          />
                        </div>
                        {form.formState.errors.cedulaAutoridad && (
                          <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.cedulaAutoridad.message}
                          </p>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name="datosDesignacionAutoridad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-color-subtitulos">
                              Datos de Resolución/Decreto/Acta de designación
                            </FormLabel>
                            <p className="text-xs text-muted-foreground italic mb-2">
                              Ejemplo: Resolución N° 000/00 de fecha 00-00-0000 publicado en Gaceta
                              N° 0000
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
                    </>
                  )}

                  {hasTipoPersonaSelected && (
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
                  )}
                </div>
              </div>

              {hasTipoPersonaSelected && (
                <>
                  {/* Separador */}
                  <div className="border-t border-border"></div>

                  {/* Sección 2: Ubicación */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-color-boton-2 rounded-full"></div>
                      <h2 className="text-xl font-bold text-color-titulos">2. Ubicación</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 max-w-[800px]">
                      {/* Estado */}
                      <FormField
                        control={form.control}
                        name="estado"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-bold text-color-subtitulos">
                              Estado
                            </FormLabel>
                            <p className="text-xs text-muted-foreground italic mb-2">
                              Ejemplo: Lara
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-11 justify-between font-normal bg-white border-border hover:bg-slate-50 focus-visible:ring-color-boton-2",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting || estadosList.length === 0}
                                  >
                                    <span className={field.value ? "text-slate-700" : ""}>
                                      {field.value || "Selecciona estado"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                                {estadosList.map((estado) => (
                                  <DropdownMenuItem
                                    key={estado.id}
                                    onClick={() => {
                                      field.onChange(estado.nombre);
                                      form.setValue("municipio", "");
                                      form.setValue("parroquia", "");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {estado.nombre}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Municipio */}
                      <FormField
                        control={form.control}
                        name="municipio"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-bold text-color-subtitulos">
                              Municipio
                            </FormLabel>
                            <p className="text-xs text-muted-foreground italic mb-2">
                              Ejemplo: Iribarren
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-11 justify-between font-normal bg-white border-border hover:bg-slate-50 focus-visible:ring-color-boton-2",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting || municipiosList.length === 0}
                                  >
                                    <span className={field.value ? "text-slate-700" : ""}>
                                      {field.value || "Selecciona municipio"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                                {municipiosList.map((municipio) => (
                                  <DropdownMenuItem
                                    key={municipio.id}
                                    onClick={() => {
                                      field.onChange(municipio.nombre);
                                      form.setValue("parroquia", "");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    {municipio.nombre}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Parroquia */}
                      <FormField
                        control={form.control}
                        name="parroquia"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-bold text-color-subtitulos">
                              Parroquia
                            </FormLabel>
                            <p className="text-xs text-muted-foreground italic mb-2">
                              Ejemplo: Concepción
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full h-11 justify-between font-normal bg-white border-border hover:bg-slate-50 focus-visible:ring-color-boton-2",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled={isSubmitting || parroquiasList.length === 0}
                                  >
                                    <span className={field.value ? "text-slate-700" : ""}>
                                      {field.value || "Selecciona parroquia"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto">
                                {parroquiasList.map((parroquia) => (
                                  <DropdownMenuItem
                                    key={parroquia.id}
                                    onClick={() => field.onChange(parroquia.nombre)}
                                    className="cursor-pointer"
                                  >
                                    {parroquia.nombre}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                              Ejemplo: Avenida 00, entre calles 00 y 00, Centro Comercial Central,
                              Piso 2, Local 3
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
                </>
              )}

              {hasTipoPersonaSelected && (
                <>
                  {/* Separador */}
                  <div className="border-t border-border"></div>

                  {currentTipoPersona !== "ADMINISTRACION_PUBLICA" && (
                    <>
                      {/* Sección 3: Validación de requisitos */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-color-boton-2 rounded-full"></div>
                          <h2 className="text-xl font-bold text-color-titulos">
                            3. Validación de requisitos
                          </h2>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Preguntas de requisitos */}
                          {[
                            {
                              name: "rnc",
                              label:
                                "¿Está registrado en el Registro Nacional de Contratista (RNC)?",
                            },
                            ...(currentTipoPersona === "JURIDICA"
                              ? [
                                  {
                                    name: "solvenciaLaboral",
                                    label: "¿Tiene solvencia laboral vigente?",
                                  },
                                  {
                                    name: "licenciaMunicipal",
                                    label: "¿Tiene licencia de funcionamiento municipal vigente?",
                                  },
                                ]
                              : []),
                            {
                              name: "islr",
                              label:
                                "¿Posee Declaración de Impuesto Sobre la Renta (ISLR) del último ejercicio fiscal?",
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
                    </>
                  )}

                  {/* Sección Capacidad Técnica y Financiera */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-navy rounded-full"></div>
                      <h2 className="text-xl font-bold text-color-titulos">
                        {currentTipoPersona === "ADMINISTRACION_PUBLICA"
                          ? "3. Capacidad técnica y financiera"
                          : "4. Capacidad técnica y financiera"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-[800px]">
                      {currentTipoPersona !== "ADMINISTRACION_PUBLICA" && (
                        <FormField
                          control={form.control}
                          name="actividadPrincipal"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="font-bold text-color-subtitulos">
                                Actividad comercial principal
                              </FormLabel>
                              <p className="text-xs text-muted-foreground italic mb-2">
                                Ejemplo: El objeto principal es la prestación de servicios de
                                consultoría y asesoría en el área de tecnología de la información,
                                lo que incluye el desarrollo de software, diseño de páginas web, y
                                manejo de redes sociales.
                              </p>
                              <FormControl>
                                <Textarea
                                  className="min-h-[100px] border-border focus-visible:ring-color-boton-2"
                                  placeholder="Describa la actividad comercial principal"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

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
                      {currentTipoPersona !== "ADMINISTRACION_PUBLICA" && (
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
                      )}
                      {currentTipoPersona === "JURIDICA" && (
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
                                        format(new Date(field.value), "PPP", { locale: es })
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
                                    locale={es}
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
                      )}
                      {currentTipoPersona === "JURIDICA" && (
                        <FormField
                          control={form.control}
                          name="patrimonioNeto"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-color-subtitulos">
                                Patrimonio neto reportado
                              </FormLabel>
                              <FormControl>
                                <MoneyInput
                                  placeholder="Ej: 10000"
                                  className="h-11 border-border focus-visible:ring-color-boton-2"
                                  name={field.name}
                                  value={field.value || ""}
                                  onBlur={field.onBlur}
                                  disabled={isSubmitting}
                                  onValueChange={(cleanValue) => field.onChange(cleanValue)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
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
                </>
              )}
              {!hasTipoPersonaSelected && (
                <div className="p-4 border border-dashed border-border rounded-md bg-slate-50">
                  <p className="text-sm text-muted-foreground">
                    Selecciona V, J o G en el RIF para desplegar el resto del formulario.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Header de sección */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-section-docs rounded-full"></div>
                <h2 className="text-xl font-bold text-color-titulos">4. Carga de documentos</h2>
              </div>

              {/* Contador dinámico de espacio de almacenamiento */}
              <div className="p-3 bg-slate-bg border border-border-light rounded-lg mb-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-section-docs shrink-0" />
                    <p className="text-xs text-color-subtitulos font-medium">
                      <strong>Límite de carga:</strong> máx. <strong>10 MB</strong> en total
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold">
                    <span className="text-muted-foreground">
                      Usado: <span className="text-color-titulos">{usedMB} MB</span>
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-bold",
                        storagePercent >= 90
                          ? "bg-destructive/10 text-destructive"
                          : storagePercent >= 70
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-success-bg text-success-text"
                      )}
                    >
                      {remainingMB} MB libres
                    </span>
                  </div>
                </div>
                {/* Barra de uso */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      storagePercent >= 90
                        ? "bg-destructive"
                        : storagePercent >= 70
                          ? "bg-yellow-400"
                          : "bg-success"
                    )}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>

              {/* Layout dividido: Stepper izquierda + Panel derecha */}
              <div className="flex gap-6 min-h-[520px]">
                {/* ── SIDEBAR STEPPER VERTICAL ── */}
                <aside className="w-64 flex-shrink-0 flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                    Documentos requeridos
                  </p>
                  {tiposDocumento.map((tipo, idx) => {
                    const isUploaded = documentos.some((d) => d.tipoDoc === tipo.value);
                    const isActive = idx === docStepIndex;
                    const isCompleted = isUploaded;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => {
                          setDocStepIndex(idx);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group",
                          isActive
                            ? "bg-navy/10 border border-navy/20 shadow-sm"
                            : "hover:bg-muted border border-transparent"
                        )}
                      >
                        {/* Indicador de estado circular */}
                        <div
                          className={cn(
                            "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 text-xs font-bold",
                            isCompleted
                              ? "bg-success text-white"
                              : isActive
                                ? "bg-navy text-white"
                                : "bg-muted border-2 border-border text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        {/* Texto del paso */}
                        <div className="flex flex-col min-w-0">
                          <span
                            className={cn(
                              "text-[12.5px] font-semibold leading-snug truncate",
                              isActive
                                ? "text-navy"
                                : isCompleted
                                  ? "text-success-text"
                                  : "text-color-subtitulos"
                            )}
                          >
                            {tipo.shortLabel}
                          </span>
                          <span className="text-[10px] mt-0.5 font-medium">
                            {isCompleted ? (
                              <span className="text-success-text">Cargado ✓</span>
                            ) : isActive ? (
                              <span className="text-navy/70">En curso</span>
                            ) : (
                              <span className="text-muted-foreground">Pendiente</span>
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Progreso global */}
                  <div className="mt-4 px-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Progreso
                      </span>
                      <span className="text-[10px] font-bold text-color-titulos">
                        {documentos.length}/{tiposDocumento.length}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500"
                        style={{ width: `${(documentos.length / tiposDocumento.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </aside>

                {/* ── PANEL CENTRAL DE CARGA ── */}
                <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                  {/* Header del panel */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-bg">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {docStepIndex + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-color-titulos leading-tight">
                          {tiposDocumento[docStepIndex]?.label ?? ""}
                        </p>
                        <p className="text-[11px] text-muted-foreground italic">
                          {tiposDocumento[docStepIndex]?.description ?? ""}
                        </p>
                      </div>
                    </div>
                    {isUploadingFile ? (
                      <div className="flex items-center gap-1.5 bg-muted text-color-subtitulos text-[11px] font-bold px-3 py-1 rounded-full">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Cargando...</span>
                      </div>
                    ) : (
                      documentos.some((d) => d.tipoDoc === tipoDocActual) && (
                        <div className="flex items-center gap-1.5 bg-success-bg text-success-text text-[11px] font-bold px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Documento cargado</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Cuerpo del panel */}
                  <div className="flex-1 px-6 py-5 flex flex-col gap-5 overflow-y-auto">
                    {/* Dropzone */}
                    <div
                      className={cn(
                        "w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all group py-10",
                        isUploadingFile
                          ? "border-navy/40 bg-navy/5 cursor-not-allowed pointer-events-none"
                          : "border-dropzone-border bg-dropzone-bg cursor-pointer hover:bg-dropzone-border/20"
                      )}
                      onClick={() => !readOnly && !isUploadingFile && fileInputRef.current?.click()}
                    >
                      {isUploadingFile ? (
                        /* Estado: cargando */
                        <>
                          <div className="relative w-14 h-14 mb-3 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-navy/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-navy border-l-transparent border-r-transparent border-b-transparent animate-spin" />
                            <Loader2 className="w-6 h-6 text-navy animate-spin" />
                          </div>
                          <span className="text-navy font-bold text-base mb-1">
                            Cargando archivo...
                          </span>
                          <span className="text-muted-foreground text-sm">
                            Por favor espera un momento
                          </span>
                        </>
                      ) : (
                        /* Estado: idle */
                        <>
                          <div className="w-14 h-14 bg-dropzone-border rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <BsCloudUploadFill className="w-7 h-7 text-white" />
                          </div>
                          <span className="text-color-titulos font-bold text-base mb-1">
                            Adjunta el archivo aquí
                          </span>
                          <span className="text-muted-foreground text-sm">
                            Arrastra y suelta o haz click para buscar
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-2">
                            Solo PDF — máx. 10 MB en total entre todos los documentos
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf,.pdf"
                        disabled={isUploadingFile}
                      />
                    </div>

                    {/* Documento cargado para este paso */}
                    {(() => {
                      const docActivo = documentos.find((d) => d.tipoDoc === tipoDocActual);
                      return docActivo ? (
                        <Card className="border border-success/40 bg-success-bg/30 shadow-sm">
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-success-text" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-color-titulos leading-tight">
                                  {docActivo.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                  {docActivo.type} • {docActivo.size} • {docActivo.time}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteDocument(docActivo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ) : null;
                    })()}

                    {/* Observaciones (persistidas por tipo de documento) */}
                    <FormItem>
                      <FormLabel className="font-bold text-color-subtitulos text-sm">
                        Observaciones
                      </FormLabel>
                      <p className="text-xs text-muted-foreground italic mb-2">
                        Comentarios adicionales sobre este documento (opcional)
                      </p>
                      <FormControl>
                        <Textarea
                          value={obsMap[tipoDocActual] ?? ""}
                          onChange={(e) =>
                            setObsMap((prev) => ({ ...prev, [tipoDocActual]: e.target.value }))
                          }
                          placeholder="Ingrese comentarios adicionales sobre este documento..."
                          className="resize-none min-h-[90px] border-border focus-visible:ring-color-boton-2"
                          readOnly={readOnly}
                        />
                      </FormControl>
                    </FormItem>
                  </div>

                  {/* Footer de navegación del panel */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-slate-bg">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-5 text-sm font-semibold rounded-lg border-border text-muted-foreground"
                      disabled={docStepIndex === 0}
                      onClick={() => {
                        setDocStepIndex((i) => Math.max(0, i - 1));
                      }}
                    >
                      ← Anterior doc.
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">
                      {docStepIndex + 1} / {tiposDocumento.length}
                    </span>
                    {docStepIndex < tiposDocumento.length - 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 px-5 text-sm font-semibold rounded-lg border-navy/30 text-navy hover:bg-navy/5"
                        onClick={() => {
                          setDocStepIndex((i) => Math.min(tiposDocumento.length - 1, i + 1));
                        }}
                      >
                        Siguiente doc. →
                      </Button>
                    ) : (
                      <span className="text-[11px] text-success-text font-semibold">
                        Último paso
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controles de avance final del formulario */}
              <div className="flex justify-between pt-8 mt-6 border-t border-border">
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
          )}
        </form>
      </Form>
    </div>
  );
}
