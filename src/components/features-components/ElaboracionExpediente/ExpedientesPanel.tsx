"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPEDIENTES_MOCK } from "@/lib/mocks/expedientesMock";
import type { Expediente, TipoContratacion, FaseExpediente } from "@/types/expediente.types";

// ─── Helpers ────────────────────────────────────────────────────────

const TIPO_STYLES: Record<TipoContratacion, string> = {
  Bienes: "bg-tipo-bienes-bg text-tipo-bienes border-tipo-bienes-border",
  Servicios: "bg-tipo-servicios-bg text-tipo-servicios border-tipo-servicios-border",
  Obras: "bg-tipo-obras-bg text-tipo-obras border-tipo-obras-border",
};

const FASE_DOT_COLORS: Record<FaseExpediente, string> = {
  "Fase 1": "bg-fase-1",
  "Fase 2": "bg-fase-2",
  "Fase 3": "bg-fase-3",
  "Fase 4": "bg-fase-4",
};

const ITEMS_PER_PAGE = 5;

// ─── Component ──────────────────────────────────────────────────────

export function ExpedientesPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [faseFilter, setFaseFilter] = useState<string>("todos");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered data
  const filteredData = useMemo(() => {
    let data = [...EXPEDIENTES_MOCK];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (exp) =>
          exp.nomenclatura.toLowerCase().includes(q) ||
          exp.objetoContrato.toLowerCase().includes(q) ||
          exp.modalidad.toLowerCase().includes(q)
      );
    }

    // Tipo filter
    if (tipoFilter !== "todos") {
      data = data.filter((exp) => exp.tipo === tipoFilter);
    }

    // Fase filter
    if (faseFilter !== "todos") {
      data = data.filter((exp) => exp.fase === faseFilter);
    }

    return data;
  }, [searchQuery, tipoFilter, faseFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((e) => e.id)));
    }
  };

  return (
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
        <Link href="/elaboracion-expediente/nuevo">
          <Button className="bg-navy hover:bg-navy-hover text-white rounded-md px-6 py-5 h-12 flex items-center gap-2 font-semibold shadow-md cursor-pointer">
            <Plus className="w-5 h-5" />
            Crear nuevo expediente
          </Button>
        </Link>
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
            <SelectItem value="Bienes">Bienes</SelectItem>
            <SelectItem value="Servicios">Servicios</SelectItem>
            <SelectItem value="Obras">Obras</SelectItem>
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

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 border-slate-300 text-slate-500 hover:text-slate-700 shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-[13px] text-left">
          <thead className="bg-slate-bg text-text-muted-dark font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <Checkbox
                  checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-slate-300"
                />
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                <div className="flex items-center gap-1 cursor-pointer hover:text-navy">
                  Nomenclaturas
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Objeto del Contrato</th>
              <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Tipo</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Modalidad</th>
              <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Progreso</th>
              <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Fases</th>
              <th className="px-4 py-3 font-semibold text-center whitespace-nowrap">Acción</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((exp, index) => (
                <ExpedienteRow
                  key={`${exp.id}-${index}`}
                  expediente={exp}
                  isEven={index % 2 !== 0}
                  isSelected={selectedIds.has(exp.id)}
                  onToggle={() => toggleSelect(exp.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500 italic">
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
  );
}

// ─── Row Sub-component ──────────────────────────────────────────────

function ExpedienteRow({
  expediente,
  isEven,
  isSelected,
  onToggle,
}: {
  expediente: Expediente;
  isEven: boolean;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
        isEven ? "bg-slate-50/50" : "bg-white"
      }`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} className="border-slate-300" />
      </td>

      {/* Nomenclatura */}
      <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
        {expediente.nomenclatura}
      </td>

      {/* Objeto del Contrato */}
      <td className="px-4 py-3 text-slate-600 whitespace-nowrap max-w-[180px] truncate">
        {expediente.objetoContrato}
      </td>

      {/* Tipo Badge */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${TIPO_STYLES[expediente.tipo]}`}
        >
          {expediente.tipo}
        </span>
      </td>

      {/* Modalidad */}
      <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap max-w-[200px] truncate">
        {expediente.modalidad}
      </td>

      {/* Progreso */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-center">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-progress-bar rounded-full transition-all duration-300"
              style={{ width: `${expediente.progreso}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600 min-w-[32px]">
            {expediente.progreso}%
          </span>
        </div>
      </td>

      {/* Fases */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center gap-1.5 justify-center">
          <span className={`w-2.5 h-2.5 rounded-full ${FASE_DOT_COLORS[expediente.fase]}`} />
          <span className="text-xs font-medium text-slate-600">{expediente.fase}</span>
        </div>
      </td>

      {/* Acción */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <button className="text-slate-500 hover:text-navy transition-colors cursor-pointer">
            <Eye className="w-4.5 h-4.5" />
          </button>
          <button className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
            <FaRegTrashAlt className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
