"use client";

import type { Control } from "react-hook-form";
import type { TipoContratacionBackend } from "@/lib/schemas/expedienteSchema";
import type { ContratoFormValues } from "@/lib/schemas/contratoSchema";
import { getCriterioAceptacionCopy } from "@/lib/constants/contratoFieldCopy";
import {
  ContratoTextField,
  ContratoTextareaField,
  ContratoCedulaField,
} from "./ContratoFieldPrimitives";

interface ContratoSectionBProps {
  control: Control<ContratoFormValues>;
  tipoContratacion: TipoContratacionBackend;
  readOnly?: boolean;
}

export function ContratoSectionB({ control, tipoContratacion, readOnly }: ContratoSectionBProps) {
  const criterioCopy = getCriterioAceptacionCopy(tipoContratacion);

  return (
    <div className="space-y-6">
      <ContratoTextField
        control={control}
        name="nombreSupervisor"
        readOnly={readOnly}
        label="Indique el nombre y apellido del supervisor o ingeniero inspector del contrato designado por la Unidad Usuaria."
        legal="Artículos 136, 138 LCP; 35 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoCedulaField
        control={control}
        name="cedulaSupervisor"
        readOnly={readOnly}
        label="Indique la Cédula de Identidad del supervisor o ingeniero inspector del contrato designado por la Unidad Usuaria."
        legal="Artículos 136, 138 LCP; 35 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoTextField
        control={control}
        name="cargoSupervisor"
        readOnly={readOnly}
        label="Indique el cargo del supervisor o ingeniero inspector del contrato designado por la Unidad Usuaria."
        legal="Artículos 141, 166.7 LCP; 36 NORMAS DE CONTROL INTERNO SUNAI."
      />
      <ContratoTextareaField
        control={control}
        name="criterioAceptacionContratoAuAu"
        readOnly={readOnly}
        label={criterioCopy.label}
        legal={criterioCopy.legal}
        maxLength={500}
      />
      <ContratoTextField
        control={control}
        name="plazoConsignarFacturasDias"
        readOnly={readOnly}
        label="Indique el plazo (en días) que tendrá el contratista para consignar facturas/valuaciones tras la conformidad del supervisor."
        legal="Artículos 166.7 LCP; 177 RLCP; 17, 18, 22, 65 LCC; 38.5, 91.1.9.29 LOCGR; 36 NORMAS DE CONTROL INTERNO SUNAI."
        placeholder="Ej: 15"
      />
    </div>
  );
}
