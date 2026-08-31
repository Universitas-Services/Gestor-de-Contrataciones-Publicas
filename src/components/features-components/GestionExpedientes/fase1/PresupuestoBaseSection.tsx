"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type {
  ProductoItemFormInputValues,
  ProductoItemFormValues,
} from "@/lib/schemas/fase1Schema";
import {
  actualizarPresupuestoItem,
  crearPresupuestoItem,
  eliminarPresupuestoItem,
  listarPresupuestoItems,
} from "@/services/fase1Service";
import type {
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
import { Button } from "@/components/ui/button";
import { ProductoItemModal } from "@/components/features-components/ElaboracionExpediente/fase-1/ProductoItemModal";
import { PresupuestoItemsTable } from "@/components/features-components/ElaboracionExpediente/fase-1/PresupuestoItemsTable";
import type { MicromoduleStatus } from "./types/fase1Inicial.types";

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

export interface PresupuestoBaseSectionProps {
  expedienteId: string;
  readOnly?: boolean;
  micromoduleStatus: MicromoduleStatus;
  onItemsChange?: (hasItems: boolean) => void;
  createModalOpen?: boolean;
  onCreateModalOpenChange?: (open: boolean) => void;
}

export function PresupuestoBaseSection({
  expedienteId,
  readOnly = false,
  micromoduleStatus,
  onItemsChange,
  createModalOpen,
  onCreateModalOpenChange,
}: PresupuestoBaseSectionProps) {
  const [items, setItems] = useState<PresupuestoItemRecord[]>([]);
  const [meta, setMeta] = useState<PresupuestoItemsMeta>(DEFAULT_META);
  const [totales, setTotales] = useState<PresupuestoItemsTotals>(DEFAULT_TOTALS);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [internalSheetOpen, setInternalSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<PresupuestoItemRecord | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PresupuestoItemRecord | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const isLocked = micromoduleStatus === "locked";
  const canAddItems = !isLocked;
  const isSheetOpen = createModalOpen ?? internalSheetOpen;
  const setIsSheetOpen = onCreateModalOpenChange ?? setInternalSheetOpen;

  const applyPresupuestoItems = useCallback(
    (response: ListarPresupuestoItemsResponse) => {
      setItems(response.items);
      setMeta(response.meta);
      setTotales(response.totales);
      setPage((currentPage) =>
        currentPage === response.meta.page ? currentPage : response.meta.page
      );
      onItemsChange?.(response.meta.total > 0);
    },
    [onItemsChange]
  );

  const reloadPresupuestoItems = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      try {
        const response = await listarPresupuestoItems(expedienteId, {
          page: targetPage,
          limit,
        });
        applyPresupuestoItems(response);
      } catch (error) {
        setItems([]);
        setMeta(DEFAULT_META);
        setTotales(DEFAULT_TOTALS);
        onItemsChange?.(false);
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el presupuesto base del expediente."
        );
      } finally {
        setLoading(false);
      }
    },
    [applyPresupuestoItems, expedienteId, limit, onItemsChange, page]
  );

  useEffect(() => {
    if (isLocked) {
      setLoading(false);
      return;
    }
    void reloadPresupuestoItems();
  }, [isLocked, reloadPresupuestoItems]);

  const emptyDescription = canAddItems
    ? "Todavia no hay productos registrados para este expediente."
    : "La tabla de presupuesto se habilitara cuando se complete Actividades Previas.";

  const resetSheetState = () => {
    setSheetMode("create");
    setSelectedItem(null);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) resetSheetState();
  };

  const handleEditItemClick = (item: PresupuestoItemRecord) => {
    if (readOnly || !canAddItems) return;
    setSheetMode("edit");
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleDeleteItemClick = (item: PresupuestoItemRecord) => {
    if (readOnly || !canAddItems) return;
    setItemToDelete(item);
  };

  const handleSubmitItem = async (values: ProductoItemFormValues) => {
    if (readOnly || !canAddItems) return;
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
    if (readOnly || !canAddItems || !itemToDelete) return;
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

  return (
    <>
      <PresupuestoItemsTable
        items={items}
        readOnly={readOnly || isLocked}
        hideHeader
        showAddButton={false}
        emptyTitle="Sin items cargados"
        emptyDescription={emptyDescription}
        loading={loading && !isLocked}
        serverPagination={{
          currentPage: meta.page,
          totalPages: meta.lastPage,
          onPageChange: setPage,
        }}
        serverTotals={totales}
        onEdit={readOnly || isLocked ? undefined : handleEditItemClick}
        onDelete={readOnly || isLocked ? undefined : handleDeleteItemClick}
      />

      <ProductoItemModal
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        onSubmit={handleSubmitItem}
        mode={sheetMode}
        initialValues={toProductoItemFormInputValues(selectedItem)}
        submitLabel={sheetMode === "edit" ? "Guardar" : "Guardar Ítem"}
        isSubmitting={isSavingItem}
        enableUnidadMedidaAvanzada
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
              onClick={() => void handleConfirmDelete()}
              disabled={isDeletingItem}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeletingItem ? "Eliminando..." : "Si"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
