import {
  CALIFICACION_LEGAL_DESC_MAX,
  RECAUDOS_CALIFICACION_LEGAL,
  type CalificacionLegalStoredForm,
  type RecaudoSobre,
} from "@/lib/constants/calificacionLegal";

function isAnswered(value: boolean | undefined): value is boolean {
  return value === true || value === false;
}

export function countExigidosEnSobre(
  form: CalificacionLegalStoredForm,
  sobre: RecaudoSobre
): number {
  const catalogCount = RECAUDOS_CALIFICACION_LEGAL.filter(
    (r) => r.sobre === sobre && form.exigidos[r.id] === true
  ).length;
  const customCount = form.personalizados.filter((p) => p.sobre === sobre).length;
  return catalogCount + customCount;
}

export function getCalificacionLegalValidationIssues(form: CalificacionLegalStoredForm): string[] {
  const issues: string[] = [];

  for (const recaudo of RECAUDOS_CALIFICACION_LEGAL) {
    if (!isAnswered(form.exigidos[recaudo.id])) {
      issues.push(`Seleccione SÍ o NO para: ${recaudo.titulo}`);
    }

    if (!recaudo.substitute) continue;
    if (form.exigidos[recaudo.id] !== true) continue;
    if (!isAnswered(form.sustitutos[recaudo.substitute.id])) {
      issues.push(`Responda la pregunta de sustitución para: ${recaudo.titulo}`);
    }
  }

  if (!isAnswered(form.indOtroSobre1)) {
    issues.push("Indique si desea agregar un recaudo personalizado en el Sobre N° 1.");
  }
  if (!isAnswered(form.indOtroSobre2)) {
    issues.push("Indique si desea agregar un recaudo personalizado en el Sobre N° 2.");
  }

  if (form.indOtroSobre1 === true) {
    const desc = form.descOtroSobre1.trim();
    if (!desc) {
      issues.push(
        "Indique la descripción del recaudo personalizado del Sobre N° 1, o desactive la opción."
      );
    } else if (desc.length > CALIFICACION_LEGAL_DESC_MAX) {
      issues.push(
        `La descripción del Sobre N° 1 no debe superar ${CALIFICACION_LEGAL_DESC_MAX} caracteres.`
      );
    }
    if (!isAnswered(form.modeloOtroSobre1)) {
      issues.push(
        "Indique si desea incluir un modelo para el recaudo personalizado del Sobre N° 1."
      );
    }
  }

  if (form.indOtroSobre2 === true) {
    const desc = form.descOtroSobre2.trim();
    if (!desc) {
      issues.push(
        "Indique la descripción del recaudo personalizado del Sobre N° 2, o desactive la opción."
      );
    } else if (desc.length > CALIFICACION_LEGAL_DESC_MAX) {
      issues.push(
        `La descripción del Sobre N° 2 no debe superar ${CALIFICACION_LEGAL_DESC_MAX} caracteres.`
      );
    }
    if (!isAnswered(form.modeloOtroSobre2)) {
      issues.push(
        "Indique si desea incluir un modelo para el recaudo personalizado del Sobre N° 2."
      );
    }
  }

  if (countExigidosEnSobre(form, 1) < 1) {
    issues.push("Debe exigir al menos un recaudo en el Sobre N° 1.");
  }
  if (countExigidosEnSobre(form, 2) < 1) {
    issues.push("Debe exigir al menos un recaudo en el Sobre N° 2.");
  }

  return issues;
}

export function canSubmitConfigurarRecaudos(form: CalificacionLegalStoredForm): boolean {
  return getCalificacionLegalValidationIssues(form).length === 0;
}
