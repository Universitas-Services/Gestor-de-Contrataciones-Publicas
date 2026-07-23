"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BsArrowClockwise } from "react-icons/bs";
import { FaRegClipboard } from "react-icons/fa";
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoNewspaperOutline,
  IoReceiptOutline,
} from "react-icons/io5";
import { IoMdWarning } from "react-icons/io";
import { Settings2, Megaphone, Scale, ClipboardList, Clock } from "lucide-react";

import type {
  ProductoItemFormInputValues,
  ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import {
  actualizarPresupuestoItem,
  crearPresupuestoItem,
  eliminarPresupuestoItem,
  listarPresupuestoItems,
  obtenerFasePreparatoria,
} from "@/services/fase1Service";
import {
  descargarDocumento,
  generarDocumento,
  obtenerStatusDocumentos,
  previewDocumento,
  regenerarDocumento,
  type DocumentoStatus,
} from "@/services/generadorDocumentosService";
import type {
  FasePreparatoriaDetalleResponse,
  ListarPresupuestoItemsResponse,
  PresupuestoItemRecord,
  PresupuestoItemsMeta,
  PresupuestoItemsTotals,
} from "@/types/fase1.types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { PresupuestoItemsTable } from "./PresupuestoItemsTable";
import { ProductoItemModal } from "./ProductoItemModal";

interface Fase1PanelProps {
  expedienteId: string;
  fase1Creada?: boolean;
  readOnly?: boolean;
  /** Reservado: labels dinámicos por tipo (opcional). */
  tipoContratacion?: TipoContratacionBackend;
  /** Ruta canónica del módulo de expedientes (default: gestion). */
  basePath?: string;
}

interface Fase1DocumentoConfig {
  tipo: string;
  label: string;
  endpoint: string;
  icon: "receipt" | "clipboard";
}

const FASE1_DOCUMENTOS: Fase1DocumentoConfig[] = [
  {
    tipo: "ACTA_INICIO",
    label: "Acta de inicio",
    endpoint: "acta-inicio",
    icon: "receipt",
  },
  {
    tipo: "PLIEGO_CONDICIONES",
    label: "Pliego de condiciones",
    endpoint: "pliego-condiciones",
    icon: "clipboard",
  },
  {
    tipo: "LLAMADO_PARTICIPAR",
    label: "Llamado a participar",
    endpoint: "llamado-participar",
    icon: "receipt",
  },
];

const DEFAULT_META: PresupuestoItemsMeta = {
  total: 0,
  page: 1,
  lastPage: 1,
};

const DEFAULT_TOTALS: PresupuestoItemsTotals = {
  subtotal: 0,
  porcentajeIvaAplicado: 0,
  montoIva: 0,
  montoTotal: 0,
};

function buildFase1Documentos(statuses: DocumentoStatus[]): DocumentoStatus[] {
  return FASE1_DOCUMENTOS.map((config) => {
    const backendDoc = statuses.find((status) => status.tipo === config.tipo);

    return (
      backendDoc ?? {
        tipo: config.tipo,
        label: config.label,
        generado: false,
        estaDesactualizado: false,
        documento: null,
      }
    );
  });
}

function getDocumentoEndpoint(tipo: string) {
  return FASE1_DOCUMENTOS.find((doc) => doc.tipo === tipo)?.endpoint;
}

function getDocumentoIcon(tipo: string) {
  return FASE1_DOCUMENTOS.find((doc) => doc.tipo === tipo)?.icon ?? "receipt";
}

function toProductoItemFormInputValues(
  item: PresupuestoItemRecord | null
): ProductoItemFormInputValues | undefined {
  if (!item) return undefined;

  return {
    descripcionItem: item.descripcionItem,
    codigoPartida: item.codigoPartida,
    unidadMedida: item.unidadMedida,
    cantidadRequerida: String(item.cantidadRequerida),
    precioUnitarioEstimado: String(item.precioUnitarioEstimado),
  };
}

function EmptyText({ children, className = "" }: { children: ReactNode; className?: string }) {
  const text = typeof children === "string" ? children.trim() : children;
  const isEmpty = text == null || text === "";
  return (
    <p className={`text-sm leading-relaxed text-heading-dark font-inter ${className}`}>
      {isEmpty ? "—" : text}
    </p>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-inter">
      {children}
    </p>
  );
}

function Fase1CardHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <CardHeader className="space-y-3 pb-4">
      <CardTitle className="flex items-center gap-2 text-[16px] font-bold text-color-titulos font-inter">
        {icon}
        {title}
      </CardTitle>
      <div className="h-px w-full bg-slate-100" />
    </CardHeader>
  );
}

