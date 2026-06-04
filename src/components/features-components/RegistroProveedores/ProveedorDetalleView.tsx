"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Edit,
  Phone,
  Mail,
  FileText,
  MapPin,
  Loader2,
  Building2,
  User2,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Briefcase,
  Landmark,
} from "lucide-react";
import { IoPersonSharp } from "react-icons/io5";
import { IoIosBriefcase, IoIosHammer, IoIosPrint } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProveedorById, cambiarEstatusProveedor } from "@/services/proveedores.service";
import {
  TIPO_PERSONA,
  TIPO_PERSONA_LABELS,
  FORMA_JURIDICA_LABELS,
} from "@/lib/proveedores/proveedor.constants";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DocumentoPreviewDialog, type Documento } from "./DocumentoPreviewDialog";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ProviderDetails {
  id: string;
  nombre: string;
  rif: string;
  correo: string;
  tipoPersona: string;
  // Jurídica
  tipoEntidadJuridica?: string;
  datosRegistroMercantil?: string;
  nombreRepLegal?: string;
  cedulaRepLegal?: string;
  registroRnc?: boolean;
  solvenciaLaboral?: boolean;
  licenciaFuncionamientoMunicipal?: boolean;
  fechaEstadoFinanciero?: string;
  patrimonioReportado?: string;
  islrProveedor?: boolean;
  // Natural
  cedulaNaturalProveedor?: string;
  // Órgano / Ente Público
  nombreAutoridadProveedor?: string;
  cedulaAutoridadProveedor?: string;
  datosDesignacionAutoridadProveedor?: string;
  // Comunes
  estado: string;
  municipio: string;
  parroquia: string;
  direccionFiscal: string;
  telefono: string;
  actividadComercial?: string;
  areaEspecialidad: string;
  anosExperiencia?: number;
  nivelContratacion: string;
  estatusValidacion: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "EN_REVISION";
  updatedAt: string;
  createdAt: string;
  documentos: Documento[];
}

// ─── Helper: icono de especialidad ───────────────────────────────────────────

function getSpecialtyIcon(area: string) {
  const a = area?.toUpperCase();
  if (a === "OBRAS") return <IoIosHammer className="w-16 h-16 text-tipo-obras" />;
  if (a === "BIENES") return <IoIosPrint className="w-16 h-16 text-tipo-bienes" />;
  return <IoIosBriefcase className="w-16 h-16 text-tipo-servicios" />;
}

// ─── Helper: ancho de barra de nivel ─────────────────────────────────────────

function getProgressWidth(nivel: string) {
  const n = nivel?.toUpperCase();
  if (n === "ALTA") return "100%";
  if (n === "MEDIA") return "66%";
  if (n === "BAJA") return "33%";
  return "0%";
}

// ─── Helper: badge de validación ─────────────────────────────────────────────

function ValidBadge({ value }: { value?: boolean }) {
  return (
    <Badge
      className={`${
        value
          ? "bg-vigente-bg text-vigente border-vigente-border"
          : "bg-vencido-bg text-vencido border-vencido-border"
      } px-3 min-w-[75px] h-6 flex items-center justify-center border shadow-none text-[11px] font-semibold`}
    >
      {value ? "Vigente" : "Vencido"}
    </Badge>
  );
}

// ─── Sub-componente: campo de información ─────────────────────────────────────

