"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  actualizarDiaNoLaborable,
  consultarDiasNoLaborablesRango,
  crearDiaNoLaborable,
  crearDiasNoLaborablesBulk,
  eliminarDiaNoLaborable,
  listarDiasNoLaborables,
  listarTodosDiasNoLaborablesDelAnio,
  obtenerAlertasCronograma,
} from "@/services/cronogramaEnteService";
import type {
  ConflictoDetectado,
  CronogramaAlerta,
  DiaNoLaborable,
} from "@/types/cronogramaEnte.types";
import type { PaginationMetadata } from "@/types/user-management.types";
import type { BulkFeriadosFormValues, FeriadoFormValues } from "@/lib/schemas/cronogramaEnteSchema";
import {
  buildFeriadoCalendarOverlay,
  expandDiaNoLaborableToYear,
  formatIsoDate,
  mergeDiasNoLaborablesById,
} from "@/lib/utils/diasNoLaborablesUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { FeriadosAlertasTab } from "./FeriadosAlertasTab";
import { FeriadosCalendar } from "./FeriadosCalendar";
import { FeriadosTable } from "./FeriadosTable";
import { FeriadoFormDialog } from "./FeriadoFormDialog";
import { BulkFeriadosDialog } from "./BulkFeriadosDialog";
import { ConflictosDialog } from "./ConflictosDialog";
import { EliminarFeriadoDialog } from "./EliminarFeriadoDialog";

type DiasNoLaborablesTab = "alertas" | "gestion";

const diasNoLaborablesTabTriggerClassName =
  "!flex-none !h-11 !w-full cursor-pointer rounded-full border border-transparent bg-transparent px-5 text-sm font-semibold text-slate-400 shadow-none transition-all duration-200 ease-in-out after:hidden" +
  " hover:border-slate-200 hover:bg-white/70 hover:text-slate-700 hover:shadow-sm" +
  " data-[state=active]:border-color-boton-1/20 data-[state=active]:bg-gradient-to-br data-[state=active]:from-color-boton-1/10 data-[state=active]:to-color-boton-1/5 data-[state=active]:text-color-boton-1 data-[state=active]:shadow-[0_2px_12px_rgba(15,23,42,0.08)]";

