"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { AnalisisModalidad } from "@/types/expediente.types";

interface AnalisisModalidadStepProps {
  data: AnalisisModalidad;
  onEdit: () => void;
  onConfirm: () => void;
}

// ─── Info Card ──────────────────────────────────────────────────────

function InfoCard({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:shadow-sm ${
        accent ? "border-l-4 border-l-card-accent-border" : ""
      }`}
    >
      <h4 className="text-heading-dark font-bold text-sm mb-1">{title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export function AnalisisModalidadStep({ data, onEdit, onConfirm }: AnalisisModalidadStepProps) {
  const formatBs = (amount: number) =>
    `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

  const formatUsd = (amount: number) =>
    `$ ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <InfoCard title="Objeto del Proceso" value={data.objetoProceso} />

      <InfoCard title="Tipo de contratación" value={data.tipoContratacion} />

      <InfoCard
        title="Monto en UCAU"
        value={data.montoUCAU.toLocaleString("es-VE", { minimumFractionDigits: 1 })}
      />

      <InfoCard title="Monto en Bs" value={formatBs(data.montoBs)} />

      <InfoCard title="Monto en $" value={formatUsd(data.montoDolares)} />

      <InfoCard title="Modalidad de Contratación Sugerida" value={data.modalidadSugerida} accent />

      <InfoCard title="Base Legal" value={data.baseLegal} accent />

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Editar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
