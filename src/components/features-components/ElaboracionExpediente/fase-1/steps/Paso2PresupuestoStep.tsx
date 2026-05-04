"use client";

import type { PresupuestoItemRecord } from "@/types/fase1.types";
import { FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import { Fase1SectionHeader } from "../Fase1SectionHeader";
import { PresupuestoItemsTable } from "../PresupuestoItemsTable";

interface Paso2PresupuestoStepProps {
  items: PresupuestoItemRecord[];
  onAddItem: () => void;
}

export function Paso2PresupuestoStep({ items, onAddItem }: Paso2PresupuestoStepProps) {
  return (
    <div className="space-y-8">
      <Fase1SectionHeader
        title="Definición técnica y financiera"
        description={FASE1_SECTION_DESCRIPTIONS[2]}
      />

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#215ea8]">Estructura del presupuesto base</h3>
          <p className="text-sm italic text-slate-500">
            Artículos 6.16, 58, 59 LCP; 7, 91, 93, 94 RLCP; 38.1.2, 91.1.12 LOCGR; 24 LIT. C NORMAS
            DE CONTROL INTERNO SUNAI.
          </p>
        </div>

        <PresupuestoItemsTable
          items={items}
          showAddButton
          addButtonLabel="Agregar Item"
          onAdd={onAddItem}
          emptyTitle="Sin ítems cargados"
          emptyDescription="Agregue al menos un producto para continuar con la construcción del presupuesto base."
        />
      </div>
    </div>
  );
}
