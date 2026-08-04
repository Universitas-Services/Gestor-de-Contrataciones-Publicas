"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Eye,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { obtenerExpedientes, eliminarExpediente } from "@/services/expedienteService";
import type { ExpedienteListItem } from "@/services/expedienteService";
import { isEstatusProcesoDesierto } from "@/lib/constants/fase2Desierto";
import { getModalidadDisplayLabel } from "@/lib/modalidades/modalidadDisplay";
import { cn } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────

type TipoDisplay = "Bienes" | "Servicios" | "Obras";
type FaseDisplay = "Fase 1" | "Fase 2" | "Fase 3" | "Fase 4";

const TIPO_BACKEND_TO_DISPLAY: Record<string, TipoDisplay> = {
  BIENES: "Bienes",
  SERVICIOS: "Servicios",
  OBRAS: "Obras",
};

const TIPO_STYLES: Record<TipoDisplay, string> = {
  Bienes: "bg-tipo-bienes-bg text-tipo-bienes border-tipo-bienes-border",
  Servicios: "bg-tipo-servicios-bg text-tipo-servicios border-tipo-servicios-border",
  Obras: "bg-tipo-obras-bg text-tipo-obras border-tipo-obras-border",
};

const FASE_DOT_COLORS: Record<FaseDisplay, string> = {
  "Fase 1": "bg-fase-1",
  "Fase 2": "bg-fase-2",
  "Fase 3": "bg-fase-3",
  "Fase 4": "bg-fase-4",
};

const ITEMS_PER_PAGE = 5;

// ─── Component ──────────────────────────────────────────────────────

