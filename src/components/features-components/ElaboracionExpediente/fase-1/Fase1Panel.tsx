"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Download, Eye, FileText, FileUp, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

import type { ProductoItemFormValues } from "@/lib/schemas/fase1Schema";
import {
  crearPresupuestoItem,
  listarPresupuestoItems,
  obtenerFasePreparatoria,
} from "@/services/fase1Service";
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
import { PresupuestoItemsTable } from "./PresupuestoItemsTable";
import { ProductoItemSheet } from "./ProductoItemSheet";

interface Fase1PanelProps {
  expedienteId: string;
  fase1Creada?: boolean;
}

interface DocumentoProcedimiento {
  id: string;
  label: string;
}

const DOCUMENTOS_PROCEDIMIENTO: DocumentoProcedimiento[] = [
  { id: "acta-inicio", label: "Acta de Inicio" },
  { id: "pliego-condiciones", label: "Pliego de Condiciones" },
  { id: "llamado-participar", label: "Llamado a participar" },
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
        Completa la fase preparatoria para visualizar la definición técnica y financiera del
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
      {value ? "Sí" : "No"}
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
        <h3 className="text-base font-semibold text-heading-dark">Características técnicas</h3>
        <EmptyText>{fasePreparatoria.detallesTecnicosCalidad}</EmptyText>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-heading-dark">Cantidades y alcance</h3>
        <EmptyText>{fasePreparatoria.alcanceCantidadesObra}</EmptyText>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-heading-dark">Ventajas económicas/técnicas</h3>
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
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [loadingFasePreparatoria, setLoadingFasePreparatoria] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPanelData = async () => {
      setLoading(true);
      setLoadingFasePreparatoria(true);

      const [presupuestoResult, fasePreparatoriaResult] = await Promise.allSettled([
        listarPresupuestoItems(expedienteId, {
          page,
          limit,
        }),
        obtenerFasePreparatoria(expedienteId),
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
            : "No se pudo cargar la información de la fase preparatoria."
        );
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
    ? "Todavía no hay productos registrados para este expediente."
    : "La tabla de presupuesto se habilitará cuando se complete el formulario de la Fase 1.";
  const fase1Href = fasePreparatoria?.id
    ? `/elaboracion-expediente/${expedienteId}/fase-1?fase1Id=${fasePreparatoria.id}`
    : `/elaboracion-expediente/${expedienteId}/fase-1`;

  const handleAddItem = async (values: ProductoItemFormValues) => {
    setIsSavingItem(true);

    try {
      await crearPresupuestoItem(expedienteId, values);
      setIsSheetOpen(false);
      toast.success("Ítem agregado al presupuesto base.");

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
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el ítem.");
      throw error;
    } finally {
      setIsSavingItem(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild className="bg-navy font-semibold text-white shadow-sm hover:bg-navy-hover">
          <Link href={fase1Href}>
            {fasePreparatoria ? "Editar fase de preparación" : "Iniciar fase de preparación"}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.9fr)]">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <Settings2 className="h-5 w-5 text-navy" />
              Definición técnica y financiera
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
                  No se pudo interpretar la información de la Fase 1 para este expediente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-heading-dark">
              <FileText className="h-5 w-5 text-navy" />
              Documentos del Procedimiento
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {DOCUMENTOS_PROCEDIMIENTO.map((documento) => (
              <div
                key={documento.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{documento.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Ver ${documento.label}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Descargar ${documento.label}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Regenerar ${documento.label}`}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <PresupuestoItemsTable
        items={items}
        readOnly
        showAddButton
        addButtonDisabled={loading || !canAddItems}
        addButtonLabel="Añadir ítem"
        emptyTitle="Sin ítems cargados"
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
    </div>
  );
}