export function DiasNoLaborablesPanel() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [data, setData] = React.useState<DiaNoLaborable[]>([]);
  const [metadata, setMetadata] = React.useState<PaginationMetadata | null>(null);
  const [alertas, setAlertas] = React.useState<CronogramaAlerta[]>([]);
  const [feriadoDates, setFeriadoDates] = React.useState<Set<string>>(new Set());
  const [feriadoDescriptions, setFeriadoDescriptions] = React.useState<Map<string, string>>(
    new Map()
  );
  const [calendarRegistry, setCalendarRegistry] = React.useState<DiaNoLaborable[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [bulkSaving, setBulkSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  const [bulkMode, setBulkMode] = React.useState(false);
  const [selectedDates, setSelectedDates] = React.useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DiaNoLaborable | null>(null);
  const [initialDate, setInitialDate] = React.useState<string | null>(null);
  const [dateLocked, setDateLocked] = React.useState(false);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<DiaNoLaborable | null>(null);

  const [conflictosOpen, setConflictosOpen] = React.useState(false);
  const [conflictos, setConflictos] = React.useState<ConflictoDetectado[]>([]);

  const alertasPendientes = React.useMemo(
    () => alertas.filter((alerta) => !alerta.resuelta),
    [alertas]
  );

  const [activeTab, setActiveTab] = React.useState<DiasNoLaborablesTab>("gestion");
  const [alertasLoaded, setAlertasLoaded] = React.useState(false);
  const hasSetInitialTab = React.useRef(false);

  React.useEffect(() => {
    if (!alertasLoaded || hasSetInitialTab.current) return;
    hasSetInitialTab.current = true;
    if (alertasPendientes.length > 0) {
      setActiveTab("alertas");
    }
  }, [alertasLoaded, alertasPendientes.length]);

  const selectedDatesList = React.useMemo(() => Array.from(selectedDates).sort(), [selectedDates]);

  const applyCalendarOverlay = React.useCallback(
    (
      year: number,
      diasRegistrados: DiaNoLaborable[],
      rangoDias: Awaited<ReturnType<typeof consultarDiasNoLaborablesRango>>["diasNoLaborables"] = []
    ) => {
      const merged = mergeDiasNoLaborablesById(diasRegistrados) as DiaNoLaborable[];
      const { dates, descriptions } = buildFeriadoCalendarOverlay(year, merged, rangoDias);

      setCalendarRegistry(merged);
      setFeriadoDates(dates);
      setFeriadoDescriptions(descriptions);
    },
    []
  );

  const fetchCalendarData = React.useCallback(
    async (year: number, tableDias: DiaNoLaborable[] = []) => {
      let rangoDias: Awaited<
        ReturnType<typeof consultarDiasNoLaborablesRango>
      >["diasNoLaborables"] = [];

      try {
        const rangoResponse = await consultarDiasNoLaborablesRango({
          desde: `${year}-01-01`,
          hasta: `${year}-12-31`,
        });
        rangoDias = rangoResponse.diasNoLaborables;
      } catch (error) {
        console.error("Error al consultar rango de feriados:", error);
      }

      let listDias: DiaNoLaborable[] = tableDias;
      try {
        listDias = await listarTodosDiasNoLaborablesDelAnio(year);
      } catch (error) {
        console.error("Error al listar feriados del año para calendario:", error);
      }

      applyCalendarOverlay(
        year,
        mergeDiasNoLaborablesById(tableDias, listDias) as DiaNoLaborable[],
        rangoDias
      );
    },
    [applyCalendarOverlay]
  );

  const fetchAlertas = React.useCallback(async () => {
    try {
      const response = await obtenerAlertasCronograma();
      setAlertas(response);
    } catch (error) {
      console.error(error);
    } finally {
      setAlertasLoaded(true);
    }
  }, []);

  const fetchTableData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await listarDiasNoLaborables({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        anio: selectedYear,
      });
      setData(response.data);
      setMetadata(response.meta);
      applyCalendarOverlay(selectedYear, response.data);
      await fetchCalendarData(selectedYear, response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar feriados");
    } finally {
      setLoading(false);
    }
  }, [
    applyCalendarOverlay,
    fetchCalendarData,
    pagination.pageIndex,
    pagination.pageSize,
    selectedYear,
  ]);

  const refreshAll = React.useCallback(async () => {
    await Promise.all([fetchTableData(), fetchAlertas()]);
  }, [fetchAlertas, fetchTableData]);

  React.useEffect(() => {
    void fetchTableData();
  }, [fetchTableData]);

  React.useEffect(() => {
    void fetchAlertas();
  }, [fetchAlertas]);

  const openCreate = (dateIso?: string, fromCalendar = false) => {
    setEditing(null);
    setInitialDate(dateIso ?? formatIsoDate(new Date()));
    setDateLocked(Boolean(fromCalendar && dateIso));
    setFormOpen(true);
  };

  const openEdit = (dia: DiaNoLaborable) => {
    setEditing(dia);
    setInitialDate(null);
    setFormOpen(true);
  };

  const openDelete = (dia: DiaNoLaborable) => {
    setToDelete(dia);
    setDeleteOpen(true);
  };

  const handleCalendarDayClick = (dateIso: string) => {
    const match = calendarRegistry.find((dia) =>
      expandDiaNoLaborableToYear(dia, selectedYear).some(({ fecha }) => fecha === dateIso)
    );

    if (match) {
      openEdit(match);
      return;
    }

    openCreate(dateIso, true);
  };

  const handleToggleSelect = (dateIso: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateIso)) next.delete(dateIso);
      else next.add(dateIso);
      return next;
    });
  };

  const handleBulkModeChange = (enabled: boolean) => {
    setBulkMode(enabled);
    if (!enabled) setSelectedDates(new Set());
  };

  const handleRemoveBulkFecha = (fecha: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      next.delete(fecha);
      if (next.size === 0) setBulkOpen(false);
      return next;
    });
  };

  const handleBulkSubmit = async (values: BulkFeriadosFormValues) => {
    setBulkSaving(true);
    try {
      const response = await crearDiasNoLaborablesBulk({
        dias: values.fechas.map((fecha) => ({
          esRecurrente: false,
          fecha,
          descripcion: values.descripcion,
        })),
      });

      toast.success(`${response.diasCreados.length} días no laborables registrados.`);
      setBulkOpen(false);
      setSelectedDates(new Set());
      setBulkMode(false);

      if (response.totalConflictos > 0) {
        setConflictos(response.conflictosDetectados);
        setConflictosOpen(true);
      }

      await refreshAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar feriados");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleSubmit = async (values: FeriadoFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await actualizarDiaNoLaborable(editing.id, values);
        toast.success("Día no laborable actualizado.");
      } else {
        const response = await crearDiaNoLaborable(values);
        toast.success("Día no laborable registrado.");

        if (response.totalConflictos > 0) {
          setConflictos(response.conflictosDetectados);
          setConflictosOpen(true);
        }
      }

      setFormOpen(false);
      await refreshAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await eliminarDiaNoLaborable(toDelete.id);
      toast.success("Día no laborable eliminado.");
      setDeleteOpen(false);
      setToDelete(null);
      await refreshAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DiasNoLaborablesTab)}
          className="w-full gap-0"
        >
          <CardHeader className="p-8 pt-6 pb-5">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-heading-dark">
                Días no laborables
              </h1>
              <p className="text-sm font-medium italic text-text-muted-dark">
                Gestione feriados del ente y revise advertencias de cronogramas afectados.
              </p>
            </div>
          </CardHeader>

          <div className="border-y border-slate-100 px-8 py-5">
            <TabsList className="grid h-auto w-full grid-cols-1 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 p-1.5 shadow-inner sm:min-h-14 sm:grid-cols-2">
              <TabsTrigger value="alertas" className={diasNoLaborablesTabTriggerClassName}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Advertencias activas</span>
                {alertasPendientes.length > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-1 border-cronograma-alert-border bg-cronograma-alert-bg text-cronograma-alert-text text-[10px] px-1.5 py-0"
                  >
                    {alertasPendientes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="gestion" className={diasNoLaborablesTabTriggerClassName}>
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>Gestionar días no laborables</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-8 pt-8">
            <TabsContent value="alertas" className="mt-0">
              <FeriadosAlertasTab alertas={alertas} onResolved={() => void fetchAlertas()} />
            </TabsContent>

            <TabsContent value="gestion" className="mt-0 space-y-4">
              <p className="text-sm text-text-muted-dark">
                Registre feriados del ente. Use selección múltiple en el calendario para registrar
                varios días a la vez.
              </p>
              <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                <FeriadosCalendar
                  feriadoDates={feriadoDates}
                  feriadoDescriptions={feriadoDescriptions}
                  selectedYear={selectedYear}
                  bulkMode={bulkMode}
                  selectedDates={selectedDates}
                  onBulkModeChange={handleBulkModeChange}
                  onToggleSelect={handleToggleSelect}
                  onClearSelection={() => setSelectedDates(new Set())}
                  onOpenBulkDialog={() => setBulkOpen(true)}
                  onDayClick={handleCalendarDayClick}
                />

                <FeriadosTable
                  data={data}
                  metadata={metadata}
                  loading={loading}
                  selectedYear={selectedYear}
                  onYearChange={(year) => {
                    setSelectedYear(year);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  onCreate={() => openCreate()}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <FeriadoFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setDateLocked(false);
        }}
        editing={editing}
        initialDate={initialDate}
        dateLocked={dateLocked}
        onSubmit={handleSubmit}
        loading={saving}
      />

      <BulkFeriadosDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        fechas={selectedDatesList}
        onRemoveFecha={handleRemoveBulkFecha}
        onSubmit={handleBulkSubmit}
        loading={bulkSaving}
      />

      <EliminarFeriadoDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        descripcion={toDelete?.descripcion ?? ""}
        onConfirm={() => void handleDelete()}
        loading={deleting}
      />

      <ConflictosDialog
        open={conflictosOpen}
        onOpenChange={setConflictosOpen}
        conflictos={conflictos}
      />
    </div>
  );
}
