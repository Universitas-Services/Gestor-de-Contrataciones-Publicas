"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { crearSesion, listarSesiones } from "@/services/complianceApi";
import {
  MODALIDAD_LABELS,
  MODALIDADES,
  TIPOS_CONTRATACION,
  TIPO_CONTRATACION_LABELS,
  type EstadoSesion,
  type Modalidad,
  type NivelRiesgo,
  type SesionResumen,
  type TipoContratacion,
} from "@/types/compliance.types";
import { cn } from "@/lib/utils";

const BASE_PATH = "/compliance-expediente";
const PAGE_SIZE = 20;

const ESTADO_STYLES: Record<string, string> = {
  CONFIGURANDO: "bg-pendiente-bg text-pendiente border-pendiente-border",
  ACTIVA: "bg-success-bg text-success-text border-vigente-border",
  CERRADA: "bg-slate-bg text-muted-foreground border-border-light",
};

const RIESGO_STYLES: Record<NivelRiesgo, string> = {
  SIN_HALLAZGOS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OBSERVACIONES: "bg-amber-50 text-amber-800 border-amber-200",
  RIESGO_ALTO: "bg-red-50 text-red-700 border-red-200",
};

const RIESGO_LABELS: Record<NivelRiesgo, string> = {
  SIN_HALLAZGOS: "Sin hallazgos",
  OBSERVACIONES: "Observaciones",
  RIESGO_ALTO: "Riesgo alto",
};

const ESTADOS: EstadoSesion[] = ["CONFIGURANDO", "ACTIVA", "CERRADA"];

function formatFechaInicio(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  readOnly?: boolean;
}

export function SessionsListPanel({ readOnly = false }: Props) {
  const router = useRouter();
  const [sesiones, setSesiones] = useState<SesionResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [modalidad, setModalidad] = useState<Modalidad | "">("");
  const [tipo, setTipo] = useState<TipoContratacion | "">("");
  const [estado, setEstado] = useState<EstadoSesion | "">("");

  // Debounce búsqueda libre
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchSesiones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listarSesiones({
        page,
        page_size: PAGE_SIZE,
        q: q || undefined,
        modalidad: modalidad || undefined,
        tipo_contratacion: tipo || undefined,
        estado: estado || undefined,
      });
      setSesiones(res.items);
      setTotal(res.total);
      setPages(res.pages);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "No se pudo listar sesiones. ¿Está la API de compliance en :8000?"
      );
      setSesiones([]);
      setTotal(0);
      setPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, q, modalidad, tipo, estado]);

  useEffect(() => {
    void fetchSesiones();
  }, [fetchSesiones]);

  async function handleCrear() {
    if (readOnly || creating) return;
    setCreating(true);
    try {
      const res = await crearSesion({});
      toast.success("Sesión creada");
      router.push(`${BASE_PATH}/${res.sesion.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear la sesión");
      setCreating(false);
    }
  }

  function onFilterChange<T extends string>(setter: (v: T | "") => void, value: T | "") {
    setter(value);
    setPage(1);
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 space-y-6 animate-in fade-in duration-500 bg-white min-h-[calc(100vh-64px)] rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark tracking-tight mb-1">
            Sesiones de compliance
          </h1>
          <p className="text-sm text-muted-foreground">
            Auditoría conversacional LCP/RLCP · listado de expedientes en revisión
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={() => void handleCrear()}
            disabled={creating}
            className="bg-navy hover:bg-navy-hover text-white rounded-md px-6 h-11"
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Nueva sesión
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
        <div className="relative max-w-md flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar nomenclatura, modalidad o tipo…"
            className="pl-9 border-border-light"
          />
        </div>
        <select
          value={modalidad}
          onChange={(e) => onFilterChange(setModalidad, e.target.value as Modalidad | "")}
          className="h-10 rounded-md border border-border-light bg-white px-3 text-sm text-heading-dark"
        >
          <option value="">Todas las modalidades</option>
          {MODALIDADES.map((m) => (
            <option key={m} value={m}>
              {MODALIDAD_LABELS[m]}
            </option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => onFilterChange(setTipo, e.target.value as TipoContratacion | "")}
          className="h-10 rounded-md border border-border-light bg-white px-3 text-sm text-heading-dark"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_CONTRATACION.map((t) => (
            <option key={t} value={t}>
              {TIPO_CONTRATACION_LABELS[t]}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => onFilterChange(setEstado, e.target.value as EstadoSesion | "")}
          className="h-10 rounded-md border border-border-light bg-white px-3 text-sm text-heading-dark"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full min-w-[720px] table-fixed text-[13px] text-left">
          <thead className="bg-slate-bg text-text-muted-dark font-medium border-b border-slate-200">
            <tr>
              <th className="w-[24%] px-3 py-3 font-semibold">Nomenclatura</th>
              <th className="w-[20%] px-3 py-3 font-semibold text-center">Modalidad</th>
              <th className="w-[14%] px-3 py-3 font-semibold text-center">Inicio</th>
              <th className="w-[18%] px-3 py-3 font-semibold text-center">Progreso</th>
              <th className="w-[14%] px-3 py-3 font-semibold text-center">Riesgo</th>
              <th className="w-[10%] px-3 py-3 font-semibold text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cargando sesiones…</span>
                  </div>
                </td>
              </tr>
            ) : sesiones.length > 0 ? (
              sesiones.map((s, index) => {
                const title = s.nomenclatura || `Sesión ${s.id.slice(0, 8)}…`;
                const revisados = s.docs_revisados ?? 0;
                const totales = s.docs_totales ?? 0;
                const pct = s.progreso_pct ?? 0;
                const riesgo = (s.riesgo ?? "SIN_HALLAZGOS") as NivelRiesgo;
                return (
                  <tr
                    key={s.id}
                    className={cn(
                      "border-b border-border-light transition hover:bg-slate-bg/60",
                      index % 2 !== 0 && "bg-slate-bg/30"
                    )}
                  >
                    <td className="px-3 py-3.5">
                      <Link
                        href={`${BASE_PATH}/${s.id}`}
                        className="font-medium text-heading-dark hover:text-navy line-clamp-2"
                      >
                        {title}
                      </Link>
                      {s.estado && (
                        <Badge
                          className={cn(
                            "mt-1 border text-[9px] uppercase",
                            ESTADO_STYLES[s.estado] ?? ESTADO_STYLES.CERRADA
                          )}
                        >
                          {s.estado}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-center text-muted-foreground">
                      <span className="line-clamp-2">
                        {s.modalidad ? MODALIDAD_LABELS[s.modalidad] : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center text-muted-foreground whitespace-nowrap">
                      {formatFechaInicio(s.fecha_inicio)}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="mx-auto flex max-w-[140px] flex-col gap-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>
                            {revisados}/{totales || "—"}
                          </span>
                          <span>{totales ? `${pct}%` : "—"}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-navy transition-all"
                            style={{ width: `${totales ? pct : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <Badge
                        className={cn(
                          "border text-[10px]",
                          RIESGO_STYLES[riesgo] ?? RIESGO_STYLES.SIN_HALLAZGOS
                        )}
                      >
                        {RIESGO_LABELS[riesgo] ?? riesgo}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-navy hover:bg-navy/5"
                            >
                              <Link href={`${BASE_PATH}/${s.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Abrir sesión</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground italic">
                  No se encontraron sesiones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {total} resultado{total === 1 ? "" : "s"} · página {page} de {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
