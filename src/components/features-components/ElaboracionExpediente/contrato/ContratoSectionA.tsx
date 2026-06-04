"use client";

import type { Control } from "react-hook-form";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import { getPlazoEjecucionCopy } from "@/lib/constants/contratoFieldCopy";
import {
  ContratoDateField,
  ContratoMontoField,
  ContratoTextField,
} from "./ContratoFieldPrimitives";

interface ContratoSectionAProps {
  control: Control<ContratoFormValues>;
  tipoContratacion: TipoContratacionBackend;
  readOnly?: boolean;
}

export function ContratoSectionA({ control, tipoContratacion, readOnly }: ContratoSectionAProps) {
  const plazoCopy = getPlazoEjecucionCopy(tipoContratacion);

  return (
    <div className="space-y-6">
      <ContratoDateField
        control={control}
        name="fechaInicioVigencia"
        readOnly={readOnly}
        label="Indique la fecha de inicio de vigencia del contrato."
        legal="Artículos 118.1 LCP; 34 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoDateField
        control={control}
        name="fechaFinVigencia"
        readOnly={readOnly}
        label="Indique la fecha de finalización de vigencia del contrato."
        legal="Artículos 118.6 LCP; 34 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoMontoField
        control={control}
        name="montoContratacionConIva"
        readOnly={readOnly}
        label="Ingrese el monto de la contratación en bolívares (Bs), incluyendo el Impuesto al Valor Agregado (IVA)"
        legal="Artículos 74 LCP; 25 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />
      <ContratoTextField
        control={control}
        name="plazoEjecucionDiasAuAu"
        readOnly={readOnly}
        label={plazoCopy.label}
        legal={plazoCopy.legal}
        placeholder="Ej: 30"
      />
      <ContratoDateField
        control={control}
        name="plazoGarantiaCalidad"
        readOnly={readOnly}
        label="Indique el plazo de garantía de calidad / funcionamiento (en días continuos) contados a partir de la recepción definitiva."
        legal="Artículo 116.5 LCP."
      />
    </div>
  );
}
