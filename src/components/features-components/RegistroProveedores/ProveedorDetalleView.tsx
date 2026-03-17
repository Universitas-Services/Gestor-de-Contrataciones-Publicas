"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Edit,
  ImageIcon,
  Phone,
  Mail,
  FileText,
  MapPin,
  Building2,
  User2,
  Loader2,
  Calendar,
  Globe,
  Briefcase,
  FileSearch,
} from "lucide-react";
import { IoPersonSharp } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getProveedorById, cambiarEstatusProveedor } from "@/services/proveedores.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Documento {
  id: string;
  proveedorId: string;
  tipoDocumento: string;
  urlArchivo: string;
  observaciones?: string;
  fechaCarga: string;
  createdAt: string;
}

interface ProviderDetails {
  id: string;
  nombre: string;
  rif: string;
  correo: string;
  tipoPersona: string;
  tipoEntidadJuridica: string;
  estado: string;
  municipio: string;
  parroquia: string;
  direccionFiscal: string;
  telefono: string;
  nombreRepLegal: string;
  cedulaRepLegal: string;
  registroRnc: boolean;
  solvenciaLaboral: boolean;
  licenciaFuncionamientoMunicipal: boolean;
  actividadComercial: string;
  areaEspecialidad: string;
  anosExperiencia: number;
  fechaEstadoFinanciero: string;
  patrimonioReportado: string;
  nivelContratacion: string;
  estatusValidacion: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "EN_REVISION";
  updatedAt: string;
  createdAt: string;
  documentos: Documento[];
}

