"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, FileSignature } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  MODELO_CONTRATO_CONFIRM_DESCRIPTION,
  MODELO_CONTRATO_CONFIRM_TITLE,
  MODELO_CONTRATO_DRAFT_LABEL,
  MODELO_CONTRATO_SUBMIT_LABEL,
  MODELO_CONTRATO_SUCCESS_DESCRIPTION,
  MODELO_CONTRATO_SUCCESS_TITLE,
  MODELO_CONTRATO_WIZARD_DESCRIPTION,
  MODELO_CONTRATO_WIZARD_TITLE,
  type ClausulaBase,
  type ClausulaEnModelo,
} from "@/lib/constants/modeloContrato";
import { expedienteFase1TabPath } from "@/lib/utils/fase1InicialRoutes";
import { formatMicromoduloErrorMessage } from "@/lib/utils/fase1ApiError";
import {
  ensureMicromoduloEditable,
  modeloContratoClausesFromResponse,
  modeloContratoToApi,
} from "@/lib/utils/fase1MicromodulosMapper";
import { crearClausulaEnte, eliminarClausulaEnte } from "@/services/bibliotecaClausulasService";
import {
  listarClausulasEnteModelo,
  listarClausulasGenericasModelo,
} from "@/services/clausulasModeloService";
import {
  completarMicromodulo,
  guardarBorradorMicromodulo,
  obtenerModeloContrato,
} from "@/services/fase1MicromodulosService";
import type { EstadoMicromoduloApi } from "@/types/fase1Micromodulos.types";
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

function normalizeHtml(html: string): string {
  return html.replace(/\s+/g, " ").trim();
}

function wasEdited(
  original: ClausulaBase | ClausulaEnModelo | null,
  payload: ClausulaEditorSavePayload
): boolean {
  if (!original) return true;
  return (
    original.titulo.trim() !== payload.titulo.trim() ||
    normalizeHtml(original.cuerpoHtml) !== normalizeHtml(payload.cuerpoHtml)
  );
}

