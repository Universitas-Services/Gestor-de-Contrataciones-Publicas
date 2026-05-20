"use client";

import type { Control } from "react-hook-form";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import { getGarantiaPostEjecucionCopy } from "@/lib/constants/contratoFieldCopy";
import {
  ContratoMontoField,
  ContratoTextField,
  ContratoTextareaField,
} from "./ContratoFieldPrimitives";

interface ContratoSectionDProps {
  control: Control<ContratoFormValues>;
  tipoContratacion: TipoContratacionBackend;
  readOnly?: boolean;
}

export function ContratoSectionD({ control, tipoContratacion, readOnly }: ContratoSectionDProps) {
  const garantiaCopy = getGarantiaPostEjecucionCopy(tipoContratacion);

  return (
    <div className="space-y-6">
      <ContratoMontoField
        control={control}
        name="porcentajeMultaDiaria"
        readOnly={readOnly}
        label="Indique el porcentaje (%) de la multa diaria a aplicar por cada día de retraso imputable al contratista."
        legal="Artículo 33 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />
      <ContratoTextField
        control={control}
        name="baseCalculoMulta"
        readOnly={readOnly}
        label="Indique la base de cálculo para la multa diaria."
        legal="Artículo 33 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoTextField
        control={control}
        name="plazoRegularizacionDias"
        readOnly={readOnly}
        label="Indique el plazo (en días hábiles) que se otorgará al contratista para regularizar el incumplimiento tras la notificación formal."
        legal="Artículo 33 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="Ej: 10"
      />
      <ContratoMontoField
        control={control}
        name="porcentajeRescision"
        readOnly={readOnly}
        label="Indique el porcentaje (%) del monto contractual que, una vez alcanzado por la penalización acumulada, activará el procedimiento de rescisión."
        legal="Artículo 33 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="0,00"
      />
      <ContratoTextField
        control={control}
        name="formulaPolinomica"
        readOnly={readOnly}
        label="Indique la fórmula polinómica o el mecanismo de precios acordado para el contrato, especificando su periodicidad."
        legal="Artículo 20 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoTextareaField
        control={control}
        name="criteriosEvaluacionDesempeno"
        readOnly={readOnly}
        label="Indique los criterios específicos y medibles que se utilizarán para la evaluación de desempeño al finalizar la ejecución, conforme al artículo 40 de las Normas SUNAI. "
        legal="Artículos: 15. 17, 51, 166. 7 LCP; 17, 18, 22, 65 LCC; 38. 5, 91.1. 9. 29 LOCGR; 40 NORMAS DE CONTROL INTERNO SUNAI."
        maxLength={1000}
      />
      <ContratoTextareaField
        control={control}
        name="garantiaPostEjecucionAuAu"
        readOnly={readOnly}
        label={garantiaCopy.label}
        legal={garantiaCopy.legal}
        maxLength={500}
      />
      <ContratoTextField
        control={control}
        name="fueroExclusivoCiudad"
        readOnly={readOnly}
        label="Indique el lugar (ciudad) del tribunal que servirá de fuero exclusivo para la resolución de controversias y reclamaciones."
        legal="Artículos 133 RLCP; 18.3 LOPA; 5 NORMAS DE CONTROL INTERNO SUNAI."
      />
    </div>
  );
}
