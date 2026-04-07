"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalisisModalidad } from "@/types/expediente.types";

interface AnalisisModalidadStepProps {
  data: AnalisisModalidad;
  onEdit: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

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

export function AnalisisModalidadStep({
  data,
  onEdit,
  onConfirm,
  isLoading = false,
}: AnalisisModalidadStepProps) {
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

      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isLoading}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Editar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando borrador...
            </>
          ) : (
            "Confirmar"
          )}
        </Button>
      </div>
    </div>
  );
}
