"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileSignature, FolderOpen, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import type { ClausulaEnModelo } from "@/lib/constants/modeloContrato";
import { MODELO_CONTRATO_DOC_TITLE } from "@/lib/constants/modeloContrato";
import { clausulaOrdinalLabel } from "@/lib/utils/clausulaOrdinales";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MODELO_CONTRATO_DND_CLAUSE } from "./ClausulasRepositorioPanel";

interface ModeloContratoDocumentoPanelProps {
  clauses: ClausulaEnModelo[];
  expedienteLabel?: string;
  readOnly?: boolean;
  onEdit: (clause: ClausulaEnModelo) => void;
  onReorder: (orderedInstanceIds: string[]) => void;
  onRemove: (instanceId: string) => void;
  onDropFromRepo: (clauseId: string, beforeInstanceId?: string) => void;
  onCreateCustom: () => void;
}

function stripHtmlPreview(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SortableClauseCardProps {
  clause: ClausulaEnModelo;
  order: number;
  readOnly?: boolean;
  onEdit: (clause: ClausulaEnModelo) => void;
  onRemove: (instanceId: string) => void;
}

function SortableClauseCard({
  clause,
  order,
  readOnly = false,
  onEdit,
  onRemove,
}: SortableClauseCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: clause.instanceId,
    disabled: readOnly,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative touch-none rounded-lg border border-border bg-card p-4 shadow-sm",
        !readOnly && "cursor-grab active:cursor-grabbing hover:border-navy/40",
        isDragging && "z-20 border-navy opacity-90 shadow-md"
      )}
      {...attributes}
      {...(readOnly ? {} : listeners)}
    >
      {!readOnly ? (
        <div className="pointer-events-none absolute top-3 -left-1 flex flex-col gap-1 opacity-70 transition-opacity group-hover:opacity-100 md:-left-9">
          <span
            className="flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground shadow-sm"
            aria-hidden
          >
            <GripVertical className="h-3.5 w-3.5" />
          </span>
          <button
            type="button"
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-destructive shadow-sm hover:bg-destructive/10"
            title="Quitar"
            aria-label="Quitar del contrato"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(clause.instanceId);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h3 className="min-w-0 text-[13px] font-bold text-color-titulos">
          <span className="text-navy">CLÁUSULA {clausulaOrdinalLabel(order)}:</span>{" "}
          <span className="uppercase">{clause.titulo}</span>
        </h3>
        {!readOnly ? (
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(clause);
            }}
            className="text-[10px] font-bold uppercase text-navy opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
          >
            <span className="inline-flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              Editar
            </span>
          </button>
        ) : null}
      </div>
      <p className="line-clamp-4 text-[12px] leading-relaxed text-muted-foreground">
        {stripHtmlPreview(clause.cuerpoHtml) || "Sin redacción."}
      </p>
    </article>
  );
}

export function ModeloContratoDocumentoPanel({
  clauses,
  expedienteLabel,
  readOnly = false,
  onEdit,
  onReorder,
  onRemove,
  onDropFromRepo,
  onCreateCustom,
}: ModeloContratoDocumentoPanelProps) {
  const sorted = useMemo(() => [...clauses].sort((a, b) => a.order - b.order), [clauses]);
  const itemIds = useMemo(() => sorted.map((c) => c.instanceId), [sorted]);
  const [isRepoDragOver, setIsRepoDragOver] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(itemIds, oldIndex, newIndex));
  };

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-muted/30">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-color-titulos">
          <FileSignature className="h-4 w-4 text-navy" />
          {MODELO_CONTRATO_DOC_TITLE}
        </h2>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? "Cláusula" : "Cláusulas"}
        </span>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
        onDragOver={(event) => {
          if (readOnly) return;
          const types = Array.from(event.dataTransfer.types);
          if (types.includes(MODELO_CONTRATO_DND_CLAUSE) || types.includes("text/plain")) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setIsRepoDragOver(true);
          }
        }}
        onDragLeave={() => setIsRepoDragOver(false)}
        onDrop={(event) => {
          if (readOnly) return;
          event.preventDefault();
          setIsRepoDragOver(false);
          const repoId =
            event.dataTransfer.getData(MODELO_CONTRATO_DND_CLAUSE) ||
            event.dataTransfer.getData("text/plain");
          if (repoId) onDropFromRepo(repoId);
        }}
      >
        <div
          className={cn(
            "mx-auto min-h-[420px] w-full max-w-3xl rounded-sm border border-border bg-card p-6 shadow-sm transition-colors md:p-8",
            isRepoDragOver && "border-navy border-dashed bg-muted/50"
          )}
        >
          <div className="mb-6 border-b-2 border-foreground/80 pb-3 text-center">
            <h1 className="text-lg font-bold tracking-wide text-color-titulos uppercase">
              Contrato de Procedimiento
            </h1>
            {expedienteLabel ? (
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Expediente N° {expedienteLabel}
              </p>
            ) : null}
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/40 py-16 text-center">
              <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">El contrato está vacío.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Arrastra cláusulas del repositorio o usa &quot;Revisar y Agregar&quot;.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {sorted.map((clause, index) => (
                    <SortableClauseCard
                      key={clause.instanceId}
                      clause={clause}
                      order={index + 1}
                      readOnly={readOnly}
                      onEdit={onEdit}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {!readOnly ? (
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCreateCustom}
                className="w-full border-dashed border-navy text-navy hover:bg-muted"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Agregar cláusula nueva
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
