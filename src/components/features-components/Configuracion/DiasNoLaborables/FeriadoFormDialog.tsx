"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feriadoFormSchema, type FeriadoFormValues } from "@/lib/schemas/cronogramaEnteSchema";
import type { DiaNoLaborable } from "@/types/cronogramaEnte.types";
import { formatIsoDate, parseIsoDate } from "@/lib/utils/diasNoLaborablesUtils";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

/** Días del mes para feriados recurrentes (febrero incluye 29 para años bisiestos). */
function getMaxDayInMonth(month: string): number {
  const daysByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const index = Number(month) - 1;
  return daysByMonth[index] ?? 31;
}

function buildRecurrentDayOptions(month: string) {
  const maxDay = getMaxDayInMonth(month);
  return Array.from({ length: maxDay }, (_, index) => {
    const day = index + 1;
    return {
      value: String(day).padStart(2, "0"),
      label: String(day),
    };
  });
}

function clampRecurrentDay(month: string, day: string): string {
  const maxDay = getMaxDayInMonth(month);
  const numericDay = Math.min(Math.max(Number(day) || 1, 1), maxDay);
  return String(numericDay).padStart(2, "0");
}

function isoToRecurrente(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${month}-${day}`;
}

interface FeriadoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: DiaNoLaborable | null;
  initialDate?: string | null;
  /** Fecha fijada desde el calendario gráfico: solo tipo y descripción. */
  dateLocked?: boolean;
  onSubmit: (values: FeriadoFormValues) => Promise<void>;
  loading?: boolean;
}

function getDefaultValues(
  editing?: DiaNoLaborable | null,
  initialDate?: string | null
): FeriadoFormValues {
  if (editing) {
    if (editing.esRecurrente) {
      return {
        esRecurrente: true,
        fechaRecurrente: editing.fechaRecurrente ?? "01-01",
        descripcion: editing.descripcion,
      };
    }
    return {
      esRecurrente: false,
      fecha: editing.fecha?.split("T")[0] ?? formatIsoDate(new Date()),
      descripcion: editing.descripcion,
    };
  }

  if (initialDate) {
    return {
      esRecurrente: false,
      fecha: initialDate,
      descripcion: "",
    };
  }

  return {
    esRecurrente: false,
    fecha: formatIsoDate(new Date()),
    descripcion: "",
  };
}

export function FeriadoFormDialog({
  open,
  onOpenChange,
  editing,
  initialDate,
  dateLocked = false,
  onSubmit,
  loading = false,
}: FeriadoFormDialogProps) {
  const form = useForm<FeriadoFormValues>({
    resolver: zodResolver(feriadoFormSchema),
    defaultValues: getDefaultValues(editing, initialDate),
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(editing, initialDate));
    }
  }, [open, editing, initialDate, form]);

  const esRecurrente = form.watch("esRecurrente");
  const fechaEspecifica = !esRecurrente ? form.watch("fecha") : "";
  const recurrenteValue =
    form.watch("esRecurrente") === true ? form.watch("fechaRecurrente") : "01-01";
  const [recurrentMonth = "01", recurrentDayRaw = "01"] = recurrenteValue.split("-");
  const recurrentDay = clampRecurrentDay(recurrentMonth, recurrentDayRaw);
  const recurrentDayOptions = useMemo(
    () => buildRecurrentDayOptions(recurrentMonth),
    [recurrentMonth]
  );

  useEffect(() => {
    if (!esRecurrente) return;
    const [month = "01", day = "01"] = recurrenteValue.split("-");
    const clampedDay = clampRecurrentDay(month, day);
    if (day !== clampedDay) {
      form.setValue("fechaRecurrente", `${month}-${clampedDay}`, { shouldValidate: true });
    }
  }, [esRecurrente, recurrenteValue, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-heading-dark">
            {editing ? "Editar día no laborable" : "Registrar día no laborable"}
          </DialogTitle>
          <DialogDescription>
            Configure feriados del ente que se tratarán como días inhábiles en el cronograma.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {dateLocked && initialDate && (
            <div className="rounded-md border border-border-light bg-muted/40 px-3 py-2.5 text-sm">
              <p className="text-muted-foreground">Fecha seleccionada</p>
              <p className="font-medium text-heading-dark">
                {format(parseIsoDate(initialDate), "PPP", { locale: es })}
              </p>
              {esRecurrente && (
                <p className="text-xs text-muted-foreground mt-1">
                  Se repetirá cada año el{" "}
                  {format(parseIsoDate(initialDate), "d 'de' MMMM", { locale: es })}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Tipo de feriado</Label>
            <Select
              value={esRecurrente ? "recurrente" : "especifico"}
              onValueChange={(value) => {
                const descripcion = form.getValues("descripcion");
                const presetDate = initialDate ?? formatIsoDate(new Date());

                if (value === "recurrente") {
                  form.reset({
                    esRecurrente: true,
                    fechaRecurrente: dateLocked ? isoToRecurrente(presetDate) : "01-01",
                    descripcion,
                  });
                } else {
                  form.reset({
                    esRecurrente: false,
                    fecha: presetDate,
                    descripcion,
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especifico">Fecha específica (un solo año)</SelectItem>
                <SelectItem value="recurrente">Recurrente (cada año)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              placeholder="Ej. Navidad, Aniversario institucional"
              {...form.register("descripcion")}
            />
            {form.formState.errors.descripcion && (
              <p className="text-sm text-danger">{form.formState.errors.descripcion.message}</p>
            )}
          </div>

          {!dateLocked && esRecurrente ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select
                  value={recurrentMonth}
                  onValueChange={(month) => {
                    const day = clampRecurrentDay(month, recurrentDay);
                    form.setValue("fechaRecurrente", `${month}-${day}`, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Día</Label>
                <Select
                  value={recurrentDay}
                  onValueChange={(day) =>
                    form.setValue("fechaRecurrente", `${recurrentMonth}-${day}`, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el día" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {recurrentDayOptions.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {esRecurrente &&
                (form.formState.errors as { fechaRecurrente?: { message?: string } })
                  .fechaRecurrente && (
                  <p className="col-span-2 text-sm text-danger">
                    {
                      (form.formState.errors as { fechaRecurrente?: { message?: string } })
                        .fechaRecurrente?.message
                    }
                  </p>
                )}
            </div>
          ) : !dateLocked ? (
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal border-border-light",
                      !fechaEspecifica && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {fechaEspecifica
                      ? format(parseIsoDate(fechaEspecifica), "PPP", { locale: es })
                      : "Seleccione una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaEspecifica ? parseIsoDate(fechaEspecifica) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("fecha", formatIsoDate(date), { shouldValidate: true });
                      }
                    }}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {!esRecurrente &&
                (form.formState.errors as { fecha?: { message?: string } }).fecha && (
                  <p className="text-sm text-danger">
                    {(form.formState.errors as { fecha?: { message?: string } }).fecha?.message}
                  </p>
                )}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-navy hover:bg-navy-hover">
              {loading ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