function formatBsAmount(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : parseFloat(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Fase1CardsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[70%]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DefinicionTecnicaCard({ fase }: { fase: FasePreparatoriaDetalleResponse }) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <Fase1CardHeader
        icon={<Settings2 className="h-4 w-4 text-slate-400" />}
        title="1. Definición técnica"
      />
      <CardContent className="space-y-5">
        <section className="space-y-1.5">
          <FieldLabel>Autorización de inicio</FieldLabel>
          <EmptyText>{fase.datosActoAutorizacionInicio}</EmptyText>
        </section>
        <section className="space-y-1.5">
          <FieldLabel>Características técnicas</FieldLabel>
          <EmptyText className="whitespace-pre-wrap">{fase.detallesTecnicosCalidad}</EmptyText>
        </section>
        <section className="space-y-1.5">
          <FieldLabel>Responsabilidad social</FieldLabel>
          <Badge
            variant="outline"
            className={
              fase.origenCrsRegistro
                ? "border-slate-200 bg-slate-100 px-3 py-1 text-slate-700 font-medium"
                : "border-slate-200 bg-white px-3 py-1 text-slate-500"
            }
          >
            {fase.origenCrsRegistro ? "Sí aplica (Registro Institucional)" : "No aplica"}
          </Badge>
        </section>
      </CardContent>
    </Card>
  );
}

