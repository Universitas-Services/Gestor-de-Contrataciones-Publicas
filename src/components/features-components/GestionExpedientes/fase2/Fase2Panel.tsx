"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  listarEvaluacionesFase3,
  obtenerEvaluacionFase3,
} from "@/services/oferenteService";
import { registrarProveedorRapido } from "@/services/proveedores.service";
import {
  obtenerStatusDocumentos,
  generarDocumento,
  regenerarDocumento,
  previewDocumento,
  descargarDocumento,
  previewListaCotejoEvaluacion,
  descargarListaCotejoEvaluacion,
  type DocumentoStatus,
} from "@/services/generadorDocumentosService";
import type { AdquirenteFormValues, OferenteFormValues } from "@/lib/schemas/fase2Schema";
import {
  INFORME_RECOMENDACION_DESIERTO_LABEL,
  INFORME_RECOMENDACION_DESIERTO_TIPO,
  toCausalDeclaratoriaDesiertoApi,
  type CausalDeclaratoriaDesierto,
} from "@/lib/constants/fase2Desierto";
import {
  isListaCotejoCompletada,
  mapToParticipanteEvaluacion,
  parseEvaluacionesResponse,
  sortByPrelacion,
  type ParticipanteEvaluacion,
} from "@/lib/utils/evaluacionesFase3Utils";
import {
  useDeclaratoriaDesierto,
  type DeclaratoriaDesiertoServerSeed,
} from "@/hooks/useDeclaratoriaDesierto";
import { declararExpedienteDesierto } from "@/services/expedienteService";
import { AdquirenteSheet } from "./AdquirenteSheet";
import { OferenteSheet } from "./OferenteSheet";
import { ConfirmarEliminacionDialog } from "./ConfirmarEliminacionDialog";
import { DeclararProcedimientoDesiertoModal } from "./DeclararProcedimientoDesiertoModal";
import { OferentesEvaluacionTable } from "./OferentesEvaluacionTable";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react"; // ─── Documentos del Procedimiento (Fase 2) ──────────────────────────

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

/** Mapeo de nombres con mayúsculas corregidas para visualización en Fase 2 */
const DOCUMENTOS_DISPLAY: Record<string, string> = {
  REGISTRO_ADQUIRENTES: "Registro de adquirentes del pliego",
  ACTA_RECEPCION: "Acta de recepción de sobres",
  ACTA_APERTURA: "Acta de apertura de sobres",
  [INFORME_RECOMENDACION_DESIERTO_TIPO]: INFORME_RECOMENDACION_DESIERTO_LABEL,
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
  readOnly?: boolean;
  /** Solo gestión de expedientes: card + modal de declaratoria desierta */
  enableDeclaratoriaDesierto?: boolean;
  /** Solo gestión: listado de evaluaciones + acciones de cotejo/matriz */
  enableParticipantesEvaluacion?: boolean;
  basePath?: string;
  /** Datos del GET expediente para hidratar desierto tras F5 */
  declaratoriaDesiertoSeed?: DeclaratoriaDesiertoServerSeed | null;
}

