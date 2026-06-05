"use client";

import type { PresupuestoItemRecord } from "@/types/fase1.types";
import { FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import { Fase1SectionHeader } from "../Fase1SectionHeader";
import { PresupuestoItemsTable } from "../PresupuestoItemsTable";

interface Paso2PresupuestoStepProps {
  items: PresupuestoItemRecord[];
  onAddItem: () => void;
}

const compactSectionTitleClass = "text-[17px] font-bold text-color-titulos";
const compactSectionDescriptionClass = "text-[12px] text-muted-foreground italic leading-relaxed";

export function Paso2PresupuestoStep({ items, onAddItem }: Paso2PresupuestoStepProps) {
  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Definicion tecnica y financiera"
        description={FASE1_SECTION_DESCRIPTIONS[2]}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className={compactSectionTitleClass}>Estructura del presupuesto base</h3>
          <p className={compactSectionDescriptionClass}>
            Articulos 6.16, 58, 59 LCP; 7, 91, 93, 94 RLCP; 38.1.2, 91.1.12 LOCGR; 24 lit. C Normas
            de Control Interno SUNAI.
          </p>
        </div>

        <PresupuestoItemsTable
          items={items}
          showAddButton
          addButtonLabel="Agregar item"
          onAdd={onAddItem}
          emptyTitle="Sin items cargados"
          emptyDescription="Agregue al menos un producto para continuar con la construccion del presupuesto base."
        />
      </div>
    </div>
  );
}
