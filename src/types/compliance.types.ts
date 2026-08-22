/** Tipos espejo de la API FastAPI de compliance. */

export type TipoContratacion = "BIENES" | "OBRAS" | "SERVICIOS";

export type Modalidad =
  | "CA_ACTO_UNICO_APERTURA_UNICA"
  | "CA_ACTO_UNICO_APERTURA_DIFERIDA"
  | "CA_ACTO_SEPARADO"
  | "CONCURSO_CERRADO"
  | "CONSULTA_PRECIO"
  | "CONTRATACION_DIRECTA"
  | "MODALIDADES_EXCLUIDAS";

export type EstadoSesion = "CONFIGURANDO" | "ACTIVA" | "CERRADA";

export type NivelRiesgo = "SIN_HALLAZGOS" | "OBSERVACIONES" | "RIESGO_ALTO";

export type TipoDocumento =
  | "ACTIVIDADES_PREVIAS"
  | "ACTA_INICIO"
  | "PLIEGO_CONDICIONES"
  | "CONDICIONES_CONTRATACION"
  | "LLAMADO"
  | "INVITACIONES"
  | "PUNTO_DE_CUENTA"
  | "ACTO_MOTIVADO_INICIO"
  | "ACTA_RECEPCION_SOBRES"
  | "ACTA_APERTURA_SOBRES"
  | "ACTA_RECEPCION_MV_CALIF_OFERTAS"
  | "ACTA_APERTURA_MV_CALIFICACION"
  | "INFORME_CALIFICACION"
  | "NOTIFICACION_CALIFICACION"
  | "ACTA_APERTURA_OFERTAS_DEVOLUCION"
  | "ACTA_RECEPCION_MV_CALIFICACION"
  | "ACTA_RECEPCION_OFERTAS"
  | "ACTA_APERTURA_OFERTAS"
  | "ACTA_RECEPCION_CALIF_OFERTAS"
  | "ACTA_APERTURA_CALIF_OFERTAS"
  | "OFERTAS"
  | "GARANTIA_SOSTENIMIENTO_OFERTA"
  | "INFORME_EVALUACION_RECOMENDACION"
  | "INFORME_RECOMENDACION"
  | "INFORME_VERIFICACION_RAZONABILIDAD"
  | "INFORME_VERIFICACION_ADJUDICACION"
  | "INFORME_OPINION_COMISION"
  | "ADJUDICACION_O_EQUIVALENTE"
  | "ADJUDICACION_ACTO_MOTIVADO"
  | "NOTIFICACION_ADJUDICADOS"
  | "NOTIFICACION_NO_ADJUDICADOS"
  | "NOTIFICACION_INTERESADOS"
  | "CONTRATO"
  | "RESPONSABILIDAD_SOCIAL"
  | "OTROS";

export type Severidad = "info" | "advertencia" | "critica";

export interface Observacion {
  severidad: Severidad;
  descripcion: string;
  subsanacion?: string | null;
  ref?: string | null;
  codigo_pregunta?: string | null;
  fundamento_legal?: string | null;
  rango_criticidad?: string | null;
  accion_legal?: string | null;
  advertencia_gerencia?: string | null;
}

export interface PreguntaSeguimiento {
  id: string;
  texto: string;
  respondida: boolean;
  respuesta?: string | null;
  estado?: "si" | "no" | "parcial" | "na" | "no_consta" | null;
  ref?: string | null;
  respondida_por?: "agente" | "usuario";
  codigo_pregunta?: string | null;
  fundamento_legal?: string | null;
  rango_criticidad?: string | null;
  accion_legal?: string | null;
  advertencia_gerencia?: string | null;
}

export interface SlotChecklist {
  tipo_documento: TipoDocumento;
  descripcion: string;
  elementos_requeridos: string[];
  auditado: boolean;
}

export interface MensajeChat {
  rol: "user" | "assistant" | "system";
  contenido: string;
  timestamp: string;
}

export interface ExtraccionMeta {
  metodo: string;
  paginas: number;
  bloques: number;
  advertencias: string[];
  cobertura_ocr?: number | null;
}

export interface DictamenJuridico {
  id: string;
  fecha: string;
  alcance: "PARCIAL" | "FINAL";
  documento_ids: string[];
  mensaje_usuario: string;
  markdown: string;
  slots_pendientes: TipoDocumento[];
}