function LogisticaLlamadoCard({ fase }: { fase: FasePreparatoriaDetalleResponse }) {
  const tieneCosto = fase.pliegoGratuito === false;

  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <Fase1CardHeader
        icon={<Megaphone className="h-4 w-4 text-slate-400" />}
        title="2. Logística del llamado"
      />
      <CardContent className="space-y-5">
        <section className="space-y-1.5">
          <FieldLabel>Recepción y apertura</FieldLabel>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <EmptyText>{fase.horaActoRecepAper}</EmptyText>
          </div>
        </section>
        <section className="space-y-1.5">
          <FieldLabel>Disponibilidad del pliego</FieldLabel>
          <EmptyText>{fase.direccionRetiroPliego}</EmptyText>
          {fase.horarioRetiroPliego ? (
            <p className="text-sm text-slate-600 font-inter">({fase.horarioRetiroPliego})</p>
          ) : null}
        </section>
        {tieneCosto ? (
          <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3 space-y-1">
            <p className="text-sm font-bold uppercase text-navy font-inter">
              Costo pliego: Bs. {formatBsAmount(fase.costoPliegoBs)}
            </p>
            <p className="text-sm text-navy/90 font-inter">
              {[fase.bancoPagoPliego, fase.cuentaPagoPliego].filter(Boolean).join(" | ") || "—"}
            </p>
            <p className="text-sm text-navy/90 font-inter">
              Titular: {fase.titularPagoPliego?.trim() || "—"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
            <p className="text-sm font-bold uppercase text-navy font-inter">
              Costo del pliego: Gratis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParametrosLegalesCard({ fase }: { fase: FasePreparatoriaDetalleResponse }) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <Fase1CardHeader
        icon={<Scale className="h-4 w-4 text-slate-400" />}
        title="3. Parámetros legales"
      />
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600 font-inter">Validez de la oferta</p>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-heading-dark">
            {fase.diasValidezOferta != null ? `${fase.diasValidezOferta} Días` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600 font-inter">Garantía mantenimiento</p>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-heading-dark">
            {fase.diasVigenciaGarantiaExtension != null
              ? `${fase.diasVigenciaGarantiaExtension} Días ext.`
              : "—"}
          </span>
        </div>
        <section className="space-y-1.5 pt-1">
          <FieldLabel>Autoridad para aclaratorias</FieldLabel>
          <EmptyText>{fase.autoridadAclaratorias}</EmptyText>
        </section>
      </CardContent>
    </Card>
  );
}

function ObservacionesFinalesCard({ fase }: { fase: FasePreparatoriaDetalleResponse }) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full">
      <Fase1CardHeader
        icon={<ClipboardList className="h-4 w-4 text-slate-400" />}
        title="4. Observaciones finales"
      />
      <CardContent className="space-y-5">
        <section className="space-y-2">
          <FieldLabel>Ejecución plurianual</FieldLabel>
          {fase.condicionPlurianual ? (
            <div className="flex items-start gap-2 rounded-md border-l-4 border-amber-400 bg-amber-50 px-3 py-2.5">
              <IoMdWarning className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 font-inter leading-snug">
                Recuerde reflejar esta condición en el cronograma o en las condiciones del
                procedimiento.
              </p>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 font-semibold"
            >
              No aplica
            </Badge>
          )}
        </section>
        <section className="space-y-2">
          <FieldLabel>Agrupación / Contrato marco</FieldLabel>
          {fase.viabilidadContratoMarco ? (
            <blockquote className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-600 font-inter leading-relaxed">
              {(
                fase.justificacionContratoMarco ?? fase.justificacion_contrato_marco_au_au
              )?.trim() || "—"}
            </blockquote>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 font-semibold"
            >
              No aplica
            </Badge>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

export function Fase1Panel({
  expedienteId,
  fase1Creada = false,
  readOnly = false,
  basePath = "/gestion-expedientes",
}: Fase1PanelProps) {
  const [items, setItems] = useState<PresupuestoItemRecord[]>([]);
  const [meta, setMeta] = useState<PresupuestoItemsMeta>(DEFAULT_META);
  const [totales, setTotales] = useState<PresupuestoItemsTotals>(DEFAULT_TOTALS);
  const [fasePreparatoria, setFasePreparatoria] = useState<FasePreparatoriaDetalleResponse | null>(
    null
  );
  const [fase1NoIniciada, setFase1NoIniciada] = useState(false);
  const [documentos, setDocumentos] = useState<DocumentoStatus[]>(buildFase1Documentos([]));
  const [previewDocOpen, setPreviewDocOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [procesandoDoc, setProcesandoDoc] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [loadingFasePreparatoria, setLoadingFasePreparatoria] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<PresupuestoItemRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PresupuestoItemRecord | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const applyPresupuestoItems = (response: ListarPresupuestoItemsResponse) => {
    setItems(response.items);
    setMeta(response.meta);
    setTotales(response.totales);
    setPage((currentPage) =>
      currentPage === response.meta.page ? currentPage : response.meta.page
    );
  };

  const reloadPresupuestoItems = async (targetPage = page) => {
    const response = await listarPresupuestoItems(expedienteId, {
      page: targetPage,
      limit,
    });

    applyPresupuestoItems(response);
    return response;
  };

  const resetSheetState = () => {
    setSheetMode("create");
    setSelectedItem(null);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);

    if (!open) {
      resetSheetState();
    }
  };

  const loadDocumentos = async () => {
    if (!expedienteId) return;

    try {
      const allDocs = await obtenerStatusDocumentos(expedienteId);
      const fase1Docs = allDocs.filter((doc) =>
        FASE1_DOCUMENTOS.some((config) => config.tipo === doc.tipo)
      );
      setDocumentos(buildFase1Documentos(fase1Docs));
    } catch (error) {
      console.error("Error al cargar estado de documentos Fase 1:", error);
      setDocumentos(buildFase1Documentos([]));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadPanelData = async () => {
      setLoading(true);
      setLoadingFasePreparatoria(true);

      const [presupuestoResult, fasePreparatoriaResult, documentosResult] =
        await Promise.allSettled([
          listarPresupuestoItems(expedienteId, {
            page,
            limit,
          }),
          obtenerFasePreparatoria(expedienteId),
          obtenerStatusDocumentos(expedienteId),
        ]);

      if (!isMounted) return;

      if (presupuestoResult.status === "fulfilled") {
        applyPresupuestoItems(presupuestoResult.value);
      } else {
        setItems([]);
        setMeta(DEFAULT_META);
        setTotales(DEFAULT_TOTALS);
        toast.error(
          presupuestoResult.reason instanceof Error
            ? presupuestoResult.reason.message
            : "No se pudo cargar el presupuesto base del expediente."
        );
      }

      if (fasePreparatoriaResult.status === "fulfilled") {
        setFasePreparatoria(fasePreparatoriaResult.value);
        setFase1NoIniciada(fasePreparatoriaResult.value === null);
      } else {
        setFasePreparatoria(null);
        setFase1NoIniciada(false);
        toast.error(
          fasePreparatoriaResult.reason instanceof Error
            ? fasePreparatoriaResult.reason.message
            : "No se pudo cargar la informacion de la fase preparatoria."
        );
      }

      if (documentosResult.status === "fulfilled") {
        const fase1Docs = documentosResult.value.filter((doc) =>
          FASE1_DOCUMENTOS.some((config) => config.tipo === doc.tipo)
        );
        setDocumentos(buildFase1Documentos(fase1Docs));
      } else {
        setDocumentos(buildFase1Documentos([]));
      }

      setLoading(false);
      setLoadingFasePreparatoria(false);
    };

    void loadPanelData();

    return () => {
      isMounted = false;
    };
  }, [expedienteId, limit, page]);

  const canAddItems = Boolean(fasePreparatoria) || fase1Creada || meta.total > 0;
  const emptyDescription = canAddItems
    ? "Todavia no hay productos registrados para este expediente."
    : "La tabla de presupuesto se habilitara cuando se complete el formulario de la Fase 1.";
  const fase1Href = fasePreparatoria?.id
    ? `${basePath}/${expedienteId}/fase-1?fase1Id=${fasePreparatoria.id}`
    : `${basePath}/${expedienteId}/fase-1`;
  const canUseDocumentActions = Boolean(fasePreparatoria) || documentos.some((doc) => doc.generado);

  const documentosCard = (
    <Card className="flex flex-col border border-slate-200 shadow-sm h-full">
      <Fase1CardHeader
        icon={<IoDocumentTextOutline className="h-4 w-4 text-slate-400" />}
        title="Documentos Generados"
      />
      <CardContent className="mt-0 flex flex-1 flex-col">
        <div className="space-y-5">
          {documentos.map((doc) => {
            const desactualizado = doc.estaDesactualizado && doc.generado;
            const icon = getDocumentoIcon(doc.tipo);

            return (
              <div
                key={doc.tipo}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
              >
                <div className="flex flex-1 items-center gap-3 min-w-0">
                  {desactualizado ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: "var(--doc-warning-bg)",
                              border: "1px solid var(--doc-warning-border)",
                            }}
                          >
                            <span className="doc-icon-normal absolute inset-0 flex items-center justify-center">
                              {icon === "clipboard" ? (
                                <FaRegClipboard className="h-[18px] w-[18px] text-slate-600" />
                              ) : (
                                <IoReceiptOutline className="h-5 w-5 text-slate-600" />
                              )}
                            </span>
                            <span className="doc-icon-warning absolute inset-0 flex items-center justify-center">
                              <IoMdWarning
                                className="h-5 w-5"
                                style={{ color: "var(--doc-warning)" }}
                              />
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px] text-center text-xs">
                          Se detectaron cambios en la información. Haz clic para regenerar el
                          documento.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
                      {icon === "clipboard" ? (
                        <FaRegClipboard className="h-[18px] w-[18px] text-navy" />
                      ) : (
                        <IoReceiptOutline className="h-5 w-5 text-navy" />
                      )}
                    </div>
                  )}

                  <p className="truncate text-sm font-semibold leading-tight text-color-titulos font-inter">
                    {doc.label}
                  </p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  {procesandoDoc[doc.tipo] ? (
                    <div className="flex h-5 w-5 items-center justify-center">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <button
                        className="text-slate-500 transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={!doc.generado || !canUseDocumentActions}
                        onClick={() => handlePreviewDocumento(doc)}
                        aria-label={`Vista previa ${doc.label}`}
                      >
                        <IoEyeOutline className="h-5 w-5" />
                      </button>

                      <button
                        className="text-slate-500 transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                        disabled={
                          !doc.generado || !canUseDocumentActions || isDownloading[doc.tipo]
                        }
                        onClick={() => handleDownloadDocumento(doc)}
                        aria-label={`Descargar ${doc.label}`}
                      >
                        {isDownloading[doc.tipo] ? (
                          <div className="flex h-5 w-5 items-center justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                          </div>
                        ) : (
                          <IoDownloadOutline className="h-5 w-5" />
                        )}
                      </button>

                      {!doc.generado ? (
                        <button
                          className="text-slate-500 transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                          disabled={!canUseDocumentActions || readOnly}
                          onClick={() => handleGenerarDocumento(doc.tipo)}
                          aria-label={`Generar ${doc.label}`}
                        >
                          <IoNewspaperOutline className="h-5 w-5" />
                        </button>
                      ) : desactualizado ? (
                        <button
                          className="text-red-400 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                          onClick={() => handleRegenerarDocumento(doc)}
                          title="Regenerar documento"
                          disabled={readOnly}
                          aria-label={`Regenerar ${doc.label}`}
                        >
                          <BsArrowClockwise className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          className="cursor-not-allowed text-slate-400 opacity-30"
                          disabled
                          aria-label="Documento actualizado"
                        >
                          <BsArrowClockwise className="h-4 w-4" />
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
  );

  const handleCreateItemClick = () => {
    if (readOnly) return;
    resetSheetState();
    setIsSheetOpen(true);
  };

  const handleEditItemClick = (item: PresupuestoItemRecord) => {
    if (readOnly) return;
    setSheetMode("edit");
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleDeleteItemClick = (item: PresupuestoItemRecord) => {
    if (readOnly) return;
    setItemToDelete(item);
  };

  const handleSubmitItem = async (values: ProductoItemFormValues) => {
    if (readOnly) return;
    setIsSavingItem(true);

    try {
      if (sheetMode === "edit" && selectedItem) {
        await actualizarPresupuestoItem(selectedItem.id, expedienteId, values);
        handleSheetOpenChange(false);
        toast.success("Producto actualizado");
      } else {
        await crearPresupuestoItem(expedienteId, values);
        handleSheetOpenChange(false);
        toast.success("Item agregado al presupuesto base.");
      }

      await reloadPresupuestoItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el item.");
      throw error;
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (readOnly) return;
    if (!itemToDelete) return;

    setIsDeletingItem(true);

    try {
      await eliminarPresupuestoItem(itemToDelete.id, expedienteId);
      setItemToDelete(null);
      toast.success("Producto eliminado");
      await reloadPresupuestoItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el producto.");
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleGenerarDocumento = async (tipo: string) => {
    if (readOnly) return;
    const endpoint = getDocumentoEndpoint(tipo);
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
    const endpoint = getDocumentoEndpoint(doc.tipo);
    if (!endpoint || !expedienteId) return;

    setIsPreviewing(true);
    setPreviewDocOpen(true);
    try {
      const result = await previewDocumento(endpoint, expedienteId);
      setPreviewDocUrl(result.urlArchivo);
      setPreviewDocTitle(result.tituloDocumento || doc.label);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al obtener la previsualizacion";
      toast.error(message);
      setPreviewDocOpen(false);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDownloadDocumento = async (doc: DocumentoStatus) => {
    const endpoint = getDocumentoEndpoint(doc.tipo);
    if (!endpoint || !expedienteId) return;

    setIsDownloading((prev) => ({ ...prev, [doc.tipo]: true }));
    try {
      const { data, fileName } = await descargarDocumento(endpoint, expedienteId);
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
      toast.success("Documento descargado exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al descargar documento");
    } finally {
      setIsDownloading((prev) => ({ ...prev, [doc.tipo]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            asChild
            className="bg-navy font-semibold text-white shadow-sm hover:bg-navy-hover"
          >
            <Link href={fase1Href}>
              {fasePreparatoria ? "Editar fase de preparacion" : "Iniciar fase de preparacion"}
            </Link>
          </Button>
        </div>
      )}

      {loadingFasePreparatoria ? (
        <Fase1CardsSkeleton />
      ) : (
        <>
          {fase1NoIniciada && !fasePreparatoria && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-semibold text-heading-dark font-inter">
                Debes llenar el formulario de la Fase 1.
              </p>
              <p className="mt-1 text-xs text-slate-500 font-inter">
                Completa la fase preparatoria para visualizar la definición técnica, logística,
                parámetros legales y observaciones del expediente.
              </p>
            </div>
          )}

          {!fase1NoIniciada && !fasePreparatoria && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-red-700">
                No se pudo interpretar la información de la Fase 1 para este expediente.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {fasePreparatoria ? (
              <DefinicionTecnicaCard fase={fasePreparatoria} />
            ) : (
              <Card className="border border-slate-200 shadow-sm h-full">
                <Fase1CardHeader
                  icon={<Settings2 className="h-4 w-4 text-slate-400" />}
                  title="1. Definición técnica"
                />
                <CardContent>
                  <p className="text-sm text-slate-400 italic font-inter">Sin datos cargados.</p>
                </CardContent>
              </Card>
            )}
            {fasePreparatoria ? (
              <LogisticaLlamadoCard fase={fasePreparatoria} />
            ) : (
              <Card className="border border-slate-200 shadow-sm h-full">
                <Fase1CardHeader
                  icon={<Megaphone className="h-4 w-4 text-slate-400" />}
                  title="2. Logística del llamado"
                />
                <CardContent>
                  <p className="text-sm text-slate-400 italic font-inter">Sin datos cargados.</p>
                </CardContent>
              </Card>
            )}
            {documentosCard}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {fasePreparatoria ? (
              <ParametrosLegalesCard fase={fasePreparatoria} />
            ) : (
              <Card className="border border-slate-200 shadow-sm h-full">
                <Fase1CardHeader
                  icon={<Scale className="h-4 w-4 text-slate-400" />}
                  title="3. Parámetros legales"
                />
                <CardContent>
                  <p className="text-sm text-slate-400 italic font-inter">Sin datos cargados.</p>
                </CardContent>
              </Card>
            )}
            {fasePreparatoria ? (
              <ObservacionesFinalesCard fase={fasePreparatoria} />
            ) : (
              <Card className="border border-slate-200 shadow-sm h-full">
                <Fase1CardHeader
                  icon={<ClipboardList className="h-4 w-4 text-slate-400" />}
                  title="4. Observaciones finales"
                />
                <CardContent>
                  <p className="text-sm text-slate-400 italic font-inter">Sin datos cargados.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      <PresupuestoItemsTable
        items={items}
        readOnly={readOnly}
        showAddButton={!readOnly}
        addButtonDisabled={readOnly || loading || !canAddItems}
        addButtonLabel="Anadir item"
        emptyTitle="Sin items cargados"
        emptyDescription={emptyDescription}
        loading={loading}
        serverPagination={{
          currentPage: meta.page,
          totalPages: meta.lastPage,
          onPageChange: setPage,
        }}
        serverTotals={totales}
        onAdd={readOnly ? undefined : handleCreateItemClick}
        onEdit={readOnly ? undefined : handleEditItemClick}
        onDelete={readOnly ? undefined : handleDeleteItemClick}
      />

      <ProductoItemModal
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        onSubmit={handleSubmitItem}
        mode={sheetMode}
        initialValues={toProductoItemFormInputValues(selectedItem)}
        submitLabel={sheetMode === "edit" ? "Guardar" : "Guardar Ítem"}
        isSubmitting={isSavingItem}
      />

      <AlertDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeletingItem) {
            setItemToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de querer eliminar este producto?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingItem}>No</AlertDialogCancel>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingItem}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeletingItem ? "Eliminando..." : "Si"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
