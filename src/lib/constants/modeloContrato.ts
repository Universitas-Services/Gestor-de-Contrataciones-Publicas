export type ClausulaOrigen = "generica" | "biblioteca" | "custom";
export type ClausulaKind = "preceptiva" | "facultativa";

export interface ClausulaBase {
  id: string;
  codigo?: string;
  titulo: string;
  basamentoLegal?: string;
  cuerpoHtml: string;
  kind: ClausulaKind;
  origen: ClausulaOrigen;
  variablesSugeridas?: string[];
}

export interface ClausulaEnModelo extends ClausulaBase {
  instanceId: string;
  order: number;
}

export type ModeloContratoFormStatus = "draft" | "completed";

export interface ModeloContratoStoredForm {
  clauses: ClausulaEnModelo[];
  status: ModeloContratoFormStatus;
}

export const MODELO_CONTRATO_WIZARD_TITLE = "Configuración del Modelo de Contrato";
export const MODELO_CONTRATO_WIZARD_DESCRIPTION =
  "Estructure el modelo de contrato base que acompañará al Pliego mediante la selección, edición y ordenamiento de cláusulas.";

export const MODELO_CONTRATO_DRAFT_LABEL = "Guardar borrador";
export const MODELO_CONTRATO_SUBMIT_LABEL = "Generar contrato modelo";
export const MODELO_CONTRATO_CONFIRM_TITLE = "Confirmar generación";
export const MODELO_CONTRATO_CONFIRM_DESCRIPTION =
  "Por favor, confirme que ha incluido todas las cláusulas requeridas antes de marcar este módulo como completado.";
export const MODELO_CONTRATO_SUCCESS_TITLE = "¡Modelo de contrato generado!";
export const MODELO_CONTRATO_SUCCESS_DESCRIPTION =
  "La configuración de cláusulas del modelo de contrato ha sido registrada exitosamente.";

export const MODELO_CONTRATO_REPO_TITLE = "Repositorio de Cláusulas Base";
export const MODELO_CONTRATO_DOC_TITLE = "Modelo de Contrato Final";