function InfoItem({
  label,
  value,
  colSpan2 = false,
}: {
  label: string;
  value?: string | null;
  colSpan2?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${colSpan2 ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-bold text-navy/70 uppercase tracking-tight ml-1">
        {label}
      </label>
      <div className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/30 flex items-center px-4 text-sm font-medium text-slate-700">
        {value || "No especificado"}
      </div>
    </div>
  );
}

// ─── Sub-componente: validación fila ─────────────────────────────────────────

function ValidationRow({
  label,
  value,
  separator = true,
}: {
  label: string;
  value?: boolean;
  separator?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center pb-2 ${separator ? "border-b border-border" : ""}`}
    >
      <span className="text-sm text-muted-foreground italic">{label}</span>
      <ValidBadge value={value} />
    </div>
  );
}

// ─── Sub-componente: card de documento compacto ───────────────────────────────

function DocumentoCard({
  doc,
  onPreview,
}: {
  doc: Documento;
  onPreview: (doc: Documento) => void;
}) {
  const [obsOpen, setObsOpen] = useState(false);
  const hasObs = Boolean(doc.observaciones?.trim());
  const label = doc.tipoDocumento.replace(/_/g, " ").toLowerCase();

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      {/* Fila principal — compacta */}
      <div className="flex items-center gap-3 px-4 py-2.5 group">
        {/* Icono file */}
        <div
          className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 cursor-pointer group-hover:bg-navy/5 transition-colors"
          onClick={() => onPreview(doc)}
        >
          <FileText className="w-4 h-4 text-slate-400 group-hover:text-navy transition-colors" />
        </div>

        {/* Nombre + fecha */}
        <div
          className="flex flex-col flex-1 overflow-hidden cursor-pointer"
          onClick={() => onPreview(doc)}
        >
          <span className="text-xs font-bold text-navy capitalize truncate">{label}</span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {format(new Date(doc.createdAt), "dd MMM yyyy", { locale: es })}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasObs && (
            <button
              onClick={() => setObsOpen((v) => !v)}
              title="Ver observación"
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                obsOpen ? "bg-navy text-white" : "text-slate-400 hover:bg-navy/10 hover:text-navy"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onPreview(doc)}
            title="Previsualizar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Observación desplegable */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          obsOpen ? "max-h-40" : "max-h-0"
        }`}
      >
        {hasObs && (
          <div className="px-4 pb-3 pt-1 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-navy/60 uppercase tracking-wide mb-1">
              Observación
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{doc.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Vista J: Persona Jurídica ────────────────────────────────────────────────

function SeccionInfoJuridica({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <InfoItem label="Nombre / Razón social" value={provider.nombre} />
      <InfoItem
        label="Tipo de persona"
        value={TIPO_PERSONA_LABELS[provider.tipoPersona] ?? provider.tipoPersona}
      />
      <InfoItem
        label="Forma jurídica"
        value={
          FORMA_JURIDICA_LABELS[provider.tipoEntidadJuridica ?? ""] ?? provider.tipoEntidadJuridica
        }
      />
      <InfoItem
        label="Fecha de constitución"
        value={provider.createdAt ? format(new Date(provider.createdAt), "dd/MM/yyyy") : undefined}
      />
      <InfoItem label="Estado / Municipio" value={`${provider.estado} / ${provider.municipio}`} />
      <InfoItem label="Parroquia" value={provider.parroquia} />
      <InfoItem label="Dirección fiscal" value={provider.direccionFiscal} colSpan2 />
      <InfoItem
        label="Datos del registro mercantil"
        value={provider.datosRegistroMercantil}
        colSpan2
      />
    </div>
  );
}

function SeccionRepresentanteJuridica({ provider }: { provider: ProviderDetails }) {
  const iniciales = provider.nombreRepLegal
    ? provider.nombreRepLegal
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()
    : "RL";

  return (
    <div className="mt-2 flex flex-col gap-4">
      <h3 className="text-base font-bold text-navy flex items-center gap-3">
        <IoPersonSharp className="w-5 h-5 text-navy" />
        Representante legal
      </h3>
      <div className="flex items-center gap-4 w-full md:w-3/4">
        <Avatar className="w-12 h-12 border border-slate-200 shadow-sm">
          <AvatarFallback className="bg-slate-100 text-navy font-bold text-sm">
            {iniciales}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold text-navy text-base">
            {provider.nombreRepLegal || "No especificado"}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {provider.cedulaRepLegal || "Sin cédula"}
          </span>
        </div>
      </div>
    </div>
  );
}

function SeccionCapacidadJuridica({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="flex flex-col gap-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Actividad comercial
          </span>
          <strong className="text-base text-navy mt-1">
            {provider.actividadComercial === "Si" ? "Activo" : "No activo"}
          </strong>
          <span className="text-xs text-muted-foreground italic mt-1">
            Especialidad: {provider.areaEspecialidad}
          </span>
        </div>
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Años de experiencia
          </span>
          <strong className="text-base text-navy mt-1">
            {provider.anosExperiencia ?? "N/A"} años
          </strong>
          <span className="text-xs text-muted-foreground italic mt-1">
            Desde {provider.createdAt ? new Date(provider.createdAt).getFullYear() : "N/A"}
          </span>
        </div>
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Nivel de contratación
          </span>
          <strong className="text-base text-navy mt-1 mb-2">{provider.nivelContratacion}</strong>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-navy h-full transition-all duration-500 rounded-full"
              style={{ width: getProgressWidth(provider.nivelContratacion) }}
            />
          </div>
        </div>
      </div>

      {/* Financiero + validaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        <div className="space-y-4">
          <h3 className="font-bold text-navy">Resumen financiero</h3>
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground italic">
              Estado financiero válido hasta
            </span>
            <span className="text-sm font-bold text-navy">
              {provider.fechaEstadoFinanciero
                ? format(new Date(provider.fechaEstadoFinanciero), "dd/MM/yyyy")
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2">
            <span className="text-sm text-muted-foreground italic">Patrimonio neto</span>
            <span className="text-sm font-bold text-patrimonio">
              {provider.patrimonioReportado
                ? Number(provider.patrimonioReportado).toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })
                : "0,00"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-navy">Validaciones del sistema</h3>
          <ValidationRow label="Registro RNC" value={provider.registroRnc} />
          <ValidationRow label="Solvencia laboral" value={provider.solvenciaLaboral} />
          <ValidationRow
            label="Licencia municipal"
            value={provider.licenciaFuncionamientoMunicipal}
          />
          <ValidationRow label="ISLR" value={provider.islrProveedor} separator={false} />
        </div>
      </div>
    </div>
  );
}

// ─── Vista V: Persona Natural ─────────────────────────────────────────────────

function SeccionInfoNatural({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <InfoItem label="Nombre completo" value={provider.nombre} />
      <InfoItem
        label="Tipo de persona"
        value={TIPO_PERSONA_LABELS[provider.tipoPersona] ?? provider.tipoPersona}
      />
      <InfoItem label="Cédula de identidad" value={provider.cedulaNaturalProveedor} />
      <InfoItem
        label="Fecha de registro"
        value={provider.createdAt ? format(new Date(provider.createdAt), "dd/MM/yyyy") : undefined}
      />
      <InfoItem label="Estado / Municipio" value={`${provider.estado} / ${provider.municipio}`} />
      <InfoItem label="Parroquia" value={provider.parroquia} />
      <InfoItem label="Dirección fiscal" value={provider.direccionFiscal} colSpan2 />
    </div>
  );
}

function SeccionCapacidadNatural({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="flex flex-col gap-8">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Actividad comercial
          </span>
          <strong className="text-base text-navy mt-1">
            {provider.actividadComercial === "Si" ? "Activo" : "No activo"}
          </strong>
          <span className="text-xs text-muted-foreground italic mt-1">
            Especialidad: {provider.areaEspecialidad}
          </span>
        </div>
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Años de experiencia
          </span>
          <strong className="text-base text-navy mt-1">
            {provider.anosExperiencia ?? "N/A"} años
          </strong>
        </div>
        <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Nivel de contratación
          </span>
          <strong className="text-base text-navy mt-1 mb-2">{provider.nivelContratacion}</strong>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-navy h-full transition-all duration-500 rounded-full"
              style={{ width: getProgressWidth(provider.nivelContratacion) }}
            />
          </div>
        </div>
      </div>

      {/* Validaciones */}
      <div className="max-w-sm space-y-4">
        <h3 className="font-bold text-navy">Validaciones del sistema</h3>
        <ValidationRow label="Registro RNC" value={provider.registroRnc} />
        <ValidationRow label="ISLR" value={provider.islrProveedor} separator={false} />
      </div>
    </div>
  );
}

// ─── Vista G: Órgano/Ente Público ─────────────────────────────────────────────

function SeccionInfoOrgano({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <InfoItem label="Nombre del organismo" value={provider.nombre} />
      <InfoItem
        label="Tipo de persona"
        value={TIPO_PERSONA_LABELS[provider.tipoPersona] ?? provider.tipoPersona}
      />
      <InfoItem label="Estado / Municipio" value={`${provider.estado} / ${provider.municipio}`} />
      <InfoItem label="Parroquia" value={provider.parroquia} />
      <InfoItem label="Dirección fiscal" value={provider.direccionFiscal} colSpan2 />
    </div>
  );
}

function SeccionAutoridadOrgano({ provider }: { provider: ProviderDetails }) {
  const iniciales = provider.nombreAutoridadProveedor
    ? provider.nombreAutoridadProveedor
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 3)
        .toUpperCase()
    : "MA";

  return (
    <div className="mt-2 flex flex-col gap-4">
      <h3 className="text-base font-bold text-navy flex items-center gap-3">
        <Landmark className="w-5 h-5 text-navy" />
        Máxima autoridad
      </h3>
      <div className="flex items-center gap-4 w-full md:w-3/4">
        <Avatar className="w-12 h-12 border border-slate-200 shadow-sm">
          <AvatarFallback className="bg-slate-100 text-navy font-bold text-sm">
            {iniciales}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold text-navy text-base">
            {provider.nombreAutoridadProveedor || "No especificado"}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {provider.cedulaAutoridadProveedor || "Sin cédula"}
          </span>
        </div>
      </div>
      {provider.datosDesignacionAutoridadProveedor && (
        <div className="w-full md:w-3/4">
          <InfoItem
            label="Datos de designación"
            value={provider.datosDesignacionAutoridadProveedor}
          />
        </div>
      )}
    </div>
  );
}

function SeccionCapacidadOrgano({ provider }: { provider: ProviderDetails }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          Área de especialidad
        </span>
        <strong className="text-base text-navy mt-1">{provider.areaEspecialidad}</strong>
      </div>
      <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          Nivel de contratación
        </span>
        <strong className="text-base text-navy mt-1 mb-2">{provider.nivelContratacion}</strong>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-navy h-full transition-all duration-500 rounded-full"
            style={{ width: getProgressWidth(provider.nivelContratacion) }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProveedorDetalleView({ id, readOnly = false }: { id: string; readOnly?: boolean }) {
  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getProveedorById(id);
        setProvider(data);
      } catch (error) {
        toast.error("Error al cargar los detalles del proveedor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  const handleToggleStatus = async (checked: boolean) => {
    if (readOnly || !provider) return;
    setUpdatingEstatus(true);
    const newStatus = checked ? "APROBADO" : "RECHAZADO";
    try {
      await cambiarEstatusProveedor(provider.id, newStatus);
      setProvider({
        ...provider,
        estatusValidacion: newStatus,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Proveedor ${checked ? "aprobado" : "rechazado"} exitosamente`);
    } catch {
      toast.error("Error al actualizar el estatus");
    } finally {
      setUpdatingEstatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-navy animate-spin" />
        <p className="text-slate-500 font-medium italic">Cargando detalles del proveedor...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FileText className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500 font-medium">No se encontró la información del proveedor.</p>
      </div>
    );
  }

  const isJuridica = provider.tipoPersona === TIPO_PERSONA.JURIDICA;
  const isNatural = provider.tipoPersona === TIPO_PERSONA.NATURAL;
  const isOrgano =
    provider.tipoPersona === TIPO_PERSONA.ORGANO_ENTE_PUBLICO ||
    provider.tipoPersona === "ADMINISTRACION_PUBLICA";

  // Ícono del tipo de persona para el header
  const tipoIcon = isJuridica ? (
    <Building2 className="w-5 h-5 text-navy/60" />
  ) : isNatural ? (
    <User2 className="w-5 h-5 text-navy/60" />
  ) : (
    <Landmark className="w-5 h-5 text-navy/60" />
  );

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* ── HEADER CARD ─────────────────────────────────────────────── */}
      <Card className="p-6 rounded-xl border border-border bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">{getSpecialtyIcon(provider.areaEspecialidad)}</div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-navy">{provider.nombre}</h1>
              <Badge
                variant="outline"
                className={`font-bold px-3 py-1 rounded-full border ${
                  provider.estatusValidacion === "APROBADO"
                    ? "bg-success-bg text-success-text border-success/30"
                    : provider.estatusValidacion === "PENDIENTE"
                      ? "bg-pendiente-bg text-pendiente border-pendiente-border"
                      : "bg-rechazado-bg text-rechazado border-rechazado-border"
                }`}
              >
                {provider.estatusValidacion === "APROBADO"
                  ? "Activo"
                  : provider.estatusValidacion === "PENDIENTE"
                    ? "Por aprobar"
                    : "Vencido"}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-muted-foreground italic mb-1">
              {provider.rif}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-navy" />
                {provider.telefono || "Sin teléfono"}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-navy" />
                {provider.correo || "Sin correo"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-navy" />
                {provider.estado}, {provider.municipio}
              </span>
              <span className="flex items-center gap-1.5">
                {tipoIcon}
                {TIPO_PERSONA_LABELS[provider.tipoPersona] ?? provider.tipoPersona}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="border-navy text-navy hover:bg-slate-50 h-11 px-6 font-semibold w-full md:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          {!readOnly && (
            <Link href={`/registro-proveedores/editar/${provider.id}`} className="w-full md:w-auto">
              <Button className="bg-navy hover:bg-navy-hover text-white h-11 px-6 font-semibold w-full">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Columna principal */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* ── INFORMACIÓN GENERAL ──────────────────────────────── */}
          <Card className="flex flex-col p-6 md:p-8 rounded-xl bg-white shadow-sm border border-border gap-2">
            <div className="border-b-[2px] border-navy/20 pb-3 mb-6 -mx-6 md:-mx-8 px-6 md:px-8">
              <h2 className="text-lg font-bold text-navy">Información general</h2>
            </div>

            <h3 className="text-xl font-extrabold text-navy mb-6">
              {isJuridica
                ? "Datos de la empresa"
                : isNatural
                  ? "Datos del proveedor"
                  : "Datos del organismo"}
            </h3>

            {isJuridica && <SeccionInfoJuridica provider={provider} />}
            {isNatural && <SeccionInfoNatural provider={provider} />}
            {isOrgano && <SeccionInfoOrgano provider={provider} />}

            {/* Representante / Máxima autoridad (J y G solamente) */}
            {(isJuridica || isOrgano) && (
              <>
                <div className="border-b-[2px] border-navy/20 pb-3 mb-6 mt-8 -mx-6 md:-mx-8 px-6 md:px-8">
                  <h2 className="text-lg font-bold text-navy">
                    {isJuridica ? "Representante" : "Máxima autoridad"}
                  </h2>
                </div>
                {isJuridica && <SeccionRepresentanteJuridica provider={provider} />}
                {isOrgano && <SeccionAutoridadOrgano provider={provider} />}
              </>
            )}
          </Card>

          {/* ── CAPACIDAD TÉCNICA ─────────────────────────────────── */}
          <Card className="flex flex-col p-6 md:p-8 rounded-xl bg-white shadow-sm border border-border gap-2">
            <div className="border-b-[2px] border-navy/20 pb-3 mb-6 -mx-6 md:-mx-8 px-6 md:px-8">
              <h2 className="text-lg font-bold text-navy">Capacidad</h2>
            </div>

            <h3 className="text-xl font-extrabold text-navy mb-6">
              Capacidad técnica{isJuridica ? " y financiera" : ""}
            </h3>

            {isJuridica && <SeccionCapacidadJuridica provider={provider} />}
            {isNatural && <SeccionCapacidadNatural provider={provider} />}
            {isOrgano && <SeccionCapacidadOrgano provider={provider} />}
          </Card>
        </div>

        {/* ── COLUMNA DERECHA ──────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4 w-full">
          {/* Estatus */}
          <h2 className="text-lg font-extrabold text-navy">Proveedor verificado</h2>
          <Card className="p-5 rounded-xl border-border shadow-sm flex flex-col bg-white">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-navy flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Proveedor verificado
                </span>
                <span className="text-xs text-muted-foreground italic">
                  {provider.estatusValidacion === "APROBADO"
                    ? "Habilitado para contrataciones"
                    : "Pendiente de validación"}
                </span>
              </div>
              <Switch
                checked={provider.estatusValidacion === "APROBADO"}
                onCheckedChange={handleToggleStatus}
                disabled={updatingEstatus || readOnly}
                className="data-[state=checked]:bg-success"
              />
            </div>
            {provider.updatedAt && (
              <div className="text-[11px] text-muted-foreground italic pt-4 border-t border-slate-100 text-center">
                Última actualización{" "}
                {format(new Date(provider.updatedAt), "dd/MM/yyyy", { locale: es })}
              </div>
            )}
          </Card>

          {/* Documentos */}
          <h2 className="text-lg font-extrabold text-navy">Documentación</h2>
          <div className="flex flex-col gap-2">
            {provider.documentos && provider.documentos.length > 0 ? (
              provider.documentos.map((doc) => (
                <DocumentoCard
                  key={doc.id}
                  doc={doc}
                  onPreview={(d) => {
                    setSelectedDocument(d);
                    setIsPreviewOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="text-center p-6 border border-dashed rounded-xl border-slate-200">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <span className="text-xs text-slate-400 italic">No hay documentos registrados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentoPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        documento={selectedDocument}
        proveedorId={id}
      />
    </div>
  );
}
