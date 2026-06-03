"use client";

import type { Control } from "react-hook-form";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import {
  ContratoMontoField,
  ContratoPorcentajeField,
  ContratoSiNoField,
  ContratoTextField,
} from "./ContratoFieldPrimitives";

interface ContratoSectionCProps {
  control: Control<ContratoFormValues>;
  readOnly?: boolean;
}

export function ContratoSectionC({ control, readOnly }: ContratoSectionCProps) {
  return (
    <div className="space-y-8">
      <ContratoMontoField
        control={control}
        name="montoFielCumplimientoBsAuAu"
        readOnly={readOnly}
        label="Indique el monto en bolívares incluyendo el IVA del porcentaje (%) de la Garantía de Fiel Cumplimiento."
        legal="Artículos 123 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />

      <ContratoSiNoField
        control={control}
        name="requiereGarantiaLaboralAuAu"
        readOnly={readOnly}
        pregunta="Requiere garantía laboral"
        referencia="Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
      />

      <ContratoPorcentajeField
        control={control}
        name="porcentajeGarantiaLaboralAuAu"
        readOnly={readOnly}
        label="Indique el porcentaje (%) del monto del contrato para la garantía laboral."
        legal="Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0"
      />

      <ContratoMontoField
        control={control}
        name="montoGarantiaLaboralBsAuAu"
        readOnly={readOnly}
        label="Indique el monto en bolívares del porcentaje (%) de la garantía laboral."
        legal="Artículos 124 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />

      <ContratoSiNoField
        control={control}
        name="polizaResponsabilidadCivilAuAu"
        readOnly={readOnly}
        pregunta="Requiere póliza de responsabilidad civil:"
        referencia="Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
      />

      <ContratoPorcentajeField
        control={control}
        name="porcentajeResponsabilidadCivilAuAu"
        readOnly={readOnly}
        label="Indique el porcentaje (%) de la póliza de responsabilidad civil."
        legal="Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0"
      />

      <ContratoMontoField
        control={control}
        name="montoResponsabilidadCivilBsAuAu"
        readOnly={readOnly}
        label="Indique el monto en bolívares del porcentaje (%) de la póliza de responsabilidad civil."
        legal="Artículos 125 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />

      <ContratoSiNoField
        control={control}
        name="anticipoContratoAuAu"
        readOnly={readOnly}
        pregunta="Se otorga anticipo"
        referencia="Artículos 122 LCP; 19 NORMAS DE CONTROL INTERNO SUNAI."
      />

      <ContratoTextField
        control={control}
        name="formaCumplimientoCrsAuAu"
        readOnly={readOnly}
        label="Indique la forma de cumplimiento del compromiso de responsabilidad social"
        legal="Artículos 30, 31, 32, 33, 34, 118.3 LCP y 34 al 50 (exceptúa al 35)  RLCP ; 5 NORMAS DE CONTROL INTERNO SUNAI."
      />

      <ContratoTextField
        control={control}
        name="unidadRespCumplimientoCrsAuAu"
        readOnly={readOnly}
        label="Indique nombre de la unidad técnica administrativa responsable de dar seguimiento y controlar la ejecución y el cumplimiento del compromiso de responsabilidad social"
        legal="Artículos 44 RLCP; 5 NORMAS DE CONTROL INTERNO SUNAI."
      />
    </div>
  );
}