export function ProveedorDetalleView({ id }: { id: string }) {
  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEstatus, setUpdatingEstatus] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getProveedorById(id);
        // El API retorna { data: ProviderDetails } o directamente el objeto dependiendo de la implementación interna
        // Según el response body enviado por el usuario, parece que getProveedorById(id)
        // debería retornar el objeto individual si es por ID, pero el ejemplo muestra un array "data".
        // Asumiremos que el service ya maneja la extracción o que la respuesta individual es el objeto.
        setProvider(data);
      } catch (error) {
        toast.error("Error al cargar los detalles del proveedor");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  const handleToggleStatus = async (checked: boolean) => {
    if (!provider) return;
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
    } catch (error) {
      toast.error("Error al actualizar el estatus");
    } finally {
      setUpdatingEstatus(false);
    }
  };

  const getProgressWidth = (nivel: string) => {
    const n = nivel?.toUpperCase();
    if (n === "ALTA") return "100%";
    if (n === "MEDIA") return "66%";
    if (n === "BAJA") return "33%";
    return "0%";
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

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* HEADER BLOCK */}
      <Card className="p-6 rounded-xl border border-border bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
            <Building2 className="w-12 h-12 text-navy/40" />
          </div>

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
                <Phone className="w-3.5 h-3.5 text-navy" /> {provider.telefono || "Sin teléfono"}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-navy" /> {provider.correo || "Sin correo"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-navy" /> {provider.estado}, {provider.municipio}
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
          <Button className="bg-navy hover:bg-navy-hover text-white h-11 px-6 font-semibold w-full md:w-auto">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </Card>

      {/* BODY (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="flex flex-col p-6 md:p-8 rounded-xl bg-white shadow-sm border border-border gap-2">
            <div className="border-b-[2px] border-navy/20 pb-3 mb-6 -mx-6 md:-mx-8 px-6 md:px-8">
              <h2 className="text-lg font-bold text-navy">Información general</h2>
            </div>

            <div className="flex flex-col">
              <h3 className="text-xl font-extrabold text-navy mb-6">Datos de la empresa</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoItem label="Nombre legal" value={provider.nombre} />
                <InfoItem label="Tipo de persona" value={provider.tipoPersona} />
                <InfoItem label="Forma jurídica" value={provider.tipoEntidadJuridica} />
                <InfoItem
                  label="Fecha de fundación"
                  value={
                    provider.createdAt ? format(new Date(provider.createdAt), "dd/MM/yyyy") : "N/A"
                  }
                />
                <InfoItem
                  label="Estado/municipio"
                  value={`${provider.estado} / ${provider.municipio}`}
                />
                <InfoItem label="Parroquia" value={provider.parroquia} />
                <div className="md:col-span-2">
                  <InfoItem label="Dirección fiscal" value={provider.direccionFiscal} fullWidth />
                </div>
              </div>

              <div className="border-b-[2px] border-navy/20 pb-3 mb-6 mt-8 -mx-6 md:-mx-8 px-6 md:px-8">
                <h2 className="text-lg font-bold text-navy">Representante</h2>
              </div>

              <div className="mt-2 flex flex-col gap-4">
                <h3 className="text-base font-bold text-navy flex items-center gap-3">
                  <IoPersonSharp className="w-5 h-5 text-navy" />
                  Representante legal
                </h3>

                <div className="flex items-center gap-4 bg-transparent p-0 w-full md:w-3/4">
                  <Avatar className="w-12 h-12 border border-slate-200 shadow-sm">
                    <AvatarFallback className="bg-slate-100 text-navy font-bold text-sm">
                      {provider.nombreRepLegal
                        ? provider.nombreRepLegal
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 3)
                            .toUpperCase()
                        : "REP"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-navy text-base">{provider.nombreRepLegal}</span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {provider.cedulaRepLegal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col p-6 md:p-8 rounded-xl bg-white shadow-sm border border-border gap-2">
            <div className="border-b-[2px] border-navy/20 pb-3 mb-6 -mx-6 md:-mx-8 px-6 md:px-8">
              <h2 className="text-lg font-bold text-navy">Capacidad</h2>
            </div>

            <div className="flex flex-col">
              <h3 className="text-xl font-extrabold text-navy mb-6">
                Capacidad técnica y financiera
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    Actividad comercial
                  </span>
                  <strong className="text-base text-navy mt-1">
                    {provider.actividadComercial === "Si" ? "Activo" : "No"}
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
                    {provider.anosExperiencia} años
                  </strong>
                  <span className="text-xs text-muted-foreground italic mt-1">
                    Fundada en{" "}
                    {provider.createdAt ? new Date(provider.createdAt).getFullYear() : "N/A"}
                  </span>
                </div>
                <div className="border border-border rounded-xl p-4 flex flex-col justify-center bg-white">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    Nivel de contratación
                  </span>
                  <strong className="text-base text-navy mt-1 mb-2">
                    {provider.nivelContratacion}
                  </strong>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-navy h-full transition-all duration-500 rounded-full"
                      style={{ width: getProgressWidth(provider.nivelContratacion) }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <h3 className="font-bold text-navy mb-4">Resumen Financiero</h3>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground italic">
                      Habilitado para contrataciones
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

                <div className="space-y-6">
                  <h3 className="font-bold text-navy mb-4">Validaciones del sistema</h3>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground italic">Registro RNC</span>
                    <Badge
                      className={`${provider.registroRnc ? "bg-vigente-bg text-vigente border-vigente-border" : "bg-vencido-bg text-vencido border-vencido-border"} px-3 min-w-[75px] h-6 flex items-center justify-center border shadow-none leading-none pt-[1px]`}
                    >
                      {provider.registroRnc ? "vigente" : "vencido"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-sm text-muted-foreground italic">Solvencia laboral</span>
                    <Badge
                      className={`${provider.solvenciaLaboral ? "bg-vigente-bg text-vigente border-vigente-border" : "bg-vencido-bg text-vencido border-vencido-border"} px-3 h-6 flex items-center justify-center border shadow-none pb-0.5`}
                    >
                      {provider.solvenciaLaboral ? "vigente" : "vencido"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm text-muted-foreground italic">Licencia municipal</span>
                    <Badge
                      className={`${provider.licenciaFuncionamientoMunicipal ? "bg-vigente-bg text-vigente border-vigente-border" : "bg-vencido-bg text-vencido border-vencido-border"} px-3 h-6 flex items-center justify-center border shadow-none pb-0.5`}
                    >
                      {provider.licenciaFuncionamientoMunicipal ? "vigente" : "vencido"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* LADO DERECHO */}
        <div className="lg:col-span-1 flex flex-col gap-6 w-full">
          <h2 className="text-lg font-extrabold text-navy">Proveedor verificado</h2>
          <Card className="p-5 rounded-xl border-border shadow-sm flex flex-col bg-white">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-navy">Proveedor verificado</span>
                <span className="text-xs text-muted-foreground italic">
                  {provider.estatusValidacion === "APROBADO"
                    ? "Habilitado para contrataciones"
                    : "Pendiente de validación"}
                </span>
              </div>
              <Switch
                checked={provider.estatusValidacion === "APROBADO"}
                onCheckedChange={handleToggleStatus}
                disabled={updatingEstatus}
                className="data-[state=checked]:bg-success"
              />
            </div>
            {provider.updatedAt && (
              <div className="text-[11px] text-muted-foreground italic pt-4 border-t border-slate-100 text-center">
                Aprobación de proveedor en fecha{" "}
                {format(new Date(provider.updatedAt), "dd/MM/yyyy", { locale: es })}
              </div>
            )}
          </Card>

          <h2 className="text-lg font-extrabold text-navy mt-2">Documentación para validación</h2>
          <div className="flex flex-col gap-3">
            {provider.documentos && provider.documentos.length > 0 ? (
              provider.documentos.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-3.5 rounded-xl border-border shadow-sm flex items-center gap-3 hover:border-navy transition-colors cursor-pointer group bg-white"
                  onClick={() => window.open(doc.urlArchivo, "_blank")}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-navy/5 transition-colors">
                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-navy" />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-xs font-bold text-navy truncate">
                      {doc.tipoDocumento}.pdf
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {doc.tipoDocumento.replace(/_/g, " ")} •{" "}
                      {format(new Date(doc.createdAt), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center p-6 border border-dashed rounded-xl border-slate-200">
                <span className="text-xs text-slate-400 italic">No hay documentos registrados</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-extrabold text-navy mt-2">Ubicación</h2>
          <Card className="p-5 rounded-xl border-border shadow-sm bg-white">
            <div className="w-full h-32 bg-slate-50 rounded-lg flex items-center justify-center mb-4 text-slate-300 border border-slate-100">
              <MapPin className="w-8 h-8 opacity-40" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-navy text-sm">
                {provider.municipio}, {provider.estado}
              </span>
              <span className="text-xs text-muted-foreground italic">
                {provider.parroquia} • Venezuela
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-navy/70 uppercase tracking-tight ml-1">
        {label}
      </label>
      <div
        className={`h-11 w-full rounded-lg border border-slate-200 bg-slate-50/30 flex items-center px-4 text-sm font-medium text-slate-700`}
      >
        {value || "No especificado"}
      </div>
    </div>
  );
}
