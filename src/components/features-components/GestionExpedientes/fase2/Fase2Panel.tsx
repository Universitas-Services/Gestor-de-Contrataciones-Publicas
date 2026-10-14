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
import { AlertCircle } from "lucide-react";

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
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
  generarListaCotejo,
  previewListaCotejo,
  descargarListaCotejo,
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
  mapToParticipanteEvaluacion,
  parseEvaluacionesResponse,
  sortParticipantesParaTabla,
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

/** Tipos de documento que interesan en la Fase 2 */
const FASE2_DOC_TYPES = ["REGISTRO_ADQUIRENTES", "ACTA_RECEPCION", "ACTA_APERTURA"];

/** Mapeo de tipo de documento → segmento del endpoint de generación */
const TIPO_TO_ENDPOINT: Record<string, string> = {
  REGISTRO_ADQUIRENTES: "registro-adquirentes",
  ACTA_RECEPCION: "acta-recepcion-sobres",
  ACTA_APERTURA: "acta-apertura-sobres",
  [INFORME_RECOMENDACION_DESIERTO_TIPO]: "informe-recomendacion",
};

/** Icono izquierdo por tipo de documento */
const TIPO_TO_ICON: Record<string, "receipt" | "clipboard"> = {
  REGISTRO_ADQUIRENTES: "receipt",
  ACTA_RECEPCION: "clipboard",
  ACTA_APERTURA: "receipt",
};

/** Mapeo de nombres con mayúsculas corregidas para visualización en Fase 2 */
const DOCUMENTOS_DISPLAY: Record<string, string> = {
  REGISTRO_ADQUIRENTES: "Registro de adquirentes",
  ACTA_RECEPCION: "Acta de recepción",
  ACTA_APERTURA: "Acta de apertura",
  [INFORME_RECOMENDACION_DESIERTO_TIPO]: INFORME_RECOMENDACION_DESIERTO_LABEL,
};

// ─── Sub-componente: Botón Generar con validación ───────────────────

interface GenerarDocBtnProps {
  tipo: string;
  adquirentesCount: number;
  oferentesCount: number;
  onGenerar: (tipo: string) => void;
}

