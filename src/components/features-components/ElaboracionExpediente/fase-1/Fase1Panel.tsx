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

import type {
  ProductoItemFormInputValues,
  ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
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
    ? `/elaboracion-expediente/${expedienteId}/fase-1?fase1Id=${fasePreparatoria.id}`
    : `/elaboracion-expediente/${expedienteId}/fase-1`;
  const canUseDocumentActions = Boolean(fasePreparatoria) || documentos.some((doc) => doc.generado);

  const handleCreateItemClick = () => {
    resetSheetState();
    setIsSheetOpen(true);
  };

  const handleEditItemClick = (item: PresupuestoItemRecord) => {
    setSheetMode("edit");
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleDeleteItemClick = (item: PresupuestoItemRecord) => {
    setItemToDelete(item);
  };

  const handleSubmitItem = async (values: ProductoItemFormValues) => {
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

        <Card className="flex flex-col border border-border pt-6 shadow-sm">
          <CardHeader className="px-6 pb-6 pt-0">
            <div className="flex items-center gap-4">
              <IoDocumentTextOutline className="h-6 w-6 text-color-titulos" />
              <CardTitle className="text-[17px] font-bold text-color-titulos">
                Documentos del Procedimiento
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="mt-2 flex flex-1 flex-col px-6 pb-6">
            <div className="space-y-8">
              {documentos.map((doc) => {
                const desactualizado = doc.estaDesactualizado && doc.generado;
                const icon = getDocumentoIcon(doc.tipo);

                return (
                  <div key={doc.tipo} className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 items-center gap-4">
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
                                  {icon === "clipboard" ? (
                                    <FaRegClipboard className="h-[20px] w-[20px] text-slate-600" />
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
                              Se detectaron cambios en la informacion. Haz clic para regenerar el
                              documento.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-xl bg-slate-200">
                          {icon === "clipboard" ? (
                            <FaRegClipboard className="h-[20px] w-[20px] text-slate-700" />
                          ) : (
                            <IoReceiptOutline className="h-[22px] w-[22px] text-slate-700" />
                          )}
                        </div>
                      )}

                      <p className="max-w-[130px] text-[14px] font-bold leading-tight text-color-titulos">
                        {doc.label}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-4">
                      {procesandoDoc[doc.tipo] ? (
                        <div className="flex h-[22px] w-[22px] items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                        </div>
                      ) : (
                        <>
                          <button
                            className="text-[#334155] transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={!doc.generado || !canUseDocumentActions}
                            onClick={() => handlePreviewDocumento(doc)}
                          >
                            <IoEyeOutline className="h-[26px] w-[26px]" />
                          </button>

                          <button
                            className="text-[#334155] transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                            disabled={
                              !doc.generado || !canUseDocumentActions || isDownloading[doc.tipo]
                            }
                            onClick={() => handleDownloadDocumento(doc)}
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
                            <button
                              className="text-[#334155] transition-colors hover:text-navy disabled:cursor-not-allowed disabled:opacity-30"
                              disabled={!canUseDocumentActions}
                              onClick={() => handleGenerarDocumento(doc.tipo)}
                            >
                              <IoNewspaperOutline className="h-[24px] w-[24px]" />
                            </button>
                          ) : desactualizado ? (
                            <button
                              className="text-red-400 transition-colors hover:text-red-600"
                              onClick={() => handleRegenerarDocumento(doc)}
                              title="Regenerar documento"
                            >
                              <BsArrowClockwise className="h-[20px] w-[20px]" />
                            </button>
                          ) : (
                            <button
                              className="cursor-not-allowed text-[#334155] opacity-30"
                              disabled
                            >
                              <BsArrowClockwise className="h-[20px] w-[20px]" />
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
        onAdd={handleCreateItemClick}
        onEdit={handleEditItemClick}
        onDelete={handleDeleteItemClick}
      />

      <ProductoItemSheet
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        onSubmit={handleSubmitItem}
        mode={sheetMode}
        initialValues={toProductoItemFormInputValues(selectedItem)}
        submitLabel={sheetMode === "edit" ? "Guardar" : "Guardar Item"}
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
