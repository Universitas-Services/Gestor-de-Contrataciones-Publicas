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
  isLoading = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:shadow-sm ${
        accent ? "border-l-4 border-l-card-accent-border" : ""
      }`}
    >
      <h4 className="text-heading-dark font-bold text-sm mb-1">{title}</h4>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          <span className="text-slate-400 text-sm">Consultando tasas...</span>
        </div>
      ) : (
        <p className="text-slate-500 text-sm leading-relaxed">{value}</p>
      )}
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

  const formatUcau = (amount: number) =>
    `${amount.toLocaleString("es-VE", { minimumFractionDigits: 4 })} UCAU`;

  return (
    <div className="space-y-4">
      <InfoCard title="Objeto del Proceso" value={data.objetoProceso} />
      <InfoCard title="Tipo de contratación" value={data.tipoContratacion} />
      <InfoCard title="Monto en Bs" value={formatBs(data.montoBs)} />

      {/* Monto USD — calculado dinámicamente desde el SDK (BCV) */}
      <InfoCard
        title="Monto en $ (Referencia BCV)"
        value={
          data.montoDolares !== null
            ? `${formatUsd(data.montoDolares)}${data.tasaBcvUsd ? ` — Tasa BCV: Bs. ${data.tasaBcvUsd.toFixed(4)}` : ""}`
            : "—"
        }
        isLoading={data.isLoadingRates}
      />

      {/* Monto UCAU — calculado dinámicamente desde el SDK (UCAUU) */}
      <InfoCard
        title="Monto en UCAU"
        value={
          data.montoUCAU !== null
            ? `${formatUcau(data.montoUCAU)}${data.valorUcau ? ` — 1 UCAU = Bs. ${data.valorUcau.toFixed(2)}` : ""}`
            : "—"
        }
        isLoading={data.isLoadingRates}
      />

      <InfoCard title="Modalidad de Contratación Sugerida" value={data.modalidadSugerida} accent />
      <InfoCard title="Base Legal" value={data.baseLegal} accent />

      <div className="flex justify-between pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isLoading || data.isLoadingRates}
          className="border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          Editar
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading || data.isLoadingRates}
          className="bg-navy hover:bg-navy-hover text-white font-semibold px-8 h-11 rounded-md cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando borrador...
            </>
          ) : data.isLoadingRates ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando tasas...
            </>
          ) : (
            "Confirmar"
          )}
        </Button>
      </div>
    </div>
  );
}
