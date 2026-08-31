export const ESPECIFICACIONES_TECNICAS_WIZARD_TITLE =
  "Especificaciones Técnicas y Garantías de Idoneidad";

export const ESPECIFICACIONES_TECNICAS_WIZARD_SUBTITLE =
  "Art. 66, 116.5 LCP / Art. 7 RLCP / Norma 24-b SUNAI";

export const ESPECIFICACIONES_TECNICAS_UPLOAD_TITLE = "Cargar Documento";

export const ESPECIFICACIONES_TECNICAS_UPLOAD_DESCRIPTION =
  "Inserte o cargue las Especificaciones Técnicas a incluir en el Pliego de Condiciones de este procedimiento de contratación.";

export const ESPECIFICACIONES_TECNICAS_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const ESPECIFICACIONES_TECNICAS_ACCEPT = {
  extensions: [".pdf", ".docx"] as const,
  mimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  acceptAttr:
    ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const ESPECIFICACIONES_TECNICAS_LINEAMIENTOS_INTRO =
  "Para garantizar la validez legal del expediente, el documento a cargar elabore su requerimiento técnico cumpliendo obligatoriamente con las siguientes acciones.";

export const ESPECIFICACIONES_TECNICAS_SECCION_1 = {
  title: "1.- ACCIONES PARA LA DEFINICIÓN TÉCNICA DEL OBJETO:",
  intro:
    "Elabore su requerimiento técnico cumpliendo obligatoriamente con las siguientes acciones, fundamento en los Artículos 66 LCP, 7 RLCP y Norma 24 (b) de la SUNAI:",
  items: [
    {
      title: "Precisión y Detalle Técnico:",
      body: 'Indique de forma exhaustiva las características físicas, materiales de fabricación, capacidades, potencias o niveles de servicio (SLA). Evite el uso de términos subjetivos como "buena calidad" o "referencia estándar".',
    },
    {
      title: "Garantía de Libre Competencia (Prohibición de Marcas):",
      body: "No incluya nombres comerciales, marcas, patentes o procedencias que restrinjan la participación de oferentes, conforme a la prohibición taxativa del Art. 66 de la LCP, salvo los casos de repuestos originales autorizados.",
    },
    {
      title: "Criterios de Aceptación y Calidad (Parámetros Medibles):",
      body: "Defina los criterios técnicos, funcionales y de rendimiento que permitan verificar objetivamente la conformidad del suministro, servicio u obra. Especifique las pruebas de funcionamiento, niveles de tolerancia o certificaciones de calidad necesarias.",
    },
    {
      title: "Alcance, Metas y Entregables:",
      body: "Detalle las cantidades totales, las metas físicas de ejecución, los cronogramas de cumplimiento y los productos o informes técnicos (entregables) que aseguren la operatividad total de la contratación.",
    },
  ],
} as const;

export const ESPECIFICACIONES_TECNICAS_SECCION_2 = {
  title: "2.- DEFINICIÓN DE GARANTÍAS DE IDONEIDAD Y SOPORTE (POST-ENTREGA):",
  intro:
    'En cumplimiento del Artículo 116.5 de la LCP y la Norma 24 literal "b" de la SUNAI, incorpore en sus especificaciones técnicas las siguientes condiciones de soporte para proteger el patrimonio del Ente:',
  items: [
    {
      title: "Garantía de Funcionamiento:",
      body: "Establezca el tiempo de cobertura mínima contra defectos de fábrica, fallas de materiales o vicios ocultos, contados a partir de la recepción definitiva.",
    },
    {
      title: "Compromiso de Canje:",
      body: "Defina el plazo máximo de respuesta para la sustitución total de bienes ante la detección de fallas o empaques dañados.",
    },
    {
      title: "Soporte y Repuestos:",
      body: "Establezca la obligatoriedad de contar con soporte técnico especializado y la disponibilidad permanente de repuestos originales en territorio nacional, a los fines de asegurar la vida útil y operatividad del objeto por el periodo definido.",
    },
    {
      title: "Transferencia y Capacitación:",
      body: "Detalle los requerimientos de planes de formación técnica para el personal del Ente sobre el uso y mantenimiento preventivo de los equipos o sistemas.",
    },
  ],
} as const;

export const ESPECIFICACIONES_TECNICAS_SUCCESS_TITLE = "¡Documento guardado con éxito!";
export const ESPECIFICACIONES_TECNICAS_SUCCESS_DESCRIPTION =
  "Las especificaciones técnicas han sido anexadas correctamente al expediente.";
export const ESPECIFICACIONES_TECNICAS_SUCCESS_RESPONSIBILITY =
  "El contenido del archivo cargado es de su exclusiva responsabilidad.";

export interface EspecificacionesTecnicasStoredMeta {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export function getEspecificacionesTecnicasStorageKey(expedienteId: string): string {
  return `especificaciones-tecnicas:${expedienteId}`;
}