export function ExpedientesPanel({
  readOnly = false,
  basePath = "/elaboracion-expediente",
}: {
  readOnly?: boolean;
  /** Base URL for list CTAs (nuevo / detalle). Default preserves the legacy flow. */
  basePath?: string;
}) {
  const params = useSearchParams();
  const initialTipo = params.get("tipo") || "todos";

  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>(initialTipo);
  const [faseFilter, setFaseFilter] = useState<string>("todos");
  const [page, setPage] = useState(1);

  // Data from backend
  const [expedientes, setExpedientes] = useState<ExpedienteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch expedientes ──────────────────────────────────────────
  const fetchExpedientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await obtenerExpedientes({
        page: page, // El backend indicÃ³ que debe ser >= 1
        limit: ITEMS_PER_PAGE,
        search: searchQuery.trim() || undefined,
        tipoContratacion: tipoFilter !== "todos" ? tipoFilter : undefined,
      });

      // Manejar el formato de respuesta observado en Swagger (data/meta)
      if (response?.data && Array.isArray(response.data)) {
        setExpedientes(response.data);
        setTotalPages(response.meta?.totalPages || 1);
      } else {
        setExpedientes([]);
        setTotalPages(1);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al cargar expedientes";
      toast.error(message);
      setExpedientes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, tipoFilter]);

  useEffect(() => {
    fetchExpedientes();
  }, [fetchExpedientes]);

  // ─── Filtered data (client-side filter for fase) ────────────────
  const filteredData = useMemo(() => {
    let data = [...expedientes];

    // Fase filter (client-side ya que el backend puede no soportarlo)
    if (faseFilter !== "todos") {
      data = data.filter((exp) => {
        const fase = exp.fase || "Fase 1";
        return fase === faseFilter;
      });
    }

    return data;
  }, [expedientes, faseFilter]);

  // Paginated data (may already be paginated from backend)
  const paginatedData = filteredData;

  // ─── Delete handler ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (readOnly) return;
    if (!deleteId) return;
    setIsDeleting(true);

    // Optimistic update: marcar como ANULADO localmente de inmediato
    const previousExpedientes = expedientes;
    setExpedientes((prev) =>
      prev.map((e) => (e.id === deleteId ? { ...e, estatusProceso: "ANULADO" } : e))
    );
    setDeleteId(null);

    try {
      await eliminarExpediente(deleteId);
      toast.success("Expediente anulado exitosamente");
      fetchExpedientes();
    } catch (error) {
      // Revertir si el backend falló
      setExpedientes(previousExpedientes);
      const message = error instanceof Error ? error.message : "Error al anular el expediente";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-500 bg-white min-h-[calc(100vh-64px)] rounded-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-heading-dark tracking-tight mb-1">
              Panel de Expedientes
            </h1>
            <p className="text-slate-500 font-medium">
              Gestione y monitoree el progreso de los expedientes de selección contratista
            </p>
          </div>
          {!readOnly && (
            <Link href={`${basePath}/nuevo`}>
              <Button className="bg-navy hover:bg-navy-hover text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md cursor-pointer">
                <Plus className="w-5 h-5" />
                Crear nuevo expediente
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 min-w-0 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre, nomenclaturas, Objeto del Contrato o modalidad"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 bg-white border-slate-300 rounded-md text-sm"
            />
          </div>

          <Select
            value={tipoFilter}
            onValueChange={(val) => {
              setTipoFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-300 rounded-md text-sm">
              <SelectValue placeholder="Tipo: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Tipo: Todos</SelectItem>
              <SelectItem value="BIENES">Bienes</SelectItem>
              <SelectItem value="SERVICIOS">Servicios</SelectItem>
              <SelectItem value="OBRAS">Obras</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={faseFilter}
            onValueChange={(val) => {
              setFaseFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] h-10 bg-white border-slate-300 rounded-md text-sm">
              <SelectValue placeholder="Fases: Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Fases: Todos</SelectItem>
              <SelectItem value="Fase 1">Fase 1</SelectItem>
              <SelectItem value="Fase 2">Fase 2</SelectItem>
              <SelectItem value="Fase 3">Fase 3</SelectItem>
              <SelectItem value="Fase 4">Fase 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-slate-bg text-text-muted-dark font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-navy">
                    Nomenclaturas
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-center">Objeto del Contrato</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 font-semibold text-center">Modalidad</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Progreso</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Fases</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap w-[88px]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Cargando expedientes...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((exp, index) => (
                  <ExpedienteRow
                    key={`${exp.id}-${index}`}
                    expediente={exp}
                    isEven={index % 2 !== 0}
                    onDelete={() => setDeleteId(exp.id)}
                    isAnulado={exp.estatusProceso === "ANULADO"}
                    isDesierto={isEstatusProcesoDesierto(exp.estatusProceso)}
                    readOnly={readOnly}
                    basePath={basePath}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500 italic">
                    No se encontraron expedientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-6 gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                onClick={() => setPage(p)}
                variant={page === p ? "default" : "outline"}
                className={`w-8 h-8 rounded p-0 ${
                  page === p
                    ? "bg-navy hover:bg-navy-hover text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 rounded text-slate-500 hover:text-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El expediente será eliminado permanentemente del
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Row Sub-component ──────────────────────────────────────────────

function ExpedienteRow({
  expediente,
  isEven,
  onDelete,
  isAnulado,
  isDesierto = false,
  readOnly = false,
  basePath = "/elaboracion-expediente",
}: {
  expediente: ExpedienteListItem;
  isEven: boolean;
  onDelete: () => void;
  isAnulado?: boolean;
  isDesierto?: boolean;
  readOnly?: boolean;
  basePath?: string;
}) {
  // Map backend tipo to display from nested modalidad object
  const tipoBackend = expediente.modalidad?.tipoContratacion || "BIENES";
  const tipoDisplay = (TIPO_BACKEND_TO_DISPLAY[tipoBackend] || tipoBackend) as TipoDisplay;
  const tipoStyle = TIPO_STYLES[tipoDisplay] || TIPO_STYLES["Bienes"];

  // Fase y progreso (usando estatusProceso si fase no viene explícita)
  let fase: FaseDisplay = "Fase 1";
  if (expediente.fase) {
    fase = expediente.fase as FaseDisplay;
  } else if (expediente.estatusProceso === "BORRADOR") {
    fase = "Fase 1";
  }

  const progreso = expediente.progreso ?? (expediente.estatusProceso === "BORRADOR" ? 25 : 0);
  const faseDotColor = FASE_DOT_COLORS[fase] || FASE_DOT_COLORS["Fase 1"];

  // Modalidad display from nested modalidad object
  const modalidadDisplay = getModalidadDisplayLabel(expediente.modalidad?.modalidadSeleccion);

  // ANULADO tiene prioridad visual sobre desierto
  const showAsDesierto = Boolean(isDesierto) && !isAnulado;

  const rowBase = isAnulado
    ? "border-b border-slate-100 last:border-0 bg-slate-100 opacity-60"
    : cn(
        "border-b border-slate-100 last:border-0 transition-colors",
        showAsDesierto
          ? "border-l-2 border-l-destructive/40 bg-destructive/5 hover:bg-destructive/10"
          : cn("hover:bg-slate-50", isEven ? "bg-slate-50/50" : "bg-white")
      );

  const rowContent = (
    <>
      {/* Nomenclatura */}
      <td
        className={`px-4 py-3 font-semibold text-center break-words max-w-[150px] ${
          isAnulado ? "text-slate-400 line-through" : "text-slate-700"
        }`}
      >
        {expediente.codigoNomenclatura}
      </td>

      {/* Objeto del Contrato — 1 línea + tooltip */}
      <td
        className={`px-4 py-3 text-center max-w-[200px] ${
          isAnulado ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {expediente.descripcionObjeto ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate cursor-default">{expediente.descripcionObjeto}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm text-left text-balance">
              {expediente.descripcionObjeto}
            </TooltipContent>
          </Tooltip>
        ) : (
          "—"
        )}
      </td>

      {/* Tipo Badge – en gris si ANULADO */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
            isAnulado ? "bg-slate-100 text-slate-400 border-slate-300" : tipoStyle
          }`}
        >
          {isAnulado ? "Anulado" : tipoDisplay}
        </span>
      </td>

      {/* Modalidad */}
      <td
        className={`px-4 py-3 text-[12px] text-center break-words max-w-[180px] ${
          isAnulado ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {modalidadDisplay}
      </td>

      {/* Progreso – sin barra si ANULADO */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isAnulado ? "bg-slate-300" : "bg-progress-bar"
              }`}
              style={{ width: isAnulado ? "100%" : `${progreso}%` }}
            />
          </div>
          <span
            className={`text-xs font-semibold min-w-[32px] ${
              isAnulado ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {isAnulado ? "—" : `${progreso}%`}
          </span>
        </div>
      </td>

      {/* Fases */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isAnulado ? "bg-slate-300" : faseDotColor}`}
            />
            <span
              className={`text-xs font-medium ${isAnulado ? "text-slate-400" : "text-slate-600"}`}
            >
              {isAnulado ? "Anulado" : fase}
            </span>
          </div>
          {showAsDesierto ? (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 px-1.5 py-0 text-[10px] font-semibold text-destructive"
            >
              Declarado desierto
            </Badge>
          ) : null}
        </div>
      </td>

      {/* Acción – todas deshabilitadas si ANULADO */}
      <td className="px-4 py-3 text-center whitespace-nowrap w-[88px]">
        <div className="inline-flex items-center justify-center gap-2">
          {isAnulado ? (
            <>
              <span className="inline-flex size-8 items-center justify-center text-slate-300 cursor-not-allowed">
                <Eye className="size-4 shrink-0" />
              </span>
              <span className="inline-flex size-8 items-center justify-center text-slate-300 cursor-not-allowed">
                <Trash2 className="size-4 shrink-0" />
              </span>
            </>
          ) : (
            <>
              <Link
                href={`${basePath}/${expediente.id}`}
                className="inline-flex size-8 items-center justify-center text-slate-500 hover:text-navy transition-colors"
                aria-label="Ver expediente"
              >
                <Eye className="size-4 shrink-0" />
              </Link>
              {!readOnly && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex size-8 items-center justify-center text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  aria-label="Eliminar expediente"
                >
                  <Trash2 className="size-4 shrink-0" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </>
  );

  if (isAnulado) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <tr className={rowBase}>{rowContent}</tr>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white max-w-[250px] text-center border-slate-700 py-2.5 shadow-lg relative z-50">
            <p className="font-semibold text-[13px]">Expediente no disponible</p>
            <p className="text-slate-300 text-xs mt-1 leading-snug">
              Este expediente se encuentra anulado. Por favor, acuda a soporte técnico si desea
              recuperarlo.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (showAsDesierto) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <tr className={rowBase}>{rowContent}</tr>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white max-w-[250px] text-center border-slate-700 py-2.5 shadow-lg relative z-50">
            <p className="font-semibold text-[13px]">Procedimiento declarado desierto</p>
            <p className="text-slate-300 text-xs mt-1 leading-snug">
              Art. 113 LCP. Puede abrir el expediente para consultar el detalle.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <tr className={rowBase}>{rowContent}</tr>;
}
