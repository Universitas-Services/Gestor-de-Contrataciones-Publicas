export interface CausalModalidadExcluida {
  value: string;
  articulo: 4 | 5;
  titulo: string;
  textoLegal: string;
}

/** Causales Art. 4 y 5 LCP — Modalidades Excluidas (Paso 2). Art. 5: 14 causales (sin duplicar Adquisición de Inmuebles). */
export const CAUSALES_MODALIDADES_EXCLUIDAS: CausalModalidadExcluida[] = [
  // Art. 4 — Exclusiones de la Ley (5)
  {
    value: "ART4_ACUERDOS_INTERNACIONALES",
    articulo: 4,
    titulo: "Acuerdos Internacionales",
    textoLegal:
      "La ejecución de obras, la adquisición de bienes y la prestación de servicios, que se encuentren en el marco del cumplimiento de obligaciones asumidas en acuerdos internacionales entre la República Bolivariana de Venezuela y otros Estados, o en el marco de contratos o convenios suscritos con organismos internacionales.",
  },
  {
    value: "ART4_EMPRESAS_ACUERDOS_INTERNACIONALES",
    articulo: 4,
    titulo: "Empresas de Acuerdos Internacionales",
    textoLegal:
      "La contratación con empresas constituidas en el marco de acuerdos internacionales.",
  },
  {
    value: "ART4_SERVICIOS_LABORALES",
    articulo: 4,
    titulo: "Servicios Laborales",
    textoLegal: "Los servicios laborales.",
  },
  {
    value: "ART4_ARRENDAMIENTO_INMUEBLES",
    articulo: 4,
    titulo: "Arrendamiento de Inmuebles",
    textoLegal: "El arrendamiento de bienes inmuebles, inclusive el financiero.",
  },
  {
    value: "ART4_PATROCINIO",
    articulo: 4,
    titulo: "Patrocinio (Deportivo, Artístico, etc.)",
    textoLegal: "El patrocinio en materia deportiva, artística, literaria, científica o académica.",
  },
  // Art. 5 — Exclusiones de la Modalidad (14)
  {
    value: "ART5_SERVICIOS_PROFESIONALES",
    articulo: 5,
    titulo: "Servicios Profesionales",
    textoLegal: "La prestación de servicios profesionales.",
  },
  {
    value: "ART5_SERVICIOS_FINANCIEROS",
    articulo: 5,
    titulo: "Servicios Financieros",
    textoLegal:
      "La prestación de servicios financieros por entidades regidas por la Ley sobre la materia.",
  },
  {
    value: "ART5_ADQUISICION_INMUEBLES",
    articulo: 5,
    titulo: "Adquisición de Inmuebles",
    textoLegal: "La adquisición de bienes inmuebles.",
  },
  {
    value: "ART5_ADQUISICION_SEMOVIENTES",
    articulo: 5,
    titulo: "Adquisición de Semovientes",
    textoLegal: "La adquisición de semovientes.",
  },
  {
    value: "ART5_OBRAS_ARTISTICAS_LITERARIAS_CIENTIFICAS",
    articulo: 5,
    titulo: "Obras Artísticas, Literarias o Científicas",
    textoLegal: "La adquisición de obras artísticas, literarias o científicas.",
  },
  {
    value: "ART5_ALIANZAS_COMERCIALES_ESTRATEGICAS",
    articulo: 5,
    titulo: "Alianzas Comerciales o Estratégicas",
    textoLegal:
      "Las alianzas comerciales o estratégicas para la adquisición de bienes, prestación de servicios y ejecución de obras entre personas naturales o jurídicas y los contratantes.",
  },
  {
    value: "ART5_SERVICIOS_BASICOS_INDISPENSABLES",
    articulo: 5,
    titulo: "Servicios Básicos Indispensables",
    textoLegal: "Los servicios básicos indispensables para el funcionamiento del contratante.",
  },
  {
    value: "ART5_EJECUCION_DIRECTA_ADMINISTRACION",
    articulo: 5,
    titulo: "Ejecución Directa por Administración Pública",
    textoLegal:
      "La adquisición de bienes, la prestación de servicios y la ejecución de obras, suministradas o ejecutadas directamente por los órganos y entes de la Administración Pública.",
  },
  {
    value: "ART5_CONTRATACION_ENTES_ESTADO",
    articulo: 5,
    titulo: "Contratación entre Entes del Estado",
    textoLegal:
      "La adquisición de bienes, prestación de servicios y ejecución de obras contratados directamente entre los sujetos señalados en el artículo 3 del presente Decreto con Rango, Valor y Fuerza de Ley.",
  },
  {
    value: "ART5_ENCOMIENDAS_GESTION",
    articulo: 5,
    titulo: "Encomiendas de Gestión",
    textoLegal:
      "La adquisición de bienes, prestación de servicios y ejecución de obras encomendados a los órganos y entes de la Administración Pública.",
  },
  {
    value: "ART5_COMPRAS_CAJA_CHICA",
    articulo: 5,
    titulo: "Compras por Caja Chica",
    textoLegal:
      "La adquisición de bienes y prestación de servicios con recursos provenientes de caja chica, hasta el monto máximo que estipule la normativa que regule la materia.",
  },
  {
    value: "ART5_ESTADOS_EXCEPCION",
    articulo: 5,
    titulo: "Estados de Excepción",
    textoLegal:
      "La adquisición de bienes, la prestación de servicios y la ejecución de obras, requeridos, cuando se decrete cualquiera de los estados de excepción contemplados en la Constitución de la República Bolivariana de Venezuela.",
  },
  {
    value: "ART5_SEGURIDAD_DEFENSA_INTELIGENCIA",
    articulo: 5,
    titulo: "Seguridad, Defensa e Inteligencia",
    textoLegal:
      "La adquisición de bienes, la prestación de servicios y la ejecución de obras, destinados a la seguridad y defensa del Estado relacionados con las operaciones de inteligencia y contra inteligencia.",
  },
  {
    value: "ART5_DESABASTECIMIENTO_PRIMERA_NECESIDAD",
    articulo: 5,
    titulo: "Desabastecimiento de Primera Necesidad",
    textoLegal:
      "La adquisición de bienes, servicios, productos alimenticios y medicamentos, declarados como de primera necesidad, siempre que existan en el país condiciones de desabastecimiento.",
  },
];

export const CAUSALES_ME_ART4 = CAUSALES_MODALIDADES_EXCLUIDAS.filter((c) => c.articulo === 4);
export const CAUSALES_ME_ART5 = CAUSALES_MODALIDADES_EXCLUIDAS.filter((c) => c.articulo === 5);

export const CAUSALES_ME_VALUES = CAUSALES_MODALIDADES_EXCLUIDAS.map((c) => c.value) as [
  string,
  ...string[],
];

export function getCausalMeByValue(value: string): CausalModalidadExcluida | undefined {
  return CAUSALES_MODALIDADES_EXCLUIDAS.find((c) => c.value === value);
}