export function Fase2Panel({
  expedienteId,
  readOnly = false,
  enableDeclaratoriaDesierto = false,
  enableParticipantesEvaluacion = false,
  basePath = "/gestion-expedientes",
  declaratoriaDesiertoSeed = null,
}: Fase2PanelProps) {
  // ── Estado de Adquirentes ──
  const [adquirentes, setAdquirentes] = useState<Adquirente[]>([]);
  const [adquirentesPage, setAdquirentesPage] = useState(1);
  const ADQ_PAGE_SIZE = 5;
  const [adquirenteSheetOpen, setAdquirenteSheetOpen] = useState(false);
  const [adquirenteEditando, setAdquirenteEditando] = useState<Adquirente | null>(null);
  const [deleteAdquirenteOpen, setDeleteAdquirenteOpen] = useState(false);
  const [adquirenteToDelete, setAdquirenteToDelete] = useState<string | null>(null);
  const [loadingAdquirentes, setLoadingAdquirentes] = useState(false);
  const [desiertoModalOpen, setDesiertoModalOpen] = useState(false);
  const [isDeclaringDesierto, setIsDeclaringDesierto] = useState(false);

  const { isDesierto, hasInformeDesierto, saveDeclaratoria } = useDeclaratoriaDesierto(
    expedienteId,
    enableDeclaratoriaDesierto ? declaratoriaDesiertoSeed : null
  );

  // ── Estado de Oferentes ──
  const [oferentes, setOferentes] = useState<Oferente[]>([]);
  const [oferentesPage, setOferentesPage] = useState(1);
  const OFE_PAGE_SIZE = 5;
  const [oferenteSheetOpen, setOferenteSheetOpen] = useState(false);
  const [oferenteEditando, setOferenteEditando] = useState<Oferente | null>(null);
  const [deleteOferenteOpen, setDeleteOferenteOpen] = useState(false);
  const [oferenteToDelete, setOferenteToDelete] = useState<string | null>(null);
  const [loadingOferentes, setLoadingOferentes] = useState(false);

  // ── Estado de Evaluaciones (gestión) ──
  const [participantes, setParticipantes] = useState<ParticipanteEvaluacion[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [participantesPage, setParticipantesPage] = useState(1);
  const [downloadingListaCotejoId, setDownloadingListaCotejoId] = useState<string | null>(null);

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
      setOferentesPage(1); // Reiniciar a página 1 tras cargar
    } catch (error) {
      console.error("Error al cargar oferentes:", error);
      toast.error("No se pudo cargar la lista de oferentes");
    } finally {
      setLoadingOferentes(false);
    }
  };

  const loadParticipantes = async () => {
    if (!expedienteId || !enableParticipantesEvaluacion) return;
    setLoadingParticipantes(true);
    try {
      const [raw, ofertas] = await Promise.all([
        listarEvaluacionesFase3(expedienteId),
        listarOferentes(expedienteId).catch(
          () => [] as Awaited<ReturnType<typeof listarOferentes>>
        ),
      ]);
      const list = parseEvaluacionesResponse(raw);
      const montoByOfertaId = new Map<string, number>();
      for (const oferta of ofertas as Array<Record<string, unknown>>) {
        const id = String(oferta.id ?? "");
        const monto = Number(oferta.montoOfertaBs);
        if (id && Number.isFinite(monto)) {
          montoByOfertaId.set(id, monto);
        }
      }

      const mapped = list.map(mapToParticipanteEvaluacion).map((participante) => {
        if (participante.montoOfertaBs !== null) return participante;
        const fromOferta = montoByOfertaId.get(participante.ofertaId);
        return fromOferta !== undefined
          ? { ...participante, montoOfertaBs: fromOferta }
          : participante;
      });

      // El listado a menudo no incluye sobre1/sobre2; completar con GET por evaluación
      const withCotejo = await Promise.all(
        mapped.map(async (participante) => {
          if (participante.listaCotejoCompletada || !participante.id) return participante;
          try {
            const detalle = await obtenerEvaluacionFase3(participante.id);
            const detalleObj =
              detalle && typeof detalle === "object"
                ? (detalle as Record<string, unknown>)
                : undefined;
            return {
              ...participante,
              listaCotejoCompletada: isListaCotejoCompletada(
                detalleObj?.sobre1,
                detalleObj?.sobre2
              ),
            };
          } catch {
            return participante;
          }
        })
      );

      setParticipantes(sortByPrelacion(withCotejo));
      setParticipantesPage(1);
    } catch (error) {
      console.error("Error al cargar evaluaciones:", error);
      toast.error("No se pudo cargar la lista de participantes");
    } finally {
      setLoadingParticipantes(false);
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
      setAdquirentesPage(1); // Reiniciar a página 1 tras cargar
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
    if (enableParticipantesEvaluacion) {
      void loadParticipantes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expedienteId, enableParticipantesEvaluacion]);

  // ── Helpers de formato ──
  function formatDate(iso: string): string {
    if (!iso) return "—";
    const d = new Date(`${iso.split("T")[0]}T12:00:00`);
    return d.toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // ── Handlers de Adquirentes ──
  const handleAddAdquirente = async (data: AdquirenteFormValues) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
    if (readOnly) return;
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
      if (enableParticipantesEvaluacion) {
        void loadParticipantes();
      }
      loadDocumentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar oferente");
    }
  };

  const handleDeleteOferente = async () => {
    if (readOnly) return;
    if (oferenteToDelete) {
      try {
        await eliminarOferente(oferenteToDelete);
        toast.success("Oferente eliminado");
        setOferenteToDelete(null);
        setDeleteOferenteOpen(false);
        loadOferentes();
        if (enableParticipantesEvaluacion) {
          void loadParticipantes();
        }
        loadDocumentos();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al eliminar oferente");
      }
    }
  };

  const openOferenteDetalle = async (ofertaId: string) => {
    try {
      const detallado = await obtenerOferente(ofertaId);
      setOferenteEditando({
        id: detallado.id,
        nombreEmpresa: detallado.nombreProveedorOferente,
        rif: detallado.rifProveedorOferente,
        representanteLegal: detallado.nombreRepLegalOferente,
        cedula: detallado.cedulaRepLegalOferente,
        registroMercantil: detallado.datosRegistroMercantilProveedorOferente || "—",
        cantidadSobres: detallado.numeroSobresEntregados
          ? String(detallado.numeroSobresEntregados)
          : "0",
        montoOferta: String(detallado.montoOfertaBs),
      });
      setOferenteSheetOpen(true);
    } catch {
      toast.error("Error al obtener detalles del oferente");
    }
  };

  const handlePreviewListaCotejo = async (evaluacionId: string) => {
    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewListaCotejoEvaluacion(evaluacionId);
      setPreviewDocUrl(result.urlArchivo);
      setPreviewDocTitle(result.tituloDocumento || "Lista de Cotejo");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al previsualizar";
      toast.error(msg);
      setPreviewDocOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadListaCotejo = async (evaluacionId: string) => {
    setDownloadingListaCotejoId(evaluacionId);
    try {
      const { data, fileName } = await descargarListaCotejoEvaluacion(evaluacionId);
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Lista de cotejo descargada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar lista de cotejo");
    } finally {
      setDownloadingListaCotejoId(null);
    }
  };

  // ── Handlers de Documentos ──
  const handleGenerarDocumento = async (tipo: string) => {
    if (readOnly) return;
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
    if (readOnly) return;
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
    if (doc.tipo === INFORME_RECOMENDACION_DESIERTO_TIPO) {
      toast.info(
        "La previsualización del informe desierto estará disponible cuando exista el API."
      );
      return;
    }

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
    if (doc.tipo === INFORME_RECOMENDACION_DESIERTO_TIPO) {
      toast.info("La descarga del informe desierto estará disponible cuando exista el API.");
      return;
    }
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

  const documentosVisibles = useMemo(() => {
    if (!enableDeclaratoriaDesierto || !hasInformeDesierto) return documentos;

    const alreadyPresent = documentos.some(
      (doc) => doc.tipo === INFORME_RECOMENDACION_DESIERTO_TIPO
    );
    if (alreadyPresent) return documentos;

    const informeDesierto: DocumentoStatus = {
      tipo: INFORME_RECOMENDACION_DESIERTO_TIPO,
      label: INFORME_RECOMENDACION_DESIERTO_LABEL,
      generado: true,
      estaDesactualizado: false,
      documento: null,
    };

    return [...documentos, informeDesierto];
  }, [documentos, enableDeclaratoriaDesierto, hasInformeDesierto]);

  const handleConfirmDeclaratoria = async (payload: {
    causal_declaratoria_desierto_au_au: CausalDeclaratoriaDesierto;
    justificacion_declaratoria_desierto_au_au: string;
  }) => {
    setIsDeclaringDesierto(true);
    try {
      await declararExpedienteDesierto(expedienteId, {
        causalDeclaratoriaDesierto: toCausalDeclaratoriaDesiertoApi(
          payload.causal_declaratoria_desierto_au_au
        ),
        justificacionDeclaratoriaDesierto: payload.justificacion_declaratoria_desierto_au_au,
      });
      saveDeclaratoria(payload);
      setDesiertoModalOpen(false);
      toast.success("Procedimiento declarado desierto correctamente.");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Error al declarar el procedimiento desierto"
      );
    } finally {
      setIsDeclaringDesierto(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {enableDeclaratoriaDesierto ? (
        <Card className="border border-border bg-card shadow-sm">
          <CardContent className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-bold leading-tight text-color-titulos">
                  Registro y control de participantes
                </h2>
                {isDesierto ? (
                  <Badge
                    variant="outline"
                    className="border-destructive/30 bg-destructive/10 text-destructive"
                  >
                    Declarado desierto
                  </Badge>
                ) : null}
              </div>
              <p className="text-[12px] italic leading-relaxed text-muted-foreground">
                Gestione el listado de adquirentes y registre las ofertas recibidas para la
                evaluación.
              </p>
            </div>

            {!readOnly ? (
              <Button
                type="button"
                variant="outline"
                disabled={isDesierto}
                onClick={() => setDesiertoModalOpen(true)}
                className="shrink-0 gap-2 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive disabled:opacity-60"
              >
                <AlertCircle className="h-4 w-4" />
                {isDesierto
                  ? "Procedimiento declarado desierto"
                  : "Declarar Procedimiento Desierto"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

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
            {!readOnly && (
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
            )}
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
                  (() => {
                    const start = (adquirentesPage - 1) * ADQ_PAGE_SIZE;
                    const paginados = adquirentes.slice(start, start + ADQ_PAGE_SIZE);
                    return paginados.map((adq) => (
                      <TableRow
                        key={adq.id}
                        className="border-b border-border hover:bg-slate-50/50"
                      >
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
                            {!readOnly && (
                              <button
                                className="text-red-400 hover:text-red-600 transition-colors"
                                onClick={() => {
                                  setAdquirenteToDelete(adq.id);
                                  setDeleteAdquirenteOpen(true);
                                }}
                              >
                                <FaRegTrashAlt className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ));
                  })()
                )}
              </TableBody>
            </Table>

            <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
              <Pagination className="justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <button
                      disabled={adquirentesPage === 1}
                      onClick={() => setAdquirentesPage((prev) => Math.max(prev - 1, 1))}
                      className="h-8 w-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &lt;
                    </button>
                  </PaginationItem>
                  {Array.from(
                    { length: Math.max(Math.ceil(adquirentes.length / ADQ_PAGE_SIZE), 1) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <button
                            onClick={() => setAdquirentesPage(pageNum)}
                            className={`h-8 w-8 flex items-center justify-center rounded-md text-[13px] font-semibold transition-colors ${
                              adquirentesPage === pageNum
                                ? "bg-navy text-white hover:bg-navy-hover"
                                : "bg-white border border-border text-muted-foreground hover:bg-slate-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        </PaginationItem>
                      );
                    }
                  )}
                  <PaginationItem>
                    <button
                      disabled={
                        adquirentesPage ===
                        Math.max(Math.ceil(adquirentes.length / ADQ_PAGE_SIZE), 1)
                      }
                      onClick={() =>
                        setAdquirentesPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.max(Math.ceil(adquirentes.length / ADQ_PAGE_SIZE), 1)
                          )
                        )
                      }
                      className="h-8 w-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &gt;
                    </button>
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
                Documentos del procedimiento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col">
            <div className="space-y-8 mt-2">
              {documentosVisibles.map((doc) => {
                const desactualizado = doc.estaDesactualizado && doc.generado;
                const isInformeDesierto = doc.tipo === INFORME_RECOMENDACION_DESIERTO_TIPO;
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
                        <div className="w-[46px] h-[46px] rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                          {isInformeDesierto || TIPO_TO_ICON[doc.tipo] === "clipboard" ? (
                            <FaRegClipboard className="w-[20px] h-[20px] text-muted-foreground" />
                          ) : (
                            <IoReceiptOutline className="w-[22px] h-[22px] text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <p className="text-[14px] font-bold text-color-titulos leading-tight max-w-[130px]">
                        {DOCUMENTOS_DISPLAY[doc.tipo] || doc.label}
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
                            className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={!doc.generado}
                            onClick={() => handlePreviewDocumento(doc)}
                          >
                            <IoEyeOutline className="w-[26px] h-[26px]" />
                          </button>

                          {/* Descargar */}
                          <button
                            className="text-muted-foreground hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                          {isInformeDesierto ? (
                            <button
                              className="cursor-not-allowed text-muted-foreground opacity-30"
                              disabled
                              title="Pendiente de API"
                            >
                              <BsArrowClockwise className="h-[20px] w-[20px]" />
                            </button>
                          ) : !doc.generado ? (
                            <GenerarDocBtn
                              tipo={doc.tipo}
                              adquirentesCount={readOnly ? 0 : adquirentes.length}
                              oferentesCount={
                                readOnly
                                  ? 0
                                  : enableParticipantesEvaluacion
                                    ? participantes.length
                                    : oferentes.length
                              }
                              onGenerar={handleGenerarDocumento}
                            />
                          ) : desactualizado ? (
                            // Regenerar — activo solo cuando estaDesactualizado
                            <button
                              className="text-destructive/70 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                              onClick={() => handleRegenerarDocumento(doc)}
                              title="Regenerar documento"
                              disabled={readOnly}
                            >
                              <BsArrowClockwise className="w-[20px] h-[20px]" />
                            </button>
                          ) : (
                            // Ya generado y al día — botón deshabilitado
                            <button
                              className="cursor-not-allowed text-muted-foreground opacity-30"
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
          {!readOnly && (
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
          )}
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          {enableParticipantesEvaluacion ? (
            <OferentesEvaluacionTable
              participantes={participantes}
              loading={loadingParticipantes}
              page={participantesPage}
              pageSize={OFE_PAGE_SIZE}
              onPageChange={setParticipantesPage}
              basePath={basePath}
              expedienteId={expedienteId}
              readOnly={readOnly}
              onViewOferente={(ofertaId) => void openOferenteDetalle(ofertaId)}
              onDeleteOferente={(ofertaId) => {
                setOferenteToDelete(ofertaId);
                setDeleteOferenteOpen(true);
              }}
              onPreviewListaCotejo={(evaluacionId) => void handlePreviewListaCotejo(evaluacionId)}
              onDownloadListaCotejo={(evaluacionId) => void handleDownloadListaCotejo(evaluacionId)}
              downloadingId={downloadingListaCotejoId}
            />
          ) : (
            <>
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
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground italic py-12"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                          <p>Cargando oferentes...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : oferentes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground italic py-12"
                      >
                        No hay oferentes registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (() => {
                      const start = (oferentesPage - 1) * OFE_PAGE_SIZE;
                      const paginados = oferentes.slice(start, start + OFE_PAGE_SIZE);
                      return paginados.map((ofe) => (
                        <TableRow
                          key={ofe.id}
                          className="border-b border-border hover:bg-slate-50/50"
                        >
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
                                onClick={() => void openOferenteDetalle(ofe.id)}
                              >
                                <BsEye className="w-[18px] h-[18px]" />
                              </button>
                              {!readOnly && (
                                <button
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                  onClick={() => {
                                    setOferenteToDelete(ofe.id);
                                    setDeleteOferenteOpen(true);
                                  }}
                                >
                                  <FaRegTrashAlt className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()
                  )}
                </TableBody>
              </Table>

              <div className="px-6 py-4 bg-slate-50 border-t border-border mt-auto">
                <Pagination className="justify-end">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <button
                        disabled={oferentesPage === 1}
                        onClick={() => setOferentesPage((prev) => Math.max(prev - 1, 1))}
                        className="h-8 w-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &lt;
                      </button>
                    </PaginationItem>
                    {Array.from(
                      { length: Math.max(Math.ceil(oferentes.length / OFE_PAGE_SIZE), 1) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <button
                              onClick={() => setOferentesPage(pageNum)}
                              className={`h-8 w-8 flex items-center justify-center rounded-md text-[13px] font-semibold transition-colors ${
                                oferentesPage === pageNum
                                  ? "bg-navy text-white hover:bg-navy-hover"
                                  : "bg-white border border-border text-muted-foreground hover:bg-slate-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </PaginationItem>
                        );
                      }
                    )}
                    <PaginationItem>
                      <button
                        disabled={
                          oferentesPage === Math.max(Math.ceil(oferentes.length / OFE_PAGE_SIZE), 1)
                        }
                        onClick={() =>
                          setOferentesPage((prev) =>
                            Math.min(
                              prev + 1,
                              Math.max(Math.ceil(oferentes.length / OFE_PAGE_SIZE), 1)
                            )
                          )
                        }
                        className="h-8 w-8 flex items-center justify-center border border-border bg-white text-muted-foreground hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        &gt;
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
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

      {enableDeclaratoriaDesierto ? (
        <DeclararProcedimientoDesiertoModal
          open={desiertoModalOpen}
          onOpenChange={setDesiertoModalOpen}
          isSubmitting={isDeclaringDesierto}
          onConfirm={handleConfirmDeclaratoria}
        />
      ) : null}
    </div>
  );
}
