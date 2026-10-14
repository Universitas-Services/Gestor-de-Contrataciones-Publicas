"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/use-debounce";
import type { BibliotecaClausulaFormValues } from "@/lib/schemas/bibliotecaClausulaSchema";
import {
  actualizarClausulaEnte,
  crearClausulaEnte,
  eliminarClausulaEnte,
  listarClausulasEnte,
  listarClausulasGenericas,
} from "@/services/bibliotecaClausulasService";
import type {
  BibliotecaListMeta,
  ClausulaEnte,
  ClausulaGenerica,
} from "@/types/bibliotecaLegal.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bibliotecaTabTriggerClassName,
  bibliotecaTabsListClassName,
} from "./bibliotecaTabs.styles";
import { BibliotecaPagination } from "./BibliotecaPagination";
import { ClausulaBibliotecaDialog } from "./ClausulaBibliotecaDialog";
import { EliminarBibliotecaItemDialog } from "./EliminarBibliotecaItemDialog";

interface ClausulasTabProps {
  enteId?: string;
  readOnly?: boolean;
}

function stripPreview(html: string, max = 140): string {
  const clean = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

export function ClausulasTab({ enteId, readOnly = false }: ClausulasTabProps) {
  const [subTab, setSubTab] = useState<"global" | "ente">("global");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<(ClausulaGenerica | ClausulaEnte)[]>([]);
  const [meta, setMeta] = useState<BibliotecaListMeta>({ total: 0, page: 1, lastPage: 1 });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"crear" | "editar">("crear");
  const [editing, setEditing] = useState<ClausulaEnte | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<ClausulaEnte | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canMutateEnte = Boolean(enteId) && !readOnly;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (subTab === "global") {
        const res = await listarClausulasGenericas({
          page,
          limit,
          search: debouncedSearch || undefined,
        });
        setItems(res.data ?? []);
        setMeta(res.meta ?? { total: 0, page: 1, lastPage: 1 });
      } else {
        if (!enteId) {
          setItems([]);
          setMeta({ total: 0, page: 1, lastPage: 1 });
          return;
        }
        const res = await listarClausulasEnte(enteId, {
          page,
          limit,
          search: debouncedSearch || undefined,
        });
        setItems(res.data ?? []);
        setMeta(res.meta ?? { total: 0, page: 1, lastPage: 1 });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar cláusulas");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [subTab, enteId, page, limit, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, subTab, limit]);

  const openCreate = () => {
    setFormMode("crear");
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: ClausulaEnte) => {
    setFormMode("editar");
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (values: BibliotecaClausulaFormValues) => {
    if (!enteId) return;
    setSaving(true);
    try {
      if (formMode === "crear") {
        await crearClausulaEnte(enteId, values);
        toast.success("Cláusula agregada");
      } else if (editing) {
        await actualizarClausulaEnte(enteId, editing.id, values);
        toast.success("Cláusula actualizada");
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar cláusula");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!enteId || !toDelete) return;
    setDeleting(true);
    try {
      await eliminarClausulaEnte(enteId, toDelete.id);
      toast.success("Cláusula eliminada");
      setDeleteOpen(false);
      setToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar cláusula");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Tabs
        value={subTab}
        onValueChange={(v) => setSubTab(v as "global" | "ente")}
        className="w-full gap-0"
      >
        <TabsList className={bibliotecaTabsListClassName}>
          <TabsTrigger value="global" className={bibliotecaTabTriggerClassName}>
            Biblioteca global
          </TabsTrigger>
          <TabsTrigger value="ente" className={bibliotecaTabTriggerClassName}>
            Biblioteca del ente
          </TabsTrigger>
        </TabsList>

        <div className="mt-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md sm:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted-dark" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o cuerpo…"
              className="h-10 border-slate-200 bg-white pl-9"
            />
          </div>

          {subTab === "ente" && canMutateEnte ? (
            <Button
              type="button"
              className="h-10 shrink-0 gap-1.5 bg-navy text-white hover:bg-navy-hover"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" />
              Agregar cláusula
            </Button>
          ) : null}
        </div>

        <TabsContent value="global" className="mt-5 space-y-4">
          <ClausulaTable items={items} loading={loading} showActions={false} showOrigen />
        </TabsContent>

        <TabsContent value="ente" className="mt-5 space-y-4">
          {!enteId ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-text-muted-dark">
              No hay un ente asociado a su sesión. Solo puede consultar la biblioteca global.
            </p>
          ) : (
            <ClausulaTable
              items={items}
              loading={loading}
              showActions={canMutateEnte}
              onEdit={(item) => openEdit(item as ClausulaEnte)}
              onDelete={(item) => {
                setToDelete(item as ClausulaEnte);
                setDeleteOpen(true);
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <BibliotecaPagination
        totalCount={meta.total}
        lastPage={meta.lastPage}
        page={page}
        pageSize={limit}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        itemLabel="cláusulas"
      />

      <ClausulaBibliotecaDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        initialTitulo={editing?.titulo ?? ""}
        initialCuerpo={editing?.cuerpo ?? ""}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <EliminarBibliotecaItemDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar cláusula?"
        description="La cláusula se eliminará de la biblioteca del ente (borrado lógico)."
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

interface ClausulaTableProps {
  items: (ClausulaGenerica | ClausulaEnte)[];
  loading: boolean;
  showActions: boolean;
  showOrigen?: boolean;
  onEdit?: (item: ClausulaGenerica | ClausulaEnte) => void;
  onDelete?: (item: ClausulaGenerica | ClausulaEnte) => void;
}

function ClausulaTable({
  items,
  loading,
  showActions,
  showOrigen = false,
  onEdit,
  onDelete,
}: ClausulaTableProps) {
  const colSpan = 2 + (showOrigen ? 1 : 0) + (showActions ? 1 : 0);

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="border-b border-slate-100 hover:bg-transparent">
            <TableHead className="h-12 w-[28%] px-4 text-left text-[13px] font-bold text-heading-dark">
              Título
            </TableHead>
            <TableHead className="h-12 px-4 text-left text-[13px] font-bold text-heading-dark">
              Cuerpo
            </TableHead>
            {showOrigen ? (
              <TableHead className="h-12 w-[12%] px-4 text-left text-[13px] font-bold text-heading-dark">
                Origen
              </TableHead>
            ) : null}
            {showActions ? (
              <TableHead className="h-12 w-[12%] px-4 text-center text-[13px] font-bold text-heading-dark">
                Acciones
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-text-muted-dark">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
                  <p className="text-sm italic">Cargando cláusulas…</p>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="py-12 text-center text-sm italic text-text-muted-dark"
              >
                No hay cláusulas para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                <TableCell className="align-top px-4 py-4 text-sm font-semibold whitespace-normal text-color-titulos">
                  {item.titulo}
                </TableCell>
                <TableCell
                  className="align-top px-4 py-4 text-sm leading-relaxed whitespace-normal text-text-muted-dark"
                  title={stripPreview(item.cuerpo, 2000)}
                >
                  {stripPreview(item.cuerpo)}
                </TableCell>
                {showOrigen ? (
                  <TableCell className="align-top px-4 py-4 text-xs capitalize text-text-muted-dark">
                    {"origen" in item ? String(item.origen) : "—"}
                  </TableCell>
                ) : null}
                {showActions ? (
                  <TableCell className="px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-navy"
                        title="Editar"
                        onClick={() => onEdit?.(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        title="Eliminar"
                        onClick={() => onDelete?.(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