function GenerarDocBtn({
  tipo,
  adquirentesCount,
  oferentesCount: _oferentesCount,
  onGenerar,
}: GenerarDocBtnProps) {
  const requiereAdquirentes = tipo === "REGISTRO_ADQUIRENTES";
  const puedeGenerar = !requiereAdquirentes || adquirentesCount > 0;

  const mensajeDisabled = "Registre al menos un adquirente para generar este documento";

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

  const { isDesierto, saveDeclaratoria } = useDeclaratoriaDesierto(
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
  const [procesandoCotejo, setProcesandoCotejo] = useState(false);
  const [cotejoGenerado, setCotejoGenerado] = useState(false);

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
  const [informeRecomendacionStatus, setInformeRecomendacionStatus] =
    useState<DocumentoStatus | null>(null);

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

      // Completar cotejo / puntaje cuando el listado viene incompleto
      const withCotejo = await Promise.all(
        mapped.map(async (participante) => {
          const needsCotejo = !participante.listaCotejoCompletada && !!participante.id;
          const needsScore =
            participante.oferenteCalificado === true &&
            participante.puntuacionFinalConBonos === null &&
            !!participante.id;
          if (!needsCotejo && !needsScore) return participante;
          try {
            const detalle = await obtenerEvaluacionFase3(participante.id);
            const detalleObj =
              detalle && typeof detalle === "object"
                ? (detalle as Record<string, unknown>)
                : undefined;
            if (!detalleObj) return participante;
            const remapped = mapToParticipanteEvaluacion({
              ...detalleObj,
              id: participante.id || detalleObj.id,
              ofertaId: participante.ofertaId || detalleObj.ofertaId,
            });
            return {
              ...participante,
              listaCotejoCompletada:
                participante.listaCotejoCompletada || remapped.listaCotejoCompletada,
              puntuacionFinalConBonos:
                participante.puntuacionFinalConBonos ?? remapped.puntuacionFinalConBonos,
              prelacion: participante.prelacion ?? remapped.prelacion,
              montoOfertaBs: participante.montoOfertaBs ?? remapped.montoOfertaBs,
            };
          } catch {
            return participante;
          }
        })
      );

      setParticipantes(sortParticipantesParaTabla(withCotejo));
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
      const fase2Docs = allDocs.filter((d) => FASE2_DOC_TYPES.includes(d.tipo));
      setDocumentos(fase2Docs);
      setInformeRecomendacionStatus(
        allDocs.find((d) => d.tipo === "INFORME_RECOMENDACION") ?? null
      );
    } catch (error) {
      console.error("Error al cargar estado de documentos:", error);
    }
  };

  const checkCotejoGenerado = async () => {
    if (!expedienteId) return;
    try {
      await previewListaCotejo(expedienteId);
      setCotejoGenerado(true);
    } catch {
      setCotejoGenerado(false);
    }
  };

  // ── Efecto: Cargar datos dinámicos ──
  useEffect(() => {
    loadOferentes();
    loadAdquirentes();
    loadDocumentos();
    void checkCotejoGenerado();
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

  const handlePreviewListaCotejo = async () => {
    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewListaCotejo(expedienteId);
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

  const handleDownloadListaCotejo = async () => {
    setProcesandoCotejo(true);
    try {
      const { data, fileName } = await descargarListaCotejo(expedienteId);
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
      toast.success("Lista de Cotejo descargada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar lista de cotejo");
    } finally {
      setProcesandoCotejo(false);
    }
  };

  const handleCotejoAccion = async (accion: "generar" | "preview" | "download") => {
    if (accion === "generar") {
      if (readOnly) return;
      setProcesandoCotejo(true);
      try {
        await generarListaCotejo(expedienteId);
        setCotejoGenerado(true);
        toast.success("Lista de Cotejo generada exitosamente.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al generar la lista de cotejo");
      } finally {
        setProcesandoCotejo(false);
      }
      return;
    }
    if (accion === "preview") {
      await handlePreviewListaCotejo();
      return;
    }
    await handleDownloadListaCotejo();
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

  const documentosVisibles = useMemo(() => {
    if (!enableDeclaratoriaDesierto || !isDesierto) return documentos;

    // El backend genera el Informe de Recomendación con la plantilla de la causal (1, 2 o 3).
    const informeDesierto: DocumentoStatus = {
      tipo: INFORME_RECOMENDACION_DESIERTO_TIPO,
      label: INFORME_RECOMENDACION_DESIERTO_LABEL,
      generado: informeRecomendacionStatus?.generado ?? false,
      estaDesactualizado: informeRecomendacionStatus?.estaDesactualizado ?? false,
      documento: informeRecomendacionStatus?.documento ?? null,
    };

    return [...documentos, informeDesierto];
  }, [documentos, enableDeclaratoriaDesierto, isDesierto, informeRecomendacionStatus]);

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
    <div className="min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-bold leading-tight text-color-titulos">
              Registro y Control de Participantes
            </h2>
            {enableDeclaratoriaDesierto && isDesierto ? (
              <Badge
                variant="outline"
                className="border-destructive/30 bg-destructive/10 text-destructive"
              >
                Declarado desierto
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] italic leading-relaxed text-muted-foreground">
            Gestione adquirentes, registre ofertas recibidas y ejecute las evaluaciones
            correspondientes.
          </p>
        </div>
        {enableDeclaratoriaDesierto && !readOnly ? (
          <Button
            type="button"
            variant="outline"
            disabled={isDesierto}
            onClick={() => setDesiertoModalOpen(true)}
            className="shrink-0 gap-2 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive disabled:opacity-60"
          >
            <AlertCircle className="h-4 w-4" />
            {isDesierto ? "Procedimiento declarado desierto" : "Declarar Procedimiento Desierto"}
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-1 flex min-w-0 flex-col gap-0 overflow-hidden border border-border p-0 shadow-sm lg:col-span-2">
          <CardHeader className="m-0 flex flex-row items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <IoServer className="h-6 w-6 text-color-titulos" />
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
                className="p-0 text-[13px] font-bold text-navy hover:bg-slate-100 hover:text-navy-hover"
              >
                + Añadir Adquirentes
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="h-12 w-[15%] text-center text-[13px] font-bold text-color-titulos">
                    Fecha
                  </TableHead>
                  <TableHead className="h-12 w-[45%] text-center text-[13px] font-bold text-color-titulos">
                    Empresa Adquirente
                  </TableHead>
                  <TableHead className="h-12 w-[25%] text-center text-[13px] font-bold text-color-titulos">
                    Depósito / Ref.
                  </TableHead>
                  <TableHead className="h-12 w-[15%] text-center text-[13px] font-bold text-color-titulos">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAdquirentes ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center italic text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                        <p>Cargando adquirentes...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : adquirentes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center italic text-muted-foreground"
                    >
                      No hay adquirentes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  (() => {
                    const startPage = (adquirentesPage - 1) * ADQ_PAGE_SIZE;
                    const paginados = adquirentes.slice(startPage, startPage + ADQ_PAGE_SIZE);
                    return paginados.map((adq) => (
                      <TableRow
                        key={adq.id}
                        className="border-b border-border hover:bg-slate-50/50"
                      >
                        <TableCell className="break-words px-2 py-3 text-center text-[13px] font-semibold leading-tight text-color-subtitulos">
                          {formatDate(adq.fecha)}
                        </TableCell>
                        <TableCell className="break-all px-2 py-3 text-center text-[13px] font-semibold leading-tight text-color-titulos">
                          {adq.empresa}
                        </TableCell>
                        <TableCell className="break-all px-2 py-3 text-center text-[13px] font-semibold tabular-nums leading-tight text-color-titulos">
                          {adq.deposito}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              className="text-slate-500 transition-colors hover:text-navy"
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
                                } catch {
                                  toast.error("Error al obtener detalles del adquirente");
                                }
                              }}
                            >
                              <BsEye className="h-[18px] w-[18px]" />
                            </button>
                            {!readOnly && (
                              <button
                                className="text-red-400 transition-colors hover:text-red-600"
                                onClick={() => {
                                  setAdquirenteToDelete(adq.id);
                                  setDeleteAdquirenteOpen(true);
                                }}
                              >
                                <FaRegTrashAlt className="h-4 w-4" />
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

            <div className="mt-auto border-t border-border bg-slate-50 px-6 py-4">
              <Pagination className="justify-end">
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <button
                      disabled={adquirentesPage === 1}
                      onClick={() => setAdquirentesPage((prev) => Math.max(prev - 1, 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {"<"}
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
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-semibold transition-colors ${
                              adquirentesPage === pageNum
                                ? "bg-navy text-white hover:bg-navy-hover"
                                : "border border-border bg-white text-muted-foreground hover:bg-slate-100"
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
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-muted-foreground hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {">"}
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-w-0 flex-col border border-border pt-6 shadow-sm">
          <CardHeader className="px-6 pb-6 pt-0">
            <div className="flex items-center gap-4">
              <IoDocumentTextOutline className="h-6 w-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Documentos del procedimiento
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-6 pb-6">
            <div className="mt-2 space-y-8">
              {/* Plantilla Lista de Cotejo — mismo layout que el resto */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                    <FaRegClipboard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="truncate text-[14px] font-bold leading-tight text-color-titulos">
                            Lista de Cotejo
                          </p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[280px] text-xs">
                          Lista de Cotejo
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="flex w-[104px] flex-shrink-0 items-center justify-end gap-3">
                  <button
                    type="button"
                    className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                    title="Previsualizar documento"
                    disabled={!cotejoGenerado || procesandoCotejo}
                    onClick={() => void handleCotejoAccion("preview")}
                  >
                    <IoEyeOutline className="h-[26px] w-[26px]" />
                  </button>
                  <button
                    type="button"
                    className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                    title="Descargar documento"
                    disabled={!cotejoGenerado || procesandoCotejo}
                    onClick={() => void handleCotejoAccion("download")}
                  >
                    {procesandoCotejo ? (
                      <div className="flex h-[24px] w-[24px] items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                      </div>
                    ) : (
                      <IoDownloadOutline className="h-[24px] w-[24px]" />
                    )}
                  </button>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <button
                            type="button"
                            className={`flex h-[26px] w-[26px] items-center justify-center text-[#334155] ${
                              readOnly || procesandoCotejo
                                ? "cursor-not-allowed opacity-30"
                                : "hover:text-navy"
                            }`}
                            disabled={readOnly || procesandoCotejo}
                            title="Generar lista de cotejo"
                            onClick={() => void handleCotejoAccion("generar")}
                          >
                            <IoNewspaperOutline className="h-6 w-6" />
                          </button>
                        </span>
                      </TooltipTrigger>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {documentosVisibles.map((doc) => {
                const desactualizado = doc.estaDesactualizado && doc.generado;
                const isInformeDesierto = doc.tipo === INFORME_RECOMENDACION_DESIERTO_TIPO;
                return (
                  <div key={doc.tipo} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {desactualizado ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="relative flex h-[46px] w-[46px] flex-shrink-0 cursor-pointer items-center justify-center rounded-xl"
                                style={{
                                  backgroundColor: "var(--doc-warning-bg)",
                                  border: "1px solid var(--doc-warning-border)",
                                }}
                              >
                                <span className="doc-icon-normal absolute inset-0 flex items-center justify-center">
                                  {TIPO_TO_ICON[doc.tipo] === "clipboard" ? (
                                    <FaRegClipboard className="h-5 w-5 text-slate-600" />
                                  ) : (
                                    <IoReceiptOutline className="h-[22px] w-[22px] text-slate-600" />
                                  )}
                                </span>
                                <span className="doc-icon-warning absolute inset-0 flex items-center justify-center">
                                  <IoMdWarning
                                    className="h-[22px] w-[22px]"
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
                        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                          {isInformeDesierto || TIPO_TO_ICON[doc.tipo] === "clipboard" ? (
                            <FaRegClipboard className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <IoReceiptOutline className="h-[22px] w-[22px] text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="truncate text-[14px] font-bold leading-tight text-color-titulos">
                                {DOCUMENTOS_DISPLAY[doc.tipo] || doc.label}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[280px] text-xs">
                              {DOCUMENTOS_DISPLAY[doc.tipo] || doc.label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="flex w-[104px] flex-shrink-0 items-center justify-end gap-3">
                      {procesandoDoc[doc.tipo] ? (
                        <div className="flex h-[26px] w-[26px] items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                        </div>
                      ) : (
                        <>
                          <button
                            className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={!doc.generado}
                            onClick={() => handlePreviewDocumento(doc)}
                            title="Previsualizar documento"
                          >
                            <IoEyeOutline className="h-[26px] w-[26px]" />
                          </button>
                          <button
                            className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={!doc.generado || isDownloading[doc.tipo]}
                            onClick={() => handleDownloadDocumento(doc)}
                            title="Descargar documento"
                          >
                            {isDownloading[doc.tipo] ? (
                              <div className="flex h-[24px] w-[24px] items-center justify-center">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                              </div>
                            ) : (
                              <IoDownloadOutline className="h-[24px] w-[24px]" />
                            )}
                          </button>
                          {!doc.generado ? (
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
                            <button
                              className="text-destructive/70 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                              onClick={() => handleRegenerarDocumento(doc)}
                              title="Regenerar documento"
                              disabled={readOnly}
                            >
                              <BsArrowClockwise className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              className="cursor-not-allowed text-muted-foreground opacity-30"
                              disabled
                            >
                              <BsArrowClockwise className="h-5 w-5" />
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

      <Card className="flex min-w-0 flex-col gap-0 overflow-hidden border border-border p-0 shadow-sm">
        <CardHeader className="m-0 flex flex-row items-center justify-between border-b border-border bg-slate-50 px-6 py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-3">
              <IoDiamondOutline className="h-6 w-6 shrink-0 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Registro y Evaluación de Oferentes
              </CardTitle>
            </div>
            <p className="pl-9 text-[11px] text-muted-foreground">
              Ofertas consignadas formalmente en el acto público.
            </p>
          </div>
          {!readOnly && (
            <Button
              onClick={() => {
                setOferenteEditando(null);
                setOferenteSheetOpen(true);
              }}
              variant="ghost"
              className="shrink-0 p-0 text-[13px] font-bold text-navy hover:bg-slate-100 hover:text-navy-hover"
            >
              + Añadir Oferentes
            </Button>
          )}
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden p-0">
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
            />
          ) : (
            <>
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="h-10 w-[18%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Empresa
                    </TableHead>
                    <TableHead className="h-10 w-[12%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      RIF
                    </TableHead>
                    <TableHead className="h-10 w-[15%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Rep. Legal
                    </TableHead>
                    <TableHead className="h-10 w-[11%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Cédula
                    </TableHead>
                    <TableHead className="h-10 w-[19%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Reg. Mercantil
                    </TableHead>
                    <TableHead className="h-10 w-[15%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Monto oferta
                    </TableHead>
                    <TableHead className="h-10 w-[10%] px-2 text-center text-[11px] font-bold text-color-titulos">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingOferentes ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center italic text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                          <p>Cargando oferentes...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : oferentes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center italic text-muted-foreground"
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
                          <TableCell className="break-all px-2 py-3 text-center text-[10px] font-semibold leading-tight text-color-titulos">
                            {ofe.nombreEmpresa}
                          </TableCell>
                          <TableCell className="break-all px-2 py-3 text-center font-mono text-[10px] font-semibold leading-tight text-color-subtitulos">
                            {ofe.rif}
                          </TableCell>
                          <TableCell className="break-all px-2 py-3 text-center text-[10px] font-semibold leading-tight text-color-subtitulos">
                            {ofe.representanteLegal}
                          </TableCell>
                          <TableCell className="break-all px-2 py-3 text-center font-mono text-[10px] font-semibold leading-tight text-color-subtitulos">
                            {ofe.cedula}
                          </TableCell>
                          <TableCell className="break-all px-2 py-3 text-center text-[10px] font-semibold leading-tight text-color-subtitulos">
                            {ofe.registroMercantil}
                          </TableCell>
                          <TableCell className="break-all px-2 py-3 text-center text-[10px] font-semibold tabular-nums leading-tight text-color-titulos">
                            {ofe.montoOferta}
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                className="text-slate-500 transition-colors hover:text-navy"
                                onClick={() => void openOferenteDetalle(ofe.id)}
                              >
                                <BsEye className="h-[18px] w-[18px]" />
                              </button>
                              {!readOnly && (
                                <button
                                  className="text-red-400 transition-colors hover:text-red-600"
                                  onClick={() => {
                                    setOferenteToDelete(ofe.id);
                                    setDeleteOferenteOpen(true);
                                  }}
                                >
                                  <FaRegTrashAlt className="h-4 w-4" />
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
              <div className="border-t border-border bg-muted/40 px-6 py-4">
                <Pagination className="justify-end">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <button
                        disabled={oferentesPage === 1}
                        onClick={() => setOferentesPage((prev) => Math.max(prev - 1, 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        &lt;
                      </button>
                    </PaginationItem>
                    {Array.from(
                      {
                        length: Math.max(Math.ceil(oferentes.length / OFE_PAGE_SIZE), 1),
                      },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <button
                              onClick={() => setOferentesPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-semibold transition-colors ${
                                oferentesPage === pageNum
                                  ? "bg-navy text-white hover:bg-navy-hover"
                                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
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
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
