"use client";

import type { DocumentoAnalizado, PreguntaSeguimiento } from "@/types/compliance.types";
import { TIPO_DOCUMENTO_LABELS } from "@/types/compliance.types";
import { ClipboardCheck } from "lucide-react";

interface Props {
  documento: DocumentoAnalizado;
  /** Si se pasa, muestra solo ese ítem; si no, toda la rúbrica. */
  pregunta?: PreguntaSeguimiento;
  index?: number;
  total?: number;
}

const ESTADO_LABEL: Record<string, string> = {
  si: "Sí",
  no: "No",
  parcial: "Parcial",
  na: "N/A",
  no_consta: "No consta",
};

function estadoClass(estado?: string | null) {
  switch (estado) {
    case "si":
      return "border-vigente-border bg-success-bg text-success-text";
    case "no":
      return "border-danger bg-doc-warning-bg text-danger";
    case "parcial":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "na":
      return "border-border-light bg-white text-muted-foreground";
    default:
      return "border-border-light bg-slate-bg text-muted-foreground";
  }
}

function RubricaItem({ pregunta, index }: { pregunta: PreguntaSeguimiento; index: number }) {
  return (
    <li className="space-y-1 border-t border-border-light pt-2 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed text-heading-dark">
          <span className="mr-1 text-[11px] font-semibold text-muted-foreground">{index}.</span>
          {pregunta.texto}
        </p>
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${estadoClass(pregunta.estado)}`}
        >
          {ESTADO_LABEL[pregunta.estado || ""] || pregunta.estado || "—"}
        </span>
      </div>
      {pregunta.respuesta ? (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{pregunta.respuesta}</p>
      ) : null}
      {pregunta.ref ? (
        <p className="text-[10px] text-muted-foreground">Ref: {pregunta.ref}</p>
      ) : null}
    </li>
  );
}

/** Checklist auditado por el Analista (solo lectura; no pide respuesta al usuario). */
export function QuestionnaireCard({ documento, pregunta, index, total }: Props) {
  const items = pregunta ? [pregunta] : documento.preguntas_seguimiento;
  const hechas = documento.preguntas_seguimiento.filter((p) => p.respondida).length;
  const tot = total ?? documento.preguntas_seguimiento.length;

  if (!items.length) return null;

  return (
    <div className="self-start w-full max-w-[min(720px,92%)] space-y-3 rounded-xl border border-navy/25 bg-slate-bg px-4 py-3">
      <div className="flex items-start gap-2">
        <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-navy" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Rúbrica · {TIPO_DOCUMENTO_LABELS[documento.tipo] || documento.tipo} · {hechas}/{tot}
            {documento.estatus_global ? ` · ${documento.estatus_global}` : ""}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{documento.nombre_archivo}</p>
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((p, i) => (
          <RubricaItem key={p.id} pregunta={p} index={pregunta && index ? index : i + 1} />
        ))}
      </ul>
    </div>
  );
}