export interface DocumentoAnalizado {
  id: string;
  tipo: TipoDocumento;
  nombre_archivo: string;
  resumen: string;
  observaciones: Observacion[];
  cumple: boolean;
  fecha_analisis: string;
  informe_markdown: string;
  preguntas_seguimiento: PreguntaSeguimiento[];
  tipo_coincide?: boolean;
  tipo_detectado?: string | null;
  texto_extraido?: string;
  extraccion?: ExtraccionMeta | null;
  hechos_clave?: {
    montos?: {
      etiqueta: string;
      texto?: string;
      valor_num?: number | null;
      moneda?: string | null;
    }[];
    plazos?: { etiqueta: string; texto: string }[];
    partes?: string[];
    nomenclatura_encontrada?: string | null;
    otros?: string[];
  };
  estatus_global?: "Verde" | "Amarillo" | "Rojo" | null;
}

export interface SesionCompliance {
  id: string;
  nomenclatura: string | null;
  modalidad: Modalidad | null;
  tipo_contratacion: TipoContratacion | null;
  estado: EstadoSesion;
  fecha_inicio?: string;
  historial: MensajeChat[];
  checklist_slots: SlotChecklist[];
  documentos_analizados: DocumentoAnalizado[];
  documento_en_cuestionario?: string | null;
  dictamenes_juridicos?: DictamenJuridico[];
}

export interface SesionResumen {
  id: string;
  nomenclatura: string | null;
  modalidad: Modalidad | null;
  tipo_contratacion: TipoContratacion | null;
  estado: EstadoSesion;
  docs_count: number;
  updated_hint: string | null;
  fecha_inicio?: string | null;
  docs_revisados?: number;
  docs_totales?: number;
  progreso_pct?: number;
  riesgo?: NivelRiesgo;
}

