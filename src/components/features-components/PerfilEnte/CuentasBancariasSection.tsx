"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
  type CuentaBancariaEnte,
  type CuentaBancariaEnteFormValues,
} from "@/lib/constants/cuentasBancariasEnte";
import type { CuentaBancariaEnteFormSchemaValues } from "@/lib/schemas/cuentasBancariasEnteSchema";
import {
  cuentaBancariaFormToApi,
  cuentaBancariaFromApi,
} from "@/lib/utils/fase1MicromodulosMapper";
import {
  actualizarCuentaBancariaEnte,
  crearCuentaBancariaEnte,
  eliminarCuentaBancariaEnte,
  listarCuentasBancariasEnte,
} from "@/services/enteService";
import { CuentaBancariaModal } from "./CuentaBancariaModal";
import { CuentasBancariasTable } from "./CuentasBancariasTable";

export interface CuentasBancariasSectionProps {
  enteId: string;
  readOnly?: boolean;
}

export function CuentasBancariasSection({
  enteId,
  readOnly = false,
}: CuentasBancariasSectionProps) {
  const [hydrated, setHydrated] = useState(false);
  const [cuentas, setCuentas] = useState<CuentaBancariaEnte[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CuentaBancariaEnte | null>(null);
  const [toDelete, setToDelete] = useState<CuentaBancariaEnte | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const items = await listarCuentasBancariasEnte(enteId);
      setCuentas(items.map(cuentaBancariaFromApi));
    } catch {
      setCuentas([]);
    }
  }, [enteId]);

  useEffect(() => {
    void refresh().finally(() => setHydrated(true));
  }, [refresh]);

  const handleAdd = () => {
    if (readOnly) return;
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item: CuentaBancariaEnte) => {
    if (readOnly) return;
    setEditing(item);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CuentaBancariaEnteFormSchemaValues) => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      if (editing) {
        await actualizarCuentaBancariaEnte(enteId, editing.id, cuentaBancariaFormToApi(values));
        toast.success("Cuenta bancaria actualizada.");
      } else {
        await crearCuentaBancariaEnte(enteId, cuentaBancariaFormToApi(values));
        toast.success("Cuenta bancaria registrada.");
      }
      await refresh();
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la cuenta.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (readOnly || !toDelete) return;
    setIsDeleting(true);
    try {
      await eliminarCuentaBancariaEnte(enteId, toDelete.id);
      await refresh();
      toast.success("Cuenta bancaria eliminada.");
      setToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la cuenta.");
    } finally {
      setIsDeleting(false);
    }
  };

  const initialValues: CuentaBancariaEnteFormValues | undefined = editing
    ? {
        bancoPagoPliego: editing.bancoPagoPliego,
        cuentaPagoPliego: editing.cuentaPagoPliego,
        titularPagoPliego: editing.titularPagoPliego,
        rifPagoPliego: editing.rifPagoPliego,
        tipoCuentaPagoPliego: editing.tipoCuentaPagoPliego,
      }
    : undefined;

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Cargando cuentas bancarias…
      </div>
    );
  }

  return (
    <>
      <CuentasBancariasTable
        items={cuentas}
        readOnly={readOnly}
        onAdd={handleAdd}
        onEdit={readOnly ? undefined : handleEdit}
        onDelete={readOnly ? undefined : setToDelete}
      />

      <CuentaBancariaModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditing(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        initialValues={initialValues}
      />

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuenta bancaria</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar la cuenta de {toDelete?.bancoPagoPliego}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>No</AlertDialogCancel>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "Eliminando…" : "Sí"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
