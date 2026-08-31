"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileSignature } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getClausulasBibliotecaEnteStorageKey,
  getModeloContratoFormStorageKey,
  MODELO_CONTRATO_CONFIRM_DESCRIPTION,
  MODELO_CONTRATO_CONFIRM_TITLE,
  MODELO_CONTRATO_DRAFT_LABEL,
  MODELO_CONTRATO_SUBMIT_LABEL,
  MODELO_CONTRATO_SUCCESS_DESCRIPTION,
  MODELO_CONTRATO_SUCCESS_TITLE,
  MODELO_CONTRATO_WIZARD_DESCRIPTION,
  MODELO_CONTRATO_WIZARD_TITLE,
  type ClausulaBase,
  type ClausulaBibliotecaItem,
  type ClausulaEnModelo,
  type ModeloContratoStoredForm,
} from "@/lib/constants/modeloContrato";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { listarClausulasGenericas } from "@/services/clausulasModeloService";
import { useFase1InicialState } from "@/components/features-components/GestionExpedientes/fase1/hooks/useFase1InicialState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ClausulaEditorDialog,
  type ClausulaEditorMode,
  type ClausulaEditorSavePayload,
} from "./ClausulaEditorDialog";
import { ClausulasRepositorioPanel, type RepoFilter } from "./ClausulasRepositorioPanel";
import { ModeloContratoDocumentoPanel } from "./ModeloContratoDocumentoPanel";

export interface ModeloContratoFormProps {
  expedienteId: string;
  enteId?: string;
  readOnly?: boolean;
  basePath?: string;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Asigna order 1..n según el orden del array (no reordena). */
function reindexOrders(clauses: ClausulaEnModelo[]): ClausulaEnModelo[] {
  return clauses.map((clause, index) => ({ ...clause, order: index + 1 }));
}

function sortByOrder(clauses: ClausulaEnModelo[]): ClausulaEnModelo[] {
  return [...clauses].sort((a, b) => a.order - b.order);
}

function loadStoredForm(expedienteId: string): ModeloContratoStoredForm {
  if (typeof window === "undefined") {
    return { clauses: [], status: "draft" };
  }
  try {
    const raw = window.localStorage.getItem(getModeloContratoFormStorageKey(expedienteId));
    if (!raw) return { clauses: [], status: "draft" };
    const parsed = JSON.parse(raw) as ModeloContratoStoredForm;
    return {
      clauses: Array.isArray(parsed.clauses) ? parsed.clauses : [],
      status: parsed.status === "completed" ? "completed" : "draft",
    };
  } catch {
    return { clauses: [], status: "draft" };
  }
}

function persistForm(expedienteId: string, payload: ModeloContratoStoredForm) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    getModeloContratoFormStorageKey(expedienteId),
    JSON.stringify(payload)
  );
}