export function ModeloContratoForm({
  expedienteId,
  enteId = "",
  readOnly = false,
  basePath = "/gestion-expedientes",
}: ModeloContratoFormProps) {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [genericas, setGenericas] = useState<ClausulaBase[]>([]);
  const [biblioteca, setBiblioteca] = useState<ClausulaBase[]>([]);
  const [clauses, setClauses] = useState<ClausulaEnModelo[]>([]);
  const [estado, setEstado] = useState<EstadoMicromoduloApi | undefined>();
  const [filter, setFilter] = useState<RepoFilter>("todas");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<ClausulaEditorMode>("edit");
  const [editingClause, setEditingClause] = useState<ClausulaBase | ClausulaEnModelo | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refreshBiblioteca = useCallback(async () => {
    if (!enteId) {
      setBiblioteca([]);
      return;
    }
    try {
      const items = await listarClausulasEnteModelo(enteId);
      setBiblioteca(items);
    } catch {
      /* keep current */
    }
  }, [enteId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [seed, modeloResponse, biblio] = await Promise.all([
          listarClausulasGenericasModelo(),
          obtenerModeloContrato(expedienteId),
          enteId ? listarClausulasEnteModelo(enteId) : Promise.resolve([] as ClausulaBase[]),
        ]);
        if (cancelled) return;

        setEstado(modeloResponse.estado);
        setGenericas(seed);
        setBiblioteca(biblio);
        setClauses(
          reindexOrders(
            sortByOrder(
              modeloContratoClausesFromResponse(modeloResponse as Record<string, unknown>)
            )
          )
        );
      } catch {
        if (!cancelled) {
          try {
            const [seed, biblio] = await Promise.all([
              listarClausulasGenericasModelo().catch(() => [] as ClausulaBase[]),
              enteId
                ? listarClausulasEnteModelo(enteId).catch(() => [] as ClausulaBase[])
                : Promise.resolve([] as ClausulaBase[]),
            ]);
            setGenericas(seed);
            setBiblioteca(biblio);
          } catch {
            setGenericas([]);
            setBiblioteca([]);
          }
          setClauses([]);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
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
    let pool: ClausulaBase[] = [];
    if (filter === "generica") pool = genericas;
    else if (filter === "biblioteca") pool = biblioteca;
    else pool = [...genericas, ...biblioteca];

    const q = search.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) ||
        c.cuerpoHtml.toLowerCase().includes(q) ||
        (c.basamentoLegal?.toLowerCase().includes(q) ?? false)
    );
  }, [biblioteca, filter, genericas, search]);

  const findRepoClause = useCallback(
    (clauseId: string): ClausulaBase | undefined => {
      return genericas.find((c) => c.id === clauseId) ?? biblioteca.find((c) => c.id === clauseId);
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
      return reindexOrders(reordered);
    });
  };

  const handleRemoveFromBiblioteca = async (clauseId: string) => {
    if (!enteId || readOnly) return;
    try {
      await eliminarClausulaEnte(enteId, clauseId);
      setBiblioteca((prev) => prev.filter((item) => item.id !== clauseId));
      toast.success("Cláusula eliminada de la Biblioteca del Ente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar la cláusula del ente"
      );
    }
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

  /**
   * Mismas métricas que normativas:
   * - Global/ente intacta → solo al modelo
   * - Global/ente editada, create, o saveToBiblioteca → POST ente (la global nunca se muta)
   */
  const handleEditorSave = async (payload: ClausulaEditorSavePayload) => {
    if (readOnly || !editingClause) return;

    const edited = wasEdited(editingClause, payload);
    const isCreate = editorMode === "create";
    const origen = editingClause.origen;

    const needsPost =
      isCreate ||
      payload.saveToBiblioteca ||
      (edited && (origen === "generica" || origen === "biblioteca" || origen === "custom"));

    let resolvedId = editingClause.id;
    let resolvedOrigen = editingClause.origen;
    let postedBase: ClausulaBase | null = null;

    if (needsPost) {
      if (!enteId) {
        toast.error("No hay un ente asociado para guardar la cláusula en la biblioteca.");
        return;
      }
      try {
        const created = await crearClausulaEnte(enteId, {
          titulo: payload.titulo,
          cuerpo: payload.cuerpoHtml,
        });
        resolvedId = created.id;
        resolvedOrigen = "biblioteca";
        postedBase = {
          id: created.id,
          titulo: created.titulo ?? payload.titulo,
          cuerpoHtml: created.cuerpo ?? payload.cuerpoHtml,
          basamentoLegal: editingClause.basamentoLegal,
          kind: "facultativa",
          origen: "biblioteca",
          variablesSugeridas: editingClause.variablesSugeridas,
        };
        await refreshBiblioteca();
        toast.success("Cláusula guardada en la Biblioteca del Ente.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar la cláusula del ente"
        );
        return;
      }
    }

    if (editorMode === "create") {
      const idForModel = postedBase?.id ?? resolvedId;
      if (addedSourceIds.has(idForModel)) {
        toast.error("Esta cláusula ya está en el modelo.");
      } else {
        setClauses((prev) =>
          reindexOrders([
            ...sortByOrder(prev),
            {
              id: idForModel,
              instanceId:
                "instanceId" in editingClause && editingClause.instanceId
                  ? editingClause.instanceId
                  : createId(),
              titulo: payload.titulo,
              cuerpoHtml: payload.cuerpoHtml,
              basamentoLegal: editingClause.basamentoLegal,
              variablesSugeridas: editingClause.variablesSugeridas,
              origen: "biblioteca",
              kind: "facultativa",
              order: prev.length + 1,
            },
          ])
        );
      }
    } else if (editorMode === "review") {
      const idForModel = postedBase?.id ?? editingClause.id;
      if (addedSourceIds.has(idForModel)) {
        toast.error("Esta cláusula ya está en el modelo.");
      } else {
        setClauses((prev) =>
          reindexOrders([
            ...sortByOrder(prev),
            {
              ...(postedBase ?? editingClause),
              id: idForModel,
              titulo: payload.titulo,
              cuerpoHtml: payload.cuerpoHtml,
              origen: resolvedOrigen,
              instanceId: createId(),
              order: prev.length + 1,
            },
          ])
        );
      }
    } else if (editorMode === "edit" && "instanceId" in editingClause) {
      setClauses((prev) =>
        prev.map((c) =>
          c.instanceId === editingClause.instanceId
            ? {
                ...c,
                id: resolvedId,
                titulo: payload.titulo,
                cuerpoHtml: payload.cuerpoHtml,
                origen: resolvedOrigen,
              }
            : c
        )
      );
    }

    setEditorOpen(false);
    setEditingClause(null);
  };

  const handleSaveDraft = async () => {
    if (readOnly) return;
    setIsSaving(true);
    try {
      await ensureMicromoduloEditable(expedienteId, "modelo-contrato", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      await guardarBorradorMicromodulo(
        expedienteId,
        "modelo-contrato",
        modeloContratoToApi(clauses) as unknown as Record<string, unknown>
      );
      toast.success("Borrador del modelo de contrato guardado.");
      goToPanel();
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmGenerate = async () => {
    if (readOnly) return;
    if (clauses.length === 0) {
      toast.error("Agregue al menos una cláusula al modelo antes de completar.");
      setConfirmOpen(false);
      return;
    }
    setIsSaving(true);
    try {
      const payload = modeloContratoToApi(clauses) as unknown as Record<string, unknown>;
      await ensureMicromoduloEditable(expedienteId, "modelo-contrato", estado);
      if (estado === "COMPLETADO") setEstado("BORRADOR");
      await guardarBorradorMicromodulo(expedienteId, "modelo-contrato", payload);
      await completarMicromodulo(expedienteId, "modelo-contrato", payload);
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (error) {
      toast.error(formatMicromoduloErrorMessage(error));
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
    <div className="flex w-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start gap-3 border-b border-border bg-card px-4 py-4 md:px-6">
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

      <div className="flex h-[calc(100vh-13rem)] max-h-[calc(100vh-13rem)] min-h-[28rem] flex-col overflow-hidden md:flex-row">
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
          onRemoveFromBiblioteca={(id) => void handleRemoveFromBiblioteca(id)}
          onCreateCustom={openCreate}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
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

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-card px-4 py-3 md:px-6">
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
                  onClick={() => void handleSaveDraft()}
                  className="border-border text-muted-foreground hover:bg-muted"
                >
                  {MODELO_CONTRATO_DRAFT_LABEL}
                </Button>
                <Button
                  type="button"
                  disabled={isSaving || clauses.length === 0}
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
        onOpenChange={setEditorOpen}
        mode={editorMode}
        clause={editingClause}
        readOnly={readOnly}
        onSave={handleEditorSave}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{MODELO_CONTRATO_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{MODELO_CONTRATO_CONFIRM_DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmGenerate();
              }}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              {isSaving ? "Generando…" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {MODELO_CONTRATO_SUCCESS_TITLE}
            </AlertDialogTitle>
            <AlertDialogDescription>{MODELO_CONTRATO_SUCCESS_DESCRIPTION}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setSuccessOpen(false);
                goToPanel();
              }}
              className="bg-navy text-white hover:bg-navy-hover"
            >
              Volver al panel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
