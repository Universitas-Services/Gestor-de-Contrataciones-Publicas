"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { BsEye } from "react-icons/bs";
import {
  IoDownloadOutline,
  IoNewspaperOutline,
  IoServer,
  IoDiamondOutline,
  IoDocumentTextOutline,
  IoReceiptOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { FaRegTrashAlt, FaRegClipboard } from "react-icons/fa";
import { BsArrowClockwise } from "react-icons/bs";
import { IoMdWarning } from "react-icons/io";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { type Adquirente, type Oferente } from "@/types/expediente.types";
import {
  registrarAdquirente,
  listarAdquirentes,
  obtenerAdquirente,
  editarAdquirente,
  eliminarAdquirente,
} from "@/services/adquirenteService";
import {
  registrarOferente,
  listarOferentes,
  obtenerOferente,
  editarOferente,
  eliminarOferente,
  iniciarEvaluacionFase3,
} from "@/services/oferenteService";
import { registrarProveedorRapido } from "@/services/proveedores.service";
import {
  obtenerStatusDocumentos,
  generarDocumento,
  regenerarDocumento,
  previewDocumento,
  descargarDocumento,
  type DocumentoStatus,
} from "@/services/generadorDocumentosService";
import type { AdquirenteFormValues, OferenteFormValues } from "@/lib/schemas/fase2Schema";
import { AdquirenteSheet } from "./AdquirenteSheet";
import { OferenteSheet } from "./OferenteSheet";
import { ConfirmarEliminacionDialog } from "./ConfirmarEliminacionDialog";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Documentos del Procedimiento (Fase 2) ──────────────────────────

/** Tipos de documento que interesan en la Fase 2 */
const FASE2_DOC_TYPES = ["REGISTRO_ADQUIRENTES", "ACTA_RECEPCION", "ACTA_APERTURA"];

/** Mapeo de tipo de documento → segmento del endpoint de generación */
const TIPO_TO_ENDPOINT: Record<string, string> = {
  REGISTRO_ADQUIRENTES: "registro-adquirentes",
  ACTA_RECEPCION: "acta-recepcion-sobres",
  ACTA_APERTURA: "acta-apertura-sobres",
};

/** Icono izquierdo por tipo de documento */
const TIPO_TO_ICON: Record<string, "receipt" | "clipboard"> = {
  REGISTRO_ADQUIRENTES: "receipt",
  ACTA_RECEPCION: "clipboard",
  ACTA_APERTURA: "receipt",
};

// ─── Sub-componente: Botón Generar con validación ───────────────────

interface GenerarDocBtnProps {
  tipo: string;
  adquirentesCount: number;
  oferentesCount: number;
  onGenerar: (tipo: string) => void;
}

function GenerarDocBtn({ tipo, adquirentesCount, oferentesCount, onGenerar }: GenerarDocBtnProps) {
  const requiereAdquirentes = tipo === "REGISTRO_ADQUIRENTES";
  const requiereOferentes = tipo === "ACTA_RECEPCION" || tipo === "ACTA_APERTURA";
  const puedeGenerar =
    (requiereAdquirentes && adquirentesCount > 0) || (requiereOferentes && oferentesCount > 0);

  const mensajeDisabled = requiereAdquirentes
    ? "Registre al menos un adquirente para generar este documento"
    : "Registre al menos un oferente para generar este documento";

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <button
              className={`transition-colors ${
                puedeGenerar
                  ? "text-[#334155] hover:text-navy"
                  : "text-[#334155] opacity-30 cursor-not-allowed"
              }`}
              disabled={!puedeGenerar}
              onClick={() => onGenerar(tipo)}
            >
              <IoNewspaperOutline className="w-[24px] h-[24px]" />
            </button>
          </span>
        </TooltipTrigger>
        {!puedeGenerar && (
          <TooltipContent side="top" className="max-w-[220px] text-center text-xs">
            {mensajeDisabled}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Componente Principal ───────────────────────────────────────────

interface Fase2PanelProps {
  expedienteId: string;
}

export function Fase2Panel({ expedienteId }: Fase2PanelProps) {
  // ── Estado de Adquirentes ──
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([]);
  const [adquirenteSheetOpen, setAdquirenteSheetOpen] = useState(false);
  const [adquirenteEditando, setAdquirenteEditando] = useState<Adquirente | null>(null);
  const [deleteAdquirenteOpen, setDeleteAdquirenteOpen] = useState(false);
  const [adquirenteToDelete, setAdquirenteToDelete] = useState<string | null>(null);
  const [loadingAdquirentes, setLoadingAdquirentes] = useState(false);

  // ── Estado de Oferentes ──
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [oferenteSheetOpen, setOferenteSheetOpen] = useState(false);
  const [oferenteEditando, setOferenteEditando] = useState<Oferente | null>(null);
  const [deleteOferenteOpen, setDeleteOferenteOpen] = useState(false);
  const [oferenteToDelete, setOferenteToDelete] = useState<string | null>(null);
  const [loadingOferentes, setLoadingOferentes] = useState(false);

  // ── Modal de proveedor guardado rápidamente ──
  const [showProviderWarning, setShowProviderWarning] = useState(false);
  const [registroRapidoRif, setRegistroRapidoRif] = useState("");

  // ── Modal de visualización DOCX ──
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [procesandoDoc, setProcesandoDoc] = useState<Record<string, boolean>>({});

  // ── Estado de Documentos (dinámico desde backend) ──
  const [documentos, setDocumentos] = useState<DocumentoStatus[]>([]);

  // ── Funciones de carga ──
  const loadOferentes = async () => {
    if (!expedienteId) return;
    setLoadingOferentes(true);
    try {
      const data = await listarOferentes(expedienteId);
      const mapped: Oferente[] = data.map((item: any) => ({
        id: item.id,
        nombreEmpresa: item.nombreProveedorOferente,
        rif: item.rifProveedorOferente,
        representanteLegal: item.nombreRepLegalOferente,
        cedula: item.cedulaRepLegalOferente,
        registroMercantil: item.datosRegistroMercantilProveedorOferente || "—",
        cantidadSobres: item.numeroSobresEntregados ? String(item.numeroSobresEntregados) : "0",
        montoOferta: item.montoOfertaBs
          ? new Intl.NumberFormat("es-VE", { style: "currency", currency: "VES" }).format(
              item.montoOfertaBs
            )
          : "—",
      }));
      setOferentes(mapped);
    } catch (error) {
      console.error("Error al cargar oferentes:", error);
      toast.error("No se pudo cargar la lista de oferentes");
    } finally {
      setLoadingOferentes(false);
    }
  };

  const loadAdquirentes = async () => {
    if (!expedienteId) return;
    setLoadingAdquirentes(true);
    try {
      const data = await listarAdquirentes(expedienteId);
      const mapped: Adquirente[] = data.map((item: any) => ({
        id: item.id,
        fecha: item.fechaAdquisicion,
        empresa: item.nombreProveedorAdquiriente,
        domicilioFiscal: item.direccionFiscalProveedorAdquiriente,
        telefono: item.telefonoProveedorAdquiriente,
        correo: item.correoProveedorAdquiriente,
        deposito: item.datosPagoPliego || "—",
      }));
      setAdquirentes(mapped);
    } catch (error) {
      console.error("Error al cargar adquirentes:", error);
      toast.error("No se pudo cargar la lista de adquirentes");
    } finally {
      setLoadingAdquirentes(false);
    }
  };

  // ── Carga de estado de documentos ──
  const loadDocumentos = async () => {
    if (!expedienteId) return;
    try {
      const allDocs = await obtenerStatusDocumentos(expedienteId);
      // Filtrar solo los 3 documentos de Fase 2
      const fase2Docs = allDocs.filter((d) => FASE2_DOC_TYPES.includes(d.tipo));
      setDocumentos(fase2Docs);
    } catch (error) {
      console.error("Error al cargar estado de documentos:", error);
    }
  };

  // ── Efecto: Cargar datos dinámicos ──
  useEffect(() => {
    loadOferentes();
    loadAdquirentes();
    loadDocumentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId]);

  // ── Helpers de formato ──
  function formatDate(iso: string): string {
    if (!iso) return "—";
    const d = new Date(`${iso.split("T")[0]}T12:00:00`);
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // ── Handlers de Adquirentes ──
  const handleAddAdquirente = async (data: AdquirenteFormValues) => {
    try {
      const payload = {
        expedienteId,
        fechaAdquisicion: data.fechaAdquisicion.split("T")[0],
        nombreProveedorAdquiriente: data.nombreEmpresa,
        direccionFiscalProveedorAdquirente: data.domicilioFiscal,
        telefonoProveedorAdquirente: data.telefono,
        correoProveedorAdquirente: data.correo,
        datosPagoPliego: data.referenciaDeposito || "—",
      };

      if (adquirenteEditando) {
        await editarAdquirente(adquirenteEditando.id, {
          ...payload,
          proveedorId: null,
        });
        toast.success("Adquirente actualizado exitosamente");
      } else {
        await registrarAdquirente(payload);
        toast.success("Adquirente registrado exitosamente");
      }

      loadAdquirentes();
      loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar adquirente");
    }
  };

  const handleDeleteAdquirente = async () => {
    if (adquirenteToDelete) {
      try {
        await eliminarAdquirente(adquirenteToDelete);
        toast.success("Adquirente eliminado");
        setAdquirenteToDelete(null);
        setDeleteAdquirenteOpen(false);
        loadAdquirentes();
        loadDocumentos();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar adquirente");
      }
    }
  };

  // ── Handlers de Oferentes ──
  const handleAddOferente = async (data: OferenteFormValues, isNewProvider: boolean) => {
    try {
      const sobresNum = parseInt(data.cantidadSobres, 10) || 0;
      const montoNum = parseFloat(data.montoOferta.replace(/\./g, "").replace(",", ".")) || 0;

      const payload = {
        expedienteId,
        rifProveedorOferente: data.rif,
        nombreProveedorOferente: data.nombreEmpresa,
        nombreRepLegalOferente: data.representanteLegal,
        cedulaRepLegalOferente: data.cedulaRepresentante,
        datosRegistroMercantilProveedorOferente: data.registroMercantil || "—",
        numeroSobresEntregados: sobresNum,
        montoOfertaBs: montoNum,
      };

      if (oferenteEditando) {
        await editarOferente(oferenteEditando.id, {
          ...payload,
          proveedorId: null,
        });
        toast.success("Oferente actualizado exitosamente");
      } else {
        // Lógica de registro rápido de proveedor
        if (isNewProvider) {
          try {
            await registrarProveedorRapido({
              rif: data.rif,
              nombre: data.nombreEmpresa,
              nombreRepLegal: data.representanteLegal,
              cedulaRepLegal: data.cedulaRepresentante,
              datosRegistroMercantil: data.registroMercantil || "—",
            });
            // Mostrar modal de advertencia al final
            setRegistroRapidoRif(data.rif);
            setShowProviderWarning(true);
          } catch (rapidoErr: any) {
            // Si el proveedor ya existía pero el usuario no lo clickeó (por error 409 etc),
            // podemos continuar el registro de oferente con tranquilidad.
            console.warn("Aviso al registrar proveedor rápido:", rapidoErr);
          }
        }

        const ofertaRegistrada = await registrarOferente(payload);

        // Iniciar la evaluación de Fase 3 automáticamente
        if (ofertaRegistrada?.id) {
          await iniciarEvaluacionFase3({ ofertaId: ofertaRegistrada.id });
        }

        toast.success("Oferente registrado e inicializado exitosamente");
      }

      loadOferentes();
      loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar oferente");
    }
  };

  const handleDeleteOferente = async () => {
    if (oferenteToDelete) {
      try {
        await eliminarOferente(oferenteToDelete);
        toast.success("Oferente eliminado");
        setOferenteToDelete(null);
        setDeleteOferenteOpen(false);
        loadOferentes();
        loadDocumentos();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar oferente");
      }
    }
  };

  // ── Handlers de Documentos ──
  const handleGenerarDocumento = async (tipo: string) => {
    const endpoint = TIPO_TO_ENDPOINT[tipo];
    if (!endpoint || !expedienteId) return;

    setProcesandoDoc((prev) => ({ ...prev, [tipo]: true }));
    try {
      await generarDocumento(endpoint, expedienteId);
      toast.success("Documento generado exitosamente");
      await loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar documento");
    } finally {
      setProcesandoDoc((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const handleRegenerarDocumento = async (doc: DocumentoStatus) => {
    if (!doc.documento?.id) return;
    setProcesandoDoc((prev) => ({ ...prev, [doc.tipo]: true }));
    try {
      await regenerarDocumento(doc.documento.id);
      toast.success("Documento regenerado exitosamente");
      await loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al regenerar documento");
    } finally {
      setProcesandoDoc((prev) => ({ ...prev, [doc.tipo]: false }));
    }
  };

  const handlePreviewDocumento = async (doc: DocumentoStatus) => {
    const endpoint = TIPO_TO_ENDPOINT[doc.tipo];
    if (!endpoint || !expedienteId) return;

    // Clonar exactamente el patrón de ManualButtons.handlePreview
    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewDocumento(endpoint, expedienteId);
      setPreviewDocUrl(result.urlArchivo);
      setPreviewDocTitle(result.tituloDocumento || doc.label);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualización";
      toast.error(message);
      setPreviewDocOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadDocumento = async (doc: DocumentoStatus) => {
    const endpoint = TIPO_TO_ENDPOINT[doc.tipo];
    if (!endpoint || !expedienteId) return;

    setIsDownloading((prev) => ({ ...prev, [doc.tipo]: true }));
    try {
      const { data, fileName } = await descargarDocumento(endpoint, expedienteId);

      // Crear Blob a partir del Uint8Array recibido del servidor (patrón manualService)
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Disparar la descarga programáticamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Documento descargado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar documento");
    } finally {
      setIsDownloading((prev) => ({ ...prev, [doc.tipo]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Sección Superior: Adquirentes + Documentos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabla de Adquirentes (2/3) */}
        <Card className="col-span-1 lg:col-span-2 border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
          <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between border-b border-border bg-slate-50 m-0">
            <div className="flex items-center gap-3">
              <IoServer className="w-6 h-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Registro de Adquirentes
              </CardTitle>
            </div>
            <Button
              onClick={() => {
                setAdquirenteEditando(null);
                setAdquirenteSheetOpen(true);
              }}
              variant="ghost"
              className="text-navy hover:text-navy-hover hover:bg-slate-100 font-bold text-[13px] p-0"
            >
              + Añadir Adquirentes
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[15%]">
                    Fecha
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[45%]">
                    Empresa
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[25%]">
                    Deposito
                  </TableHead>
                  <TableHead className="text-color-titulos font-bold text-center h-12 text-[15px] w-[15%]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAdquirentes ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        <p>Cargando adquirentes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : adquirentes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground italic py-12"
                    >
                      No hay adquirentes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  adquirentes.map((adq) => (
                    <TableRow key={adq.id} className="border-b border-border hover:bg-slate-50/50">
                      <TableCell className="text-[13px] font-semibold text-color-subtitulos text-center py-3 px-2 whitespace-normal break-words leading-tight">
                        {formatDate(adq.fecha)}
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-color-titulos text-center py-3 px-2 whitespace-normal break-all leading-tight">
                        {adq.empresa}
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-color-titulos text-center py-3 px-2 tabular-nums whitespace-normal break-all leading-tight">
                        {adq.deposito}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-slate-500 hover:text-navy transition-colors"
                            onClick={async () => {
                              try {
                                const detallado = await obtenerAdquirente(adq.id);
                                setAdquirenteEditando({
                                  id: detallado.id,
                                  fecha: detallado.fechaAdquisicion,
                                  empresa: detallado.nombreProveedorAdquiriente,
                                  domicilioFiscal: detallado.direccionFiscalProveedorAdquirente,
                                  telefono: detallado.telefonoProveedorAdquirente,
                                  correo: detallado.correoProveedorAdquirente,
                                  deposito:
                                    detallado.datosPagoPliego && detallado.datosPagoPliego !== "—"
                                      ? detallado.datosPagoPliego
                                      : "",
                                });
                                setAdquirenteSheetOpen(true);
                              } catch (e) {
                                toast.error("Error al obtener detalles del adquirente");
                              }
                            }}
                          >
                            <BsEye className="w-[18px] h-[18px]" />
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 transition-colors"
                            onClick={() => {
                              setAdquirenteToDelete(adq.id);
                              setDeleteAdquirenteOpen(true);
                            }}
                          >
                            <FaRegTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
              <Pagination className="justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      &lt;
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive
                      className="h-8 w-8 p-0 bg-navy text-white hover:bg-navy-hover border-transparent rounded-md"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      3
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      4
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                    >
                      &gt;
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        {/* Documentos del Procedimiento (1/3) */}
        <Card className="border border-border shadow-sm flex flex-col pt-6">
          <CardHeader className="pb-6 pt-0 px-6">
            <div className="flex items-center gap-4">
              <IoDocumentTextOutline className="w-6 h-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Documentos del Procedimiento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col">
            <div className="space-y-8 mt-2">
              {documentos.map((doc) => {
                const desactualizado = doc.estaDesactualizado && doc.generado;
                return (
                  <div key={doc.tipo} className="flex items-center justify-between gap-2">
                    {/* ── Icono + Label ── */}
                    <div className="flex items-center gap-4 flex-1">
                      {desactualizado ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* Cuadro con animación cross-dissolve */}
                              <div
                                className="relative w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
                                style={{
                                  backgroundColor: "var(--doc-warning-bg)",
                                  border: "1px solid var(--doc-warning-border)",
                                }}
                              >
                                {/* Icono normal — se desvanece */}
                                <span className="doc-icon-normal absolute inset-0 flex items-center justify-center">
                                  {TIPO_TO_ICON[doc.tipo] === "clipboard" ? (
                                    <FaRegClipboard className="w-[20px] h-[20px] text-slate-600" />
                                  ) : (
                                    <IoReceiptOutline className="w-[22px] h-[22px] text-slate-600" />
                                  )}
                                </span>
                                {/* Icono warning — aparece */}
                                <span className="doc-icon-warning absolute inset-0 flex items-center justify-center">
                                  <IoMdWarning
                                    className="w-[22px] h-[22px]"
                                    style={{ color: "var(--doc-warning)" }}
                                  />
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="max-w-[200px] text-center text-xs"
                            >
                              Se detectaron cambios en la información. Haz clic para regenerar el
                              documento.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="w-[46px] h-[46px] rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {TIPO_TO_ICON[doc.tipo] === "clipboard" ? (
                            <FaRegClipboard className="w-[20px] h-[20px] text-slate-700" />
                          ) : (
                            <IoReceiptOutline className="w-[22px] h-[22px] text-slate-700" />
                          )}
                        </div>
                      )}
                      <p className="text-[14px] font-bold text-color-titulos leading-tight max-w-[130px]">
                        {doc.label}
                      </p>
                    </div>

                    {/* ── Botones de acción ── */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {procesandoDoc[doc.tipo] ? (
                        <div className="flex items-center justify-center w-[22px] h-[22px]">
                          <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Visualizar */}
                          <button
                            className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={!doc.generado}
                            onClick={() => handlePreviewDocumento(doc)}
                          >
                            <IoEyeOutline className="w-[26px] h-[26px]" />
                          </button>

                          {/* Descargar */}
                          <button
                            className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={!doc.generado || isDownloading[doc.tipo]}
                            onClick={() => handleDownloadDocumento(doc)}
                          >
                            {isDownloading[doc.tipo] ? (
                              <div className="w-[24px] h-[24px] flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <IoDownloadOutline className="w-[24px] h-[24px]" />
                            )}
                          </button>

                          {/* Generar (primera vez) / Regenerar (cuando desactualizado) / Icono inactivo */}
                          {!doc.generado ? (
                            <GenerarDocBtn
                              tipo={doc.tipo}
                              adquirentesCount={adquirentes.length}
                              oferentesCount={oferentes.length}
                              onGenerar={handleGenerarDocumento}
                            />
                          ) : desactualizado ? (
                            // Regenerar — activo solo cuando estaDesactualizado
                            <button
                              className="text-red-400 hover:text-red-600 transition-colors"
                              onClick={() => handleRegenerarDocumento(doc)}
                              title="Regenerar documento"
                            >
                              <BsArrowClockwise className="w-[20px] h-[20px]" />
                            </button>
                          ) : (
                            // Ya generado y al día — botón deshabilitado
                            <button
                              className="text-[#334155] opacity-30 cursor-not-allowed"
                              disabled
                            >
                              <BsArrowClockwise className="w-[20px] h-[20px]" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sección Inferior: Oferentes ── */}
      <Card className="border border-border shadow-sm overflow-hidden flex flex-col p-0 gap-0">
        <CardHeader className="pb-4 pt-4 px-6 flex flex-row items-center justify-between border-b border-border bg-slate-50 m-0">
          <div className="flex items-center gap-3">
            <IoDiamondOutline className="w-6 h-6 text-color-titulos" />
            <CardTitle className="text-[17px] font-bold text-color-titulos">
              Registro de Oferentes
            </CardTitle>
          </div>
          <Button
            onClick={() => {
              setOferenteEditando(null);
              setOferenteSheetOpen(true);
            }}
            variant="ghost"
            className="text-navy hover:text-navy-hover hover:bg-slate-100 font-bold text-[13px] p-0"
          >
            + Añadir Oferentes
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[18%]">
                  Empresa
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[12%]">
                  RIF
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[15%]">
                  Rep. Legal
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[11%]">
                  Cédula
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[19%]">
                  Reg. Mercantil
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 h-10 text-[11px] text-center w-[15%]">
                  Monto oferta
                </TableHead>
                <TableHead className="text-color-titulos font-bold px-2 text-center h-10 text-[11px] w-[10%]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingOferentes ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground italic py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                      <p>Cargando oferentes...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : oferentes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground italic py-12">
                    No hay oferentes registrados.
                  </TableCell>
                </TableRow>
              ) : (
                oferentes.map((ofe) => (
                  <TableRow key={ofe.id} className="border-b border-border hover:bg-slate-50/50">
                    <TableCell className="text-[10px] font-semibold text-color-titulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.nombreEmpresa}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono py-3 px-2 text-center leading-tight break-all">
                      {ofe.rif}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.representanteLegal}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos font-mono py-3 px-2 text-center leading-tight break-all">
                      {ofe.cedula}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-subtitulos py-3 px-2 text-center whitespace-normal break-all leading-tight">
                      {ofe.registroMercantil}
                    </TableCell>
                    <TableCell className="text-[10px] font-semibold text-color-titulos py-3 px-2 tabular-nums text-center whitespace-normal break-all leading-tight">
                      {ofe.montoOferta}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="text-slate-500 hover:text-navy transition-colors"
                          onClick={async () => {
                            try {
                              const detallado = await obtenerOferente(ofe.id);
                              setOferenteEditando({
                                id: detallado.id,
                                nombreEmpresa: detallado.nombreProveedorOferente,
                                rif: detallado.rifProveedorOferente,
                                representanteLegal: detallado.nombreRepLegalOferente,
                                cedula: detallado.cedulaRepLegalOferente,
                                registroMercantil:
                                  detallado.datosRegistroMercantilProveedorOferente || "—",
                                cantidadSobres: detallado.numeroSobresEntregados
                                  ? String(detallado.numeroSobresEntregados)
                                  : "0",
                                montoOferta: String(detallado.montoOfertaBs),
                              });
                              setOferenteSheetOpen(true);
                            } catch (e) {
                              toast.error("Error al obtener detalles del oferente");
                            }
                          }}
                        >
                          <BsEye className="w-[18px] h-[18px]" />
                        </button>
                        <button
                          className="text-red-400 hover:text-red-600 transition-colors"
                          onClick={() => {
                            setOferenteToDelete(ofe.id);
                            setDeleteOferenteOpen(true);
                          }}
                        >
                          <FaRegTrashAlt className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
            <Pagination className="justify-end">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &lt;
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    className="h-8 w-8 p-0 bg-navy text-white hover:bg-navy-hover border-transparent rounded-md"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 bg-white border border-border text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    4
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    className="h-8 w-8 p-0 border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md"
                  >
                    &gt;
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* ── Sheets ── */}
      <AdquirenteSheet
        open={adquirenteSheetOpen}
        onOpenChange={setAdquirenteSheetOpen}
        mode={adquirenteEditando ? "editar" : "crear"}
        defaultValues={
          adquirenteEditando
            ? {
                fechaAdquisicion: adquirenteEditando.fecha,
                nombreEmpresa: adquirenteEditando.empresa,
                domicilioFiscal: adquirenteEditando.domicilioFiscal,
                telefono: adquirenteEditando.telefono,
                correo: adquirenteEditando.correo,
                referenciaDeposito: adquirenteEditando.deposito,
              }
            : undefined
        }
        onSubmit={handleAddAdquirente}
      />

      <OferenteSheet
        open={oferenteSheetOpen}
        onOpenChange={setOferenteSheetOpen}
        mode={oferenteEditando ? "editar" : "crear"}
        defaultValues={
          oferenteEditando
            ? {
                rif: oferenteEditando.rif,
                nombreEmpresa: oferenteEditando.nombreEmpresa,
                representanteLegal: oferenteEditando.representanteLegal,
                cedulaRepresentante: oferenteEditando.cedula,
                registroMercantil: oferenteEditando.registroMercantil,
                cantidadSobres: oferenteEditando.cantidadSobres,
                montoOferta: oferenteEditando.montoOferta,
              }
            : undefined
        }
        onSubmit={handleAddOferente}
      />

      {/* ── Diálogos de eliminación ── */}
      <ConfirmarEliminacionDialog
        open={deleteAdquirenteOpen}
        onOpenChange={setDeleteAdquirenteOpen}
        onConfirm={handleDeleteAdquirente}
        tipo="adquirente"
      />

      <ConfirmarEliminacionDialog
        open={deleteOferenteOpen}
        onOpenChange={setDeleteOferenteOpen}
        onConfirm={handleDeleteOferente}
        tipo="oferente"
      />

      {/* Modal especial de Registro Rápido */}
      <Dialog open={showProviderWarning} onOpenChange={setShowProviderWarning}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-navy font-bold">Registro rápido exitoso</DialogTitle>
            <DialogDescription className="text-slate-500 mt-3 pt-2">
              Se ha detectado que el RIF <strong className="text-navy">{registroRapidoRif}</strong>{" "}
              no existía en nuestro sistema. Lo hemos añadido a la base de datos de{" "}
              <strong>proveedores</strong> de forma rápida para poder registrar la oferta con éxito.
              <br />
              <br />
              Por favor, recuerde dirigirse posteriormente al{" "}
              <strong className="text-navy">módulo de proveedores</strong> para completar
              exhaustivamente el perfil de esta empresa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowProviderWarning(false)}
              className="bg-navy hover:bg-navy/90 text-white font-bold w-full"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ManualPreviewDialog
        open={previewDocOpen}
        onOpenChange={(open) => {
          setPreviewDocOpen(open);
          if (!open && previewDocUrl) {
            URL.revokeObjectURL(previewDocUrl);
            setPreviewDocUrl(null);
            setPreviewDocTitle("");
          }
        }}
        urlArchivo={previewDocUrl}
        tituloManual={previewDocTitle}
        isLoading={isPreviewing}
      />
    </div>
  );
}
