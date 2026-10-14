"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/use-debounce";
import { listarNormativaGlobal } from "@/services/bibliotecaNormativaService";
import {
  getNormativaTexto,
  type BibliotecaListMeta,
  type NormativaGlobal,
} from "@/types/bibliotecaLegal.types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface NormativasLegalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Al seleccionar una normativa global, recibe el texto completo. */
  onSelect?: (texto: string) => void;
  readOnly?: boolean;
}

export function NormativasLegalesModal({
  open,
  onOpenChange,
  onSelect,
  readOnly = false,
}: NormativasLegalesModalProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NormativaGlobal[]>([]);
  const [meta, setMeta] = useState<BibliotecaListMeta>({ total: 0, page: 1, lastPage: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarNormativaGlobal({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        indActivo: true,
      });
      setItems(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, lastPage: 1 });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudieron cargar las normativas globales"
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [debouncedSearch, open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
      setItems([]);
    }
  }, [open]);

  const handleSelect = (item: NormativaGlobal) => {
    if (readOnly || !onSelect) return;
    const texto = getNormativaTexto(item).trim();
    if (!texto) return;
    onSelect(texto);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-xl sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 border-b border-slate-100 px-5 py-4 text-left">
          <DialogTitle className="font-inter text-base font-bold text-color-titulos">
            Normativas globales aplicables
          </DialogTitle>
          <p className="text-[12px] text-muted-foreground">
            Seleccione una normativa para rellenar el campo. Luego puede agregarla al procedimiento
            o editarla antes de guardar.
          </p>
        </DialogHeader>

        <div className="shrink-0 border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar normativa global…"
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
              <p className="text-sm italic">Cargando normativas…</p>
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm italic text-muted-foreground">
              No hay normativas globales para mostrar.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => {
                const texto = getNormativaTexto(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={readOnly || !onSelect}
                      onClick={() => handleSelect(item)}
                      className="w-full rounded-lg border border-slate-100 px-3 py-3 text-left text-[12px] leading-relaxed text-slate-700 transition-colors hover:border-navy/30 hover:bg-slate-50 disabled:cursor-default disabled:hover:border-slate-100 disabled:hover:bg-transparent"
                    >
                      {texto || "—"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <p className="text-[11px] text-muted-foreground">
            Página {meta.page} de {Math.max(meta.lastPage, 1)} · {meta.total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-5 py-4 sm:justify-end">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-navy font-inter text-white hover:bg-navy-hover"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
