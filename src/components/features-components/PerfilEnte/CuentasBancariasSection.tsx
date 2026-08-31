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
  createCuentaBancariaId,
  getCuentasBancariasEnteStorageKey,
  loadCuentasBancariasEnte,
  type CuentaBancariaEnte,
  type CuentaBancariaEnteFormValues,
} from "@/lib/constants/cuentasBancariasEnte";
import type { CuentaBancariaEnteFormSchemaValues } from "@/lib/schemas/cuentasBancariasEnteSchema";
import { CuentaBancariaModal } from "./CuentaBancariaModal";
import { CuentasBancariasTable } from "./CuentasBancariasTable";

function persistCuentas(enteId: string, cuentas: CuentaBancariaEnte[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getCuentasBancariasEnteStorageKey(enteId), JSON.stringify(cuentas));
}

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

  useEffect(() => {
    setCuentas(loadCuentasBancariasEnte(enteId));
    setHydrated(true);
  }, [enteId]);

  const commit = useCallback(
    (next: CuentaBancariaEnte[]) => {
      setCuentas(next);
      persistCuentas(enteId, next);
    },
    [enteId]
  );

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
        const next = cuentas.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                ...values,
              }
            : c
        );
        commit(next);
        toast.success("Cuenta bancaria actualizada.");
      } else {
        const nueva: CuentaBancariaEnte = {
          id: createCuentaBancariaId(),
          ...values,
          createdAt: new Date().toISOString(),
        };
        commit([nueva, ...cuentas]);
        toast.success("Cuenta bancaria registrada.");
      }
      setModalOpen(false);
      setEditing(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = () => {
    if (readOnly || !toDelete) return;
    setIsDeleting(true);
    try {
      commit(cuentas.filter((c) => c.id !== toDelete.id));
      toast.success("Cuenta bancaria eliminada.");
      setToDelete(null);
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
              onClick={handleConfirmDelete}
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
