import type {
  EvaluacionModuloId,
  EvaluacionOferentePersistedState,
} from "@/types/evaluacionOferente.types";

export interface ModuloGate {
  id: EvaluacionModuloId;
  unlocked: boolean;
  completedOk: boolean;
  failed: boolean;
}

export function resolveModuloGates(
  state: Pick<
    EvaluacionOferentePersistedState,
    | "legalSubmitted"
    | "oferenteCalificadoLegal"
    | "financieraSubmitted"
    | "oferenteCalificadoFinanciera"
    | "tecnicaSubmitted"
    | "oferenteCalificadoTecnica"
    | "evaluacionSubmitted"
    | "oferenteEvaluadoTecnico"
    | "oferenteEvaluadoEconomico"
    | "promocionSubmitted"
    | "unlocked"
  >,
  activaPromocionEconomica: boolean
): ModuloGate[] {
  const legalOk = state.legalSubmitted && state.oferenteCalificadoLegal === true;
  const legalFail = state.legalSubmitted && state.oferenteCalificadoLegal === false;
  const financieraOk = state.financieraSubmitted && state.oferenteCalificadoFinanciera === true;
  const financieraFail = state.financieraSubmitted && state.oferenteCalificadoFinanciera === false;
  const tecnicaOk = state.tecnicaSubmitted && state.oferenteCalificadoTecnica === true;
  const tecnicaFail = state.tecnicaSubmitted && state.oferenteCalificadoTecnica === false;
  const evaluacionOk =
    state.evaluacionSubmitted &&
    state.oferenteEvaluadoTecnico === true &&
    state.oferenteEvaluadoEconomico === true;
  const evaluacionFail =
    state.evaluacionSubmitted &&
    (state.oferenteEvaluadoTecnico === false || state.oferenteEvaluadoEconomico === false);
  const blockedByFail = legalFail || financieraFail || tecnicaFail || evaluacionFail;

  const gates: ModuloGate[] = [
    {
      id: "legal",
      unlocked: true,
      completedOk: legalOk,
      failed: legalFail,
    },
    {
      id: "financiera",
      unlocked: Boolean(state.unlocked.financiera) && !legalFail,
      completedOk: financieraOk,
      failed: financieraFail,
    },
    {
      id: "tecnica",
      unlocked: Boolean(state.unlocked.tecnica) && !(legalFail || financieraFail),
      completedOk: tecnicaOk,
      failed: tecnicaFail,
    },
    {
      id: "evaluacion",
      unlocked: Boolean(state.unlocked.evaluacion) && !(legalFail || financieraFail || tecnicaFail),
      completedOk: evaluacionOk,
      failed: evaluacionFail,
    },
  ];

  if (activaPromocionEconomica) {
    gates.push({
      id: "promocion",
      unlocked: Boolean(state.unlocked.promocion) && !blockedByFail,
      completedOk: Boolean(state.promocionSubmitted),
      failed: false,
    });
  }

  return gates;
}

export function isModuloNavigable(gate: ModuloGate): boolean {
  return gate.unlocked && !gate.failed;
}