export interface SesionesListaResponse {
  items: SesionResumen[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ListarSesionesParams {
  page?: number;
  page_size?: number;
  q?: string;
  modalidad?: Modalidad;
  tipo_contratacion?: TipoContratacion;
  estado?: EstadoSesion;
}

export interface CrearSesionRequest {
  nomenclatura?: string | null;
  modalidad?: Modalidad | null;
  tipo_contratacion?: TipoContratacion | null;
}

export interface MensajeResponse {
  sesion: SesionCompliance;
  respuesta: string;
}

export const MODALIDAD_LABELS: Record<Modalidad, string> = {
  CA_ACTO_UNICO_APERTURA_UNICA: "Concurso Abierto - Acto Único Apertura Única",
  CA_ACTO_UNICO_APERTURA_DIFERIDA: "Concurso Abierto - Acto Único Apertura Diferida",
  CA_ACTO_SEPARADO: "Concurso Abierto - Acto Separado",
  CONCURSO_CERRADO: "Concurso Cerrado",
  CONSULTA_PRECIO: "Consulta de Precio",
  CONTRATACION_DIRECTA: "Contratación Directa",
  MODALIDADES_EXCLUIDAS: "Modalidades Excluidas",
};

export const MODALIDAD_HINTS: Record<Modalidad, string> = {
  CA_ACTO_UNICO_APERTURA_UNICA: "Concurso abierto · acto único · apertura en un solo momento",
  CA_ACTO_UNICO_APERTURA_DIFERIDA:
    "Concurso abierto · acto único · apertura técnica y económica diferida",
  CA_ACTO_SEPARADO: "Concurso abierto · actos separados",
  CONCURSO_CERRADO: "Invitación a oferentes preseleccionados",
  CONSULTA_PRECIO: "Comparación de cotizaciones / precios",
  CONTRATACION_DIRECTA: "Selección directa justificada",
  MODALIDADES_EXCLUIDAS: "Supuestos fuera del régimen ordinario",
};

export const TIPO_CONTRATACION_LABELS: Record<TipoContratacion, string> = {
  BIENES: "Bienes",
  OBRAS: "Obra",
  SERVICIOS: "Servicio",
};

export const MODALIDADES = Object.keys(MODALIDAD_LABELS) as Modalidad[];
export const TIPOS_CONTRATACION: TipoContratacion[] = ["BIENES", "OBRAS", "SERVICIOS"];

/** Etiquetas humanas para tipos de documento (espejo API / catálogo oficial). */
export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  ACTIVIDADES_PREVIAS: "Actividades Previas",
  ACTA_INICIO: "Acta de Inicio",
  PLIEGO_CONDICIONES: "Pliego de Condiciones",
  CONDICIONES_CONTRATACION: "Condiciones de Contratación",
  LLAMADO: "Llamado a participar",
  INVITACIONES: "Invitaciones",
  PUNTO_DE_CUENTA: "Documento que Autoriza el Inicio del Procedimiento (Punto de Cuenta)",
  ACTO_MOTIVADO_INICIO: "Acto Motivado que Autoriza Inicio Procedimiento",
  ACTA_RECEPCION_SOBRES: "Acta de Recepción de Sobres",
  ACTA_APERTURA_SOBRES: "Acta de Apertura de Sobres",
  ACTA_RECEPCION_MV_CALIF_OFERTAS:
    "Acta de Recepción de Manifestaciones de Voluntad, Documentos de Calificación y Ofertas",
  ACTA_APERTURA_MV_CALIFICACION:
    "Acta de Apertura de Manifestaciones de Voluntad y Documentos de Calificación",
  INFORME_CALIFICACION: "Informe de Calificación",
  NOTIFICACION_CALIFICACION: "Notificación de Calificación",
  ACTA_APERTURA_OFERTAS_DEVOLUCION: "Acta de Apertura de Ofertas y Devolución de Sobres",
  ACTA_RECEPCION_MV_CALIFICACION:
    "Acta de Recepción de Manifestaciones de Voluntad y Documentos de Calificación",
  ACTA_RECEPCION_OFERTAS: "Acta de Recepción de Ofertas",
  ACTA_APERTURA_OFERTAS: "Acta de Apertura de Ofertas",
  ACTA_RECEPCION_CALIF_OFERTAS: "Acta de Recepción de Documentos de Calificación / Ofertas",
  ACTA_APERTURA_CALIF_OFERTAS: "Acta de Apertura de Documentos de Calificación / Ofertas",
  OFERTAS: "Ofertas",
  GARANTIA_SOSTENIMIENTO_OFERTA: "Garantía de Sostenimiento de la Oferta",
  INFORME_EVALUACION_RECOMENDACION: "Informe de Evaluación y Recomendación",
  INFORME_RECOMENDACION: "Informe de Recomendación",
  INFORME_VERIFICACION_RAZONABILIDAD:
    "Informe de Verificación de Razonabilidad de Precios y Recomendación",
  INFORME_VERIFICACION_ADJUDICACION: "Informe de Verificación y Recomendación para la Adjudicación",
  INFORME_OPINION_COMISION: "Informe de Opinión Comisión de Contrataciones",
  ADJUDICACION_O_EQUIVALENTE: "Adjudicación o Equivalente",
  ADJUDICACION_ACTO_MOTIVADO: "Adjudicación (Acto Motivado)",
  NOTIFICACION_ADJUDICADOS: "Notificación a Adjudicados",
  NOTIFICACION_NO_ADJUDICADOS: "Notificación a No Adjudicados",
  NOTIFICACION_INTERESADOS: "Notificación a Interesados",
  CONTRATO: "Contrato (u Orden de Compra/Servicio)",
  RESPONSABILIDAD_SOCIAL: "Responsabilidad Social",
  OTROS: "Otros documentos",
};

/** Limpia listados crudos de códigos enum en mensajes del asistente. */
export function sanitizeAssistantText(text: string): string {
  let out = text;
  out = out.replace(
    /\s*Las opciones válidas son:\s*[A-ZÁÉÍÓÚÑ0-9_,\s]+(?:o\s+[A-ZÁÉÍÓÚÑ0-9_]+)?\.?/gi,
    ""
  );
  out = out.replace(
    /\s*Opciones(?:\s+válidas)?(?:\s+son)?:\s*[A-ZÁÉÍÓÚÑ0-9_,\s]+(?:o\s+[A-ZÁÉÍÓÚÑ0-9_]+)?\.?/gi,
    ""
  );
  for (const code of MODALIDADES) {
    out = out.split(code).join(MODALIDAD_LABELS[code]);
  }
  for (const tipo of TIPOS_CONTRATACION) {
    out = out.replace(new RegExp(`\\b${tipo}\\b`, "g"), TIPO_CONTRATACION_LABELS[tipo]);
  }
  // Quitar énfasis markdown que el modelo a veces deja visible
  out = out.replace(/\*\*(.+?)\*\*/g, "$1");
  out = out.replace(/__(.+?)__/g, "$1");
  out = out.replace(/\*\*/g, "");
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
