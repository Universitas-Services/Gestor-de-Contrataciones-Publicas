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
import { Settings2 } from "lucide-react";

import type { ProductoItemFormValues } from "@/lib/schemas/fase1Schema";
import {
  crearPresupuestoItem,
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
  PresupuestoItemRecord,
  PresupuestoItemsMeta,
  PresupuestoItemsTotals,
} from "@/types/fase1.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ManualPreviewDialog } from "@/components/dashboards/admin_ente/ManualPreviewDialog";
import { PresupuestoItemsTable } from "./PresupuestoItemsTable";
import { ProductoItemSheet } from "./ProductoItemSheet";

interface Fase1PanelProps {
  expedienteId: string;
  fase1Creada?: boolean;
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
    label: "Acta de Inicio",
    endpoint: "acta-inicio",
    icon: "receipt",
  },
  {
    tipo: "PLIEGO_CONDICIONES",
    label: "Pliego de Condiciones",
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

function EmptyText({
  children,
  minHeightClassName = "min-h-[3rem]",
}: {
  children: ReactNode;
  minHeightClassName?: string;
}) {
  return (
    <p className={`line-clamp-3 text-sm leading-6 text-slate-500 ${minHeightClassName}`}>
      {children}
    </p>
  );
}

function Fase1TechnicalCardSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <section key={`technical-skeleton-${index}`} className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[96%]" />
            <Skeleton className="h-4 w-[88%]" />
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </section>
    </div>
  );
}

function Fase1NoIniciadaNotice() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-6">
      <p className="text-base font-semibold text-heading-dark">
        Debes llenar el formulario de la Fase 1.
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Completa la fase preparatoria para visualizar la definicion tecnica y financiera del
        expediente.
      </p>
    </div>
  );
}

function ResponsabilidadSocialBadge({ value }: { value: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        value
          ? "border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
          : "border-slate-200 bg-white px-3 py-1 text-slate-500"
      }
    >
      {value ? "Si" : "No"}
    </Badge>
  );
}

function Fase1TechnicalContent({
  fasePreparatoria,
}: {
  fasePreparatoria: FasePreparatoriaDetalleResponse;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-base font-semibold text-heading-dark">Caracteristicas tecnicas</h3>
        <EmptyText>{fasePreparatoria.detallesTecnicosCalidad}</EmptyText>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-heading-dark">Cantidades y alcance</h3>
        <EmptyText>{fasePreparatoria.alcanceCantidadesObra}</EmptyText>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-heading-dark">Ventajas economicas/tecnicas</h3>
        <EmptyText>{fasePreparatoria.justificacionVentajas}</EmptyText>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-heading-dark">
            Proyecto de Responsabilidad Social
          </h3>
          <p className="text-sm leading-6 text-slate-500">
            Origen en el registro institucional de necesidades sociales del ente.
          </p>
        </div>

        <ResponsabilidadSocialBadge value={fasePreparatoria.origenCrsRegistro} />
      </section>
    </div>
  );
}

export function Fase1Panel({ expedienteId, fase1Creada = false }: Fase1PanelProps) {
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
  const [isSavingItem, setIsSavingItem] = useState(false);

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
        setItems(presupuestoResult.value.items);
        setMeta(presupuestoResult.value.meta);
        setTotales(presupuestoResult.value.totales);
        setPage((currentPage) =>
          currentPage === presupuestoResult.value.meta.page
            ? currentPage
            : presupuestoResult.value.meta.page
        );
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
    ? `/elaboracion-expediente/${expedienteId}/fase-1?fase1Id=${fasePreparatoria.id}`
    : `/elaboracion-expediente/${expedienteId}/fase-1`;
  const canUseDocumentActions = Boolean(fasePreparatoria) || documentos.some((doc) => doc.generado);

  const handleAddItem = async (values: ProductoItemFormValues) => {
    setIsSavingItem(true);

    try {
      await crearPresupuestoItem(expedienteId, values);
      setIsSheetOpen(false);
      toast.success("Item agregado al presupuesto base.");

      const response = await listarPresupuestoItems(expedienteId, {
        page,
        limit,
      });

      setItems(response.items);
      setMeta(response.meta);
      setTotales(response.totales);
      setPage((currentPage) =>
        currentPage === response.meta.page ? currentPage : response.meta.page
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el item.");
      throw error;
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleGenerarDocumento = async (tipo: string) => {
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
      <div className="flex justify-end">
        <Button asChild className="bg-navy font-semibold text-white shadow-sm hover:bg-navy-hover">
          <Link href={fase1Href}>
            {fasePreparatoria ? "Editar fase de preparacion" : "Iniciar fase de preparacion"}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)]">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <Settings2 className="h-5 w-5 text-navy" />
              Definicion tecnica y financiera
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loadingFasePreparatoria ? (
              <Fase1TechnicalCardSkeleton />
            ) : fase1NoIniciada ? (
              <Fase1NoIniciadaNotice />
            ) : fasePreparatoria ? (
              <Fase1TechnicalContent fasePreparatoria={fasePreparatoria} />
            ) : (
              <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-6">
                <p className="text-sm font-medium text-red-700">
                  No se pudo interpretar la informacion de la Fase 1 para este expediente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
                const icon = getDocumentoIcon(doc.tipo);

                return (
                  <div key={doc.tipo} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4 flex-1">
                      {desactualizado ? (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="relative w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer"
                                style={{
                                  backgroundColor: "var(--doc-warning-bg)",
                                  border: "1px solid var(--doc-warning-border)",
                                }}
                              >
                                <span className="doc-icon-normal absolute inset-0 flex items-center justify-center">
                                  {icon === "clipboard" ? (
                                    <FaRegClipboard className="w-[20px] h-[20px] text-slate-600" />
                                  ) : (
                                    <IoReceiptOutline className="w-[22px] h-[22px] text-slate-600" />
                                  )}
                                </span>
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
                              Se detectaron cambios en la informacion. Haz clic para regenerar el
                              documento.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="w-[46px] h-[46px] rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                          {icon === "clipboard" ? (
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

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {procesandoDoc[doc.tipo] ? (
                        <div className="flex items-center justify-center w-[22px] h-[22px]">
                          <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          <button
                            className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={!doc.generado || !canUseDocumentActions}
                            onClick={() => handlePreviewDocumento(doc)}
                          >
                            <IoEyeOutline className="w-[26px] h-[26px]" />
                          </button>

                          <button
                            className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={
                              !doc.generado || !canUseDocumentActions || isDownloading[doc.tipo]
                            }
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

                          {!doc.generado ? (
                            <button
                              className="text-[#334155] hover:text-navy transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              disabled={!canUseDocumentActions}
                              onClick={() => handleGenerarDocumento(doc.tipo)}
                            >
                              <IoNewspaperOutline className="w-[24px] h-[24px]" />
                            </button>
                          ) : desactualizado ? (
                            <button
                              className="text-red-400 hover:text-red-600 transition-colors"
                              onClick={() => handleRegenerarDocumento(doc)}
                              title="Regenerar documento"
                            >
                              <BsArrowClockwise className="w-[20px] h-[20px]" />
                            </button>
                          ) : (
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

      <PresupuestoItemsTable
        items={items}
        readOnly
        showAddButton
        addButtonDisabled={loading || !canAddItems}
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
        onAdd={() => setIsSheetOpen(true)}
      />

      <ProductoItemSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleAddItem}
        isSubmitting={isSavingItem}
      />

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