function loadBiblioteca(enteId: string): ClausulaBibliotecaItem[] {
  if (typeof window === "undefined" || !enteId) return [];
  try {
    const raw = window.localStorage.getItem(getClausulasBibliotecaEnteStorageKey(enteId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClausulaBibliotecaItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBiblioteca(enteId: string, items: ClausulaBibliotecaItem[]) {
  if (typeof window === "undefined" || !enteId) return;
  window.localStorage.setItem(getClausulasBibliotecaEnteStorageKey(enteId), JSON.stringify(items));
}

function bibliotecaToBase(item: ClausulaBibliotecaItem): ClausulaBase {
  return {
    id: item.id,
    titulo: item.titulo,
    cuerpoHtml: item.cuerpoHtml,
    basamentoLegal: item.basamentoLegal,
    kind: "facultativa",
    origen: "biblioteca",
  };
}

export function ModeloContratoForm({
  expedienteId,
  enteId = "",
  readOnly = false,
  basePath = "/gestion-expedientes",
}: ModeloContratoFormProps) {
  const router = useRouter();
  const { completeMicromodule, saveMicromoduleDraft } = useFase1InicialState(expedienteId);

  const [hydrated, setHydrated] = useState(false);
  const [genericas, setGenericas] = useState<ClausulaBase[]>([]);
  const [biblioteca, setBiblioteca] = useState<ClausulaBibliotecaItem[]>([]);
  const [clauses, setClauses] = useState<ClausulaEnModelo[]>([]);
  const [filter, setFilter] = useState<RepoFilter>("todas");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<ClausulaEditorMode>("edit");
  const [editingClause, setEditingClause] = useState<ClausulaBase | ClausulaEnModelo | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [seed, stored, biblio] = await Promise.all([
        listarClausulasGenericas(),
        Promise.resolve(loadStoredForm(expedienteId)),
        Promise.resolve(loadBiblioteca(enteId)),
      ]);
      if (cancelled) return;
      setGenericas(seed);
      setBiblioteca(biblio);
      setClauses(reindexOrders(sortByOrder(stored.clauses)));
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [enteId, expedienteId]);

  const goToPanel = useCallback(() => {
    router.push(expedienteFase1TabPath(basePath, expedienteId));
  }, [basePath, expedienteId, router]);

  const addedSourceIds = useMemo(() => {
    return new Set(clauses.map((c) => c.id));
  }, [clauses]);

  const repoClauses = useMemo(() => {
    const fromBiblioteca = biblioteca.map(bibliotecaToBase);
    let pool: ClausulaBase[] = [];
    if (filter === "generica") pool = genericas;
    else if (filter === "biblioteca") pool = fromBiblioteca;
    else pool = [...genericas, ...fromBiblioteca];

    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) || (c.basamentoLegal?.toLowerCase().includes(q) ?? false)
    );
  }, [biblioteca, filter, genericas, search]);

  const findRepoClause = useCallback(
    (clauseId: string): ClausulaBase | undefined => {
      return (
        genericas.find((c) => c.id === clauseId) ??
        biblioteca.map(bibliotecaToBase).find((c) => c.id === clauseId)
      );
    },
    [biblioteca, genericas]
  );

  const handleAdd = (clause: ClausulaBase, beforeInstanceId?: string) => {
    if (readOnly || addedSourceIds.has(clause.id)) return;
    setClauses((prev) => {
      const sorted = sortByOrder(prev);
      const nextItem: ClausulaEnModelo = {
        ...clause,
        instanceId: createId(),
        order: sorted.length + 1,
      };
      if (!beforeInstanceId) {
        return reindexOrders([...sorted, nextItem]);
      }
      const index = sorted.findIndex((c) => c.instanceId === beforeInstanceId);
      if (index < 0) return reindexOrders([...sorted, nextItem]);
      const next = [...sorted];
      next.splice(index, 0, nextItem);
      return reindexOrders(next);
    });
  };

  const handleDropFromRepo = (clauseId: string, beforeInstanceId?: string) => {
    const clause = findRepoClause(clauseId);
    if (!clause) return;
    handleAdd(clause, beforeInstanceId);
  };

  const handleRemove = (instanceId: string) => {
    setClauses((prev) =>
      reindexOrders(sortByOrder(prev).filter((c) => c.instanceId !== instanceId))
    );
  };

  const handleReorder = (orderedInstanceIds: string[]) => {
    setClauses((prev) => {
      const byId = new Map(prev.map((c) => [c.instanceId, c]));
      const reordered = orderedInstanceIds
        .map((id) => byId.get(id))
        .filter((c): c is ClausulaEnModelo => Boolean(c));
      // Respeta el orden del array (posición tras el drag); recalcula PRIMERA, SEGUNDA…
      return reindexOrders(reordered);
    });
  };

  const handleRemoveFromBiblioteca = (clauseId: string) => {
    if (!enteId) return;
    const nextBiblio = biblioteca.filter((item) => item.id !== clauseId);
    setBiblioteca(nextBiblio);
    persistBiblioteca(enteId, nextBiblio);
    toast.success("Cláusula eliminada de la Biblioteca del Ente.");
  };

  const openCreate = () => {
    setEditorMode("create");
    setEditingClause({
      id: createId(),
      instanceId: createId(),
      titulo: "",
      cuerpoHtml: "<p></p>",
      kind: "facultativa",
      origen: "custom",
      order: clauses.length + 1,
    });
    setEditorOpen(true);
  };

  const openReview = (clause: ClausulaBase) => {
    if (readOnly || addedSourceIds.has(clause.id)) return;
    setEditorMode("review");
    setEditingClause(clause);
    setEditorOpen(true);
  };

  const openEdit = (clause: ClausulaEnModelo) => {
    setEditorMode("edit");
    setEditingClause(clause);
    setEditorOpen(true);
  };

  const handleEditorSave = (payload: ClausulaEditorSavePayload) => {
    if (editorMode === "create" && editingClause) {
      setClauses((prev) =>
        reindexOrders([
          ...sortByOrder(prev),
          {
            id: editingClause.id,
            instanceId:
              "instanceId" in editingClause && editingClause.instanceId
                ? editingClause.instanceId
                : createId(),
            titulo: payload.titulo,
            cuerpoHtml: payload.cuerpoHtml,
            basamentoLegal: editingClause.basamentoLegal,
            variablesSugeridas: editingClause.variablesSugeridas,
            origen: "custom",
            kind: "facultativa",
            order: prev.length + 1,
          },
        ])
      );
    } else if (editorMode === "review" && editingClause) {
      if (addedSourceIds.has(editingClause.id)) {
        toast.error("Esta cláusula ya está en el modelo.");
      } else {
        setClauses((prev) =>
          reindexOrders([
            ...sortByOrder(prev),
            {
              ...editingClause,
              titulo: payload.titulo,
              cuerpoHtml: payload.cuerpoHtml,
              instanceId: createId(),
              order: prev.length + 1,
            },
          ])
        );
      }
    } else if (editorMode === "edit" && editingClause && "instanceId" in editingClause) {
      setClauses((prev) =>
        prev.map((c) =>
          c.instanceId === editingClause.instanceId
            ? { ...c, titulo: payload.titulo, cuerpoHtml: payload.cuerpoHtml }
            : c
        )
      );
    }

    if (payload.saveToBiblioteca && enteId) {
      const item: ClausulaBibliotecaItem = {
        id: createId(),
        titulo: payload.titulo,
        cuerpoHtml: payload.cuerpoHtml,
        basamentoLegal: editingClause?.basamentoLegal,
        savedAt: new Date().toISOString(),
      };
      const nextBiblio = [item, ...biblioteca];
      setBiblioteca(nextBiblio);
      persistBiblioteca(enteId, nextBiblio);
      toast.success("Cláusula guardada en la Biblioteca del Ente.");
    }

    setEditorOpen(false);
    setEditingClause(null);
  };

  const handleSaveDraft = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persistForm(expedienteId, { clauses, status: "draft" });
      saveMicromoduleDraft("modelo-contrato");
      toast.success("Borrador del modelo de contrato guardado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmGenerate = () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      persistForm(expedienteId, { clauses, status: "completed" });
      completeMicromodule("modelo-contrato");
      setConfirmOpen(false);
      setSuccessOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Cargando modelo de contrato...
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-start gap-3 border-b border-border bg-card px-4 py-4 md:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
          <FileSignature className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-1">
          <h1 className="text-[20px] font-bold leading-tight text-color-titulos md:text-[22px]">
            {MODELO_CONTRATO_WIZARD_TITLE}
          </h1>
          <p className="text-[12px] italic leading-relaxed text-muted-foreground">
            {MODELO_CONTRATO_WIZARD_DESCRIPTION}
          </p>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-220px)] flex-col md:flex-row">
        <ClausulasRepositorioPanel
          clauses={repoClauses}
          filter={filter}
          search={search}
          addedSourceIds={addedSourceIds}
          readOnly={readOnly}
          onFilterChange={setFilter}
          onSearchChange={setSearch}
          onAdd={handleAdd}
          onReview={openReview}
          onRemoveFromBiblioteca={handleRemoveFromBiblioteca}
          onCreateCustom={openCreate}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ModeloContratoDocumentoPanel
            clauses={clauses}
            expedienteLabel={expedienteId.slice(0, 8).toUpperCase()}
            readOnly={readOnly}
            onEdit={openEdit}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onDropFromRepo={handleDropFromRepo}
            onCreateCustom={openCreate}
          />

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 md:px-6">
            {readOnly ? (
              <Button
                type="button"
                variant="outline"
                onClick={goToPanel}
                className="border-border text-muted-foreground"
              >
                Volver al panel
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={handleSaveDraft}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  {MODELO_CONTRATO_DRAFT_LABEL}
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setConfirmOpen(true)}
                  className="bg-navy text-white hover:bg-navy-hover"
                >
                  {MODELO_CONTRATO_SUBMIT_LABEL}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <ClausulaEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) setEditingClause(null);
        }}
        mode={editorMode}
        clause={editingClause}
        readOnly={readOnly}
        onSave={handleEditorSave}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{MODELO_CONTRATO_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{MODELO_CONTRATO_CONFIRM_DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmGenerate();
              }}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              Confirmar y generar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={successOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSuccessOpen(false);
            goToPanel();
          }
        }}
      >
        <AlertDialogContent className="max-w-[340px] rounded-xl border-border bg-card p-6 shadow-lg">
          <AlertDialogTitle className="sr-only">{MODELO_CONTRATO_SUCCESS_TITLE}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {MODELO_CONTRATO_SUCCESS_DESCRIPTION}
          </AlertDialogDescription>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
              <CheckCircle2 className="h-7 w-7 text-success" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-color-titulos">
              {MODELO_CONTRATO_SUCCESS_TITLE}
            </h2>
            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
              {MODELO_CONTRATO_SUCCESS_DESCRIPTION}
            </p>
            <Button
              type="button"
              onClick={() => {
                setSuccessOpen(false);
                goToPanel();
              }}
              className="mt-5 w-full bg-navy text-white hover:bg-navy-hover"
            >
              Volver al panel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
