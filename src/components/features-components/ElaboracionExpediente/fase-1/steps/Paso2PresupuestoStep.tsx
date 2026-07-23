"use client";

import type { ProductoItemFormValues } from "@/lib/schemas/fase1Schema";
import type { PresupuestoItemRecord } from "@/types/fase1.types";
import { FASE1_SECTION_DESCRIPTIONS } from "@/lib/constants/fase1";
import { Fase1SectionHeader } from "../Fase1SectionHeader";
import { PresupuestoItemsTable } from "../PresupuestoItemsTable";
import { ProductoItemInlineForm } from "../ProductoItemInlineForm";

interface Paso2PresupuestoStepProps {
  items: PresupuestoItemRecord[];
  onAddItem: (data: ProductoItemFormValues) => Promise<void> | void;
  onDeleteItem?: (item: PresupuestoItemRecord) => void;
  isSubmitting?: boolean;
}

const compactSectionTitleClass = "text-[17px] font-bold text-color-titulos";
const compactSectionDescriptionClass = "text-[12px] text-muted-foreground italic leading-relaxed";

export function Paso2PresupuestoStep({
  items,
  onAddItem,
  onDeleteItem,
  isSubmitting = false,
}: Paso2PresupuestoStepProps) {
  return (
    <div className="space-y-6">
      <Fase1SectionHeader
        title="Definicion tecnica y financiera"
        description={FASE1_SECTION_DESCRIPTIONS[2]}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className={compactSectionTitleClass}>Estructura del presupuesto base:</h3>
          <p className={compactSectionDescriptionClass}>
            Artículos 6.16, 58, 59 LCP; 7, 91, 93, 94 RLCP; 38.1.2, 91.1.12 LOCGR; 24 LIT. C NORMAS
            DE CONTROL INTERNO SUNAI.
          </p>
        </div>

        <ProductoItemInlineForm onSubmit={onAddItem} isSubmitting={isSubmitting} />

        <PresupuestoItemsTable
          items={items}
          onDelete={onDeleteItem}
          emptyTitle="Sin items cargados"
          emptyDescription="Agregue al menos un producto para continuar con la construccion del presupuesto base."
        />
      </div>
    </div>
  );
}
