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

export interface ClausulaBibliotecaItem {
  id: string;
  titulo: string;
  cuerpoHtml: string;
  basamentoLegal?: string;
  savedAt: string;
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

export function getModeloContratoFormStorageKey(expedienteId: string): string {
  return `modelo-contrato-form:${expedienteId}`;
}

export function getClausulasBibliotecaEnteStorageKey(enteId: string): string {
  return `clausulas-biblioteca-ente:${enteId}`;
}

/** Seed local (stub API). Incluye el ejemplo OBJETO DEL CONTRATO de la documentación. */
export const CLAUSULAS_GENERICAS_SEED: ClausulaBase[] = [
  {
    id: "gen-objeto",
    codigo: "objeto",
    titulo: "OBJETO DEL CONTRATO",
    basamentoLegal:
      "Artículos 116 de la Ley de Contrataciones Públicas; Artículo 132, Numeral 2 de su Reglamento.",
    kind: "preceptiva",
    origen: "generica",
    variablesSugeridas: ["desc_objeto_contratacion_au_au", "cod_nomenclatura_proceso_au_au"],
    cuerpoHtml: `<p>El objeto del presente contrato es la {desc_objeto_contratacion_au_au}, de conformidad con las condiciones, especificaciones técnicas y alcances definidos en el Pliego de Condiciones y en la oferta presentada por “LA CONTRATISTA” en el procedimiento competitivo N° {cod_nomenclatura_proceso_au_au}, y los anexos que más adelante se identifican y que forman parte integrante de este contrato.</p>`,
  },
  {
    id: "gen-plazo",
    codigo: "plazo",
    titulo: "PLAZO Y CRONOGRAMA DE ENTREGA",
    basamentoLegal: "Artículos 116 LCP; 132 RLCP.",
    kind: "preceptiva",
    origen: "generica",
    variablesSugeridas: ["plazo_ejecucion_procedimiento_au_au"],
    cuerpoHtml: `<p>“LA CONTRATISTA” se obliga a ejecutar y entregar el objeto del contrato dentro del plazo de {plazo_ejecucion_procedimiento_au_au} días continuos, contados a partir de la orden de inicio, conforme al cronograma aprobado por “EL CONTRATANTE”.</p>`,
  },
  {
    id: "gen-precio",
    codigo: "precio",
    titulo: "PRECIO Y FORMA DE PAGO",
    basamentoLegal: "Artículos 116 LCP; 132 RLCP.",
    kind: "preceptiva",
    origen: "generica",
    variablesSugeridas: ["monto_total_renglon_au_au"],
    cuerpoHtml: `<p>El precio total del presente contrato asciende a la cantidad de {monto_total_renglon_au_au} bolívares, IVA incluido, el cual será pagado conforme a las condiciones establecidas en el Pliego de Condiciones y en la normativa aplicable.</p>`,
  },
  {
    id: "gen-garantias",
    codigo: "garantias",
    titulo: "GARANTÍAS",
    basamentoLegal: "Artículos 123, 124 y 125 LCP; Normas SUNAI.",
    kind: "facultativa",
    origen: "generica",
    cuerpoHtml: `<p>“LA CONTRATISTA” constituirá las garantías exigidas en el Pliego de Condiciones para asegurar el fiel cumplimiento de las obligaciones derivadas del presente contrato, en los términos y porcentajes allí establecidos.</p>`,
  },
  {
    id: "gen-responsabilidad",
    codigo: "responsabilidad",
    titulo: "RESPONSABILIDAD SOCIAL",
    basamentoLegal: "Artículos 31 y 32 LCP; 41 RLCP; Norma 34 SUNAI.",
    kind: "facultativa",
    origen: "generica",
    cuerpoHtml: `<p>“LA CONTRATISTA” se compromete a dar cumplimiento al Compromiso de Responsabilidad Social (CRS) en la modalidad y términos definidos en el Pliego de Condiciones, bajo la supervisión de la unidad técnica designada por “EL CONTRATANTE”.</p>`,
  },
];
