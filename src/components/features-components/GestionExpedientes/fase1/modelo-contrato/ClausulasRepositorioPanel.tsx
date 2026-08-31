"use client";

import { Check, GripVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";

import type { ClausulaBase } from "@/lib/constants/modeloContrato";
import { MODELO_CONTRATO_REPO_TITLE } from "@/lib/constants/modeloContrato";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type RepoFilter = "todas" | "generica" | "biblioteca";

export const MODELO_CONTRATO_DND_CLAUSE = "application/x-modelo-clausula";

interface ClausulasRepositorioPanelProps {
  clauses: ClausulaBase[];
  filter: RepoFilter;
  search: string;
  addedSourceIds: Set<string>;
  readOnly?: boolean;
  onFilterChange: (filter: RepoFilter) => void;
  onSearchChange: (value: string) => void;
  onAdd: (clause: ClausulaBase) => void;
  onReview: (clause: ClausulaBase) => void;
  onRemoveFromBiblioteca?: (clauseId: string) => void;
  onCreateCustom: () => void;
}

const FILTERS: { id: RepoFilter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "generica", label: "Genéricas" },
  { id: "biblioteca", label: "Biblioteca" },
];

export function ClausulasRepositorioPanel({
  clauses,
  filter,
  search,
  addedSourceIds,
  readOnly = false,
  onFilterChange,
  onSearchChange,
  onAdd,
  onReview,
  onRemoveFromBiblioteca,
  onCreateCustom,
}: ClausulasRepositorioPanelProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-border bg-card md:w-[34%] md:min-w-[320px]">
      <div className="shrink-0 space-y-3 border-b border-border bg-muted/40 p-4">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-color-titulos">
          {MODELO_CONTRATO_REPO_TITLE}
        </h2>

        <div className="relative">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cláusula..."
            className="h-9 pl-9"
          />
        </div>

        <div className="flex gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(item.id)}
              className={cn(
                "flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors",
                filter === item.id
                  ? "bg-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {clauses.length === 0 ? (
          <p className="py-8 text-center text-xs italic text-muted-foreground">
            No hay cláusulas en este filtro.
          </p>
        ) : (
          clauses.map((clause) => {
            const alreadyAdded = addedSourceIds.has(clause.id);
            const canDrag = !readOnly && !alreadyAdded;
            const canRemoveBiblioteca =
              !readOnly && clause.origen === "biblioteca" && Boolean(onRemoveFromBiblioteca);

            return (
              <div
                key={clause.id}
                draggable={canDrag}
                onDragStart={(event) => {
                  if (!canDrag) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.setData(MODELO_CONTRATO_DND_CLAUSE, clause.id);
                  event.dataTransfer.setData("text/plain", clause.id);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => {
                  if (readOnly || alreadyAdded) return;
                  onReview(clause);
                }}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow",
                  canDrag && "cursor-grab hover:shadow-md active:cursor-grabbing",
                  alreadyAdded && "border-navy/30 bg-muted/30"
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {canDrag ? (
                        <GripVertical
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      ) : null}
                      <p className="text-[12px] font-bold leading-snug text-color-titulos transition-colors group-hover:text-navy">
                        {clause.titulo}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md text-[9px] uppercase",
                        clause.kind === "preceptiva"
                          ? "border-navy/30 bg-muted text-navy"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {clause.kind === "preceptiva" ? "Preceptiva" : "Facultativa"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {canRemoveBiblioteca ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-border text-destructive hover:bg-muted"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveFromBiblioteca?.(clause.id);
                        }}
                        aria-label="Quitar de la biblioteca"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="icon"
                      disabled={readOnly || alreadyAdded}
                      onClick={(event) => {
                        event.stopPropagation();
                        onAdd(clause);
                      }}
                      className={cn(
                        "h-8 w-8 shrink-0",
                        alreadyAdded
                          ? "bg-success text-white hover:bg-success"
                          : "bg-navy text-white hover:bg-navy-hover"
                      )}
                      aria-label={alreadyAdded ? "Ya agregada" : "Agregar cláusula"}
                    >
                      {alreadyAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {clause.basamentoLegal ? (
                  <p className="line-clamp-2 text-[10px] italic leading-relaxed text-muted-foreground">
                    {clause.basamentoLegal}
                  </p>
                ) : null}

                {!readOnly && !alreadyAdded ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-sm">
                      <Pencil className="h-3.5 w-3.5" />
                      Revisar y Agregar
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {!readOnly ? (
        <div className="shrink-0 border-t border-border bg-card p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCreateCustom}
            className="w-full border-dashed border-navy text-navy hover:bg-muted"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Crear cláusula personalizada
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
