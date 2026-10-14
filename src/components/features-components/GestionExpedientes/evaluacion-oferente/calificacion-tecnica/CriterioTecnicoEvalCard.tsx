"use client";

import { LocalizedDecimalInput } from "@/components/localized-decimal-input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  VALOR_OBTENIDO_MAX,
  exceedMaxMessage,
  getPuntajeMaximoCriterio,
  isModoA,
  parsePuntuacionTecnica,
  scoreCriterioTecnico,
} from "@/lib/constants/calificacionTecnicaEvaluacion";
import type {
  CriterioTecnicoPlantilla,
  CriterioTecnicoRespuesta,
} from "@/types/evaluacionOferente.types";

interface CriterioTecnicoEvalCardProps {
  index: number;
  criterio: CriterioTecnicoPlantilla;
  respuesta: CriterioTecnicoRespuesta | undefined;
  errors?: {
    rangoIdSeleccionado?: boolean;
    puntuacionObtenida?: boolean;
    valorObtenido?: boolean;
  };
  readOnly?: boolean;
  valorFisicoHint?: string;
  valorFisicoPlaceholder?: string;
  onChange: (next: CriterioTecnicoRespuesta) => void;
}

function ValorFisicoField({
  value,
  error,
  readOnly,
  hint,
  placeholder,
  onChange,
}: {
  value: string;
  error?: boolean;
  readOnly?: boolean;
  hint: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5 border-t border-border pt-4">
      <Label className="text-xs font-bold text-color-titulos">
        Valor físico detectado en la oferta (Sustento)
      </Label>
      <p className="text-[10px] italic text-muted-foreground">{hint}</p>
      <Textarea
        value={value}
        disabled={readOnly}
        maxLength={VALOR_OBTENIDO_MAX}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.slice(0, VALOR_OBTENIDO_MAX))}
        className={cn("resize-none", error && "border-destructive")}
        aria-invalid={error}
      />
      {error ? (
        <p className="text-[11px] font-medium text-destructive">
          Transcriba el valor físico detectado en la oferta.
        </p>
      ) : null}
    </div>
  );
}

export function CriterioTecnicoEvalCard({
  index,
  criterio,
  respuesta,
  errors,
  readOnly = false,
  valorFisicoHint = "Transcriba textualmente el valor o la descripción física que el oferente presentó en su oferta técnica para este criterio.",
  valorFisicoPlaceholder = 'Ej: "12 años de experiencia comprobada" (folios 45 al 50)',
  onChange,
}: CriterioTecnicoEvalCardProps) {
  const modoA = isModoA(criterio);
  const scored = scoreCriterioTecnico(criterio, respuesta);
  const valorObtenido = respuesta?.valorObtenido ?? "";
  const maxPts = getPuntajeMaximoCriterio(criterio);

  const patch = (partial: Partial<CriterioTecnicoRespuesta>) => {
    onChange({
      rangoIdSeleccionado: respuesta?.rangoIdSeleccionado,
      puntuacionObtenida: respuesta?.puntuacionObtenida ?? null,
      valorObtenido,
      ...partial,
    });
  };

  if (modoA) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
          (errors?.rangoIdSeleccionado || errors?.valorObtenido) && "border-destructive",
          scored !== null && "border-navy/30"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border bg-muted/20 p-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              {index}. {criterio.nombre}
            </p>
            <p className="text-sm text-muted-foreground">{criterio.descripcion}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] font-bold uppercase">
              Modo selección
            </Badge>
          </div>
          <div className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-center">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Puntos</p>
            <p className="text-lg font-black text-navy">{scored !== null ? scored : "—"}</p>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <Label className="mb-3 block text-xs font-bold text-color-titulos">
              Seleccione el rango alcanzado por el oferente
            </Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {criterio.rangos.map((rango) => {
                const selected = respuesta?.rangoIdSeleccionado === rango.id;
                return (
                  <button
                    key={rango.id}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      patch({
                        rangoIdSeleccionado: rango.id,
                        puntuacionObtenida: rango.puntaje,
                      })
                    }
                    className={cn(
                      "rounded-lg border-2 p-4 text-left transition-colors",
                      selected
                        ? "border-navy bg-navy/5"
                        : "border-border bg-card hover:border-navy/40 hover:bg-muted/40",
                      readOnly && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          selected ? "border-navy bg-navy" : "border-slate-300"
                        )}
                      >
                        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                      </span>
                      <span className="text-sm font-black text-color-titulos">
                        {rango.puntaje} pts
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-color-subtitulos">
                      {rango.descripcion}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors?.rangoIdSeleccionado ? (
              <p className="mt-2 text-[11px] font-medium text-destructive">Seleccione un rango.</p>
            ) : null}
          </div>

          <ValorFisicoField
            value={valorObtenido}
            error={errors?.valorObtenido}
            readOnly={readOnly}
            hint={valorFisicoHint}
            placeholder={valorFisicoPlaceholder}
            onChange={(value) => patch({ valorObtenido: value })}
          />
        </div>
      </div>
    );
  }

  const ptsRaw = respuesta?.puntuacionObtenida;
  const exceedsMax =
    ptsRaw !== null && ptsRaw !== undefined && Number.isFinite(ptsRaw) && ptsRaw > maxPts;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        (errors?.puntuacionObtenida || errors?.valorObtenido || exceedsMax) && "border-destructive",
        scored !== null && !exceedsMax && "border-navy/30"
      )}
    >
      <div className="flex flex-col gap-4 border-b border-border bg-muted/20 p-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            {index}. {criterio.nombre}
          </p>
          <p className="text-sm text-muted-foreground">{criterio.descripcion}</p>
          <Badge variant="secondary" className="mt-1 text-[10px] font-bold uppercase">
            Modo entrada
          </Badge>
        </div>

        <div
          className={cn(
            "shrink-0 space-y-1.5 rounded-md border bg-card p-3",
            exceedsMax || errors?.puntuacionObtenida ? "border-destructive" : "border-border"
          )}
        >
          <Label className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
            Asignar puntos
          </Label>
          <LocalizedDecimalInput
            value={ptsRaw ?? null}
            fractionDigits={2}
            allowEmpty
            outputMode="raw"
            disabled={readOnly}
            className={cn(
              "h-9 w-24",
              (exceedsMax || errors?.puntuacionObtenida) && "border-destructive"
            )}
            onValueChange={(raw) => {
              const parsed = parsePuntuacionTecnica(raw);
              patch({ puntuacionObtenida: parsed });
            }}
          />
          {(exceedsMax || errors?.puntuacionObtenida) && (
            <p className="max-w-[11rem] text-[10px] font-medium leading-snug text-destructive">
              {exceedMaxMessage(maxPts)}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-3 text-muted-foreground">
          <p className="text-xs font-semibold">
            Rango único: {criterio.rangos[0]?.descripcion ?? "—"}
          </p>
          <span className="text-xs font-black">Máx: {maxPts} pts</span>
        </div>

        <ValorFisicoField
          value={valorObtenido}
          error={errors?.valorObtenido}
          readOnly={readOnly}
          hint={valorFisicoHint}
          placeholder={valorFisicoPlaceholder}
          onChange={(value) => patch({ valorObtenido: value })}
        />
      </div>
    </div>
  );
}
