export interface CausalContratacionDirecta {
  numeral: string;
  tituloCorto: string;
  textoLegal: string;
}

/**
 * Causales Art. 101 LCP para Contratación Directa (Paso 2).
 * `numeral` → numeral_causal_procedencia_cd
 * `textoLegal` → causal_procedencia_cd
 */
export const CAUSALES_CONTRATACION_DIRECTA: CausalContratacionDirecta[] = [
  {
    numeral: "1",
    tituloCorto: "Continuidad del Proceso Productivo",
    textoLegal:
      "Si se trata de suministros de bienes, prestación de servicios o ejecución de obras requeridas para la continuidad del proceso productivo, y pudiera resultar gravemente afectado por el retardo de la apertura de un procedimiento de contratación.",
  },
  {
    numeral: "2",
    tituloCorto: "Exclusividad o Proveedor Único",
    textoLegal:
      "Cuando las condiciones técnicas de determinado bien, servicio u obra así lo requieran o excluyan toda posibilidad de competencia o si, habiendo adquirido ya bienes, equipos, tecnología, servicios u obras a determinado proveedor o contratista, el contratante decide adquirir más productos del mismo proveedor o contratista por razones de normalización o por la necesidad de asegurar su compatibilidad con los bienes, equipos, la tecnología o los servicios que ya se estén utilizando, y teniendo además en cuenta la eficacia con la que el contrato original haya respondido a las necesidades del contratante, el volumen relativamente bajo del contrato propuesto en comparación con el del contrato original, el carácter razonable del precio y la inexistencia de otra fuente de suministro que resulte adecuada.",
  },
  {
    numeral: "3",
    tituloCorto: "Condiciones Especiales",
    textoLegal:
      "En caso de contratos que tengan por objeto la adquisición de bienes y la prestación de servicios, en los que no fuere posible aplicar las otras modalidades de contratación, dadas las condiciones especiales, bajo las cuales los oferentes convienen en suministrar esos bienes o prestar los servicios, o por condiciones especiales de la solicitud del contratante, donde la aplicación de una modalidad de selección de contratista distinta a la aquí prevista, no permita la obtención de los bienes o servicios en las condiciones requeridas. Se deberá indicar mediante acto motivado, las razones por las cuales de la apertura de un nuevo procedimiento de contratación, pudieren resultar perjuicios para el contratante.",
  },
  {
    numeral: "4",
    tituloCorto: "Emergencia Comprobada",
    textoLegal: "Cuando se trate de emergencia comprobada.",
  },
  {
    numeral: "5",
    tituloCorto: "Contratos Terminados Anticipadamente",
    textoLegal:
      "Cuando se trate de la ejecución de obras, adquisición de bienes o prestación de servicios regulados por contratos terminados anticipadamente, donde la apertura de un procedimiento de selección de contratistas, pudiese resultar perjudicial para el órgano o ente contratante.",
  },
  {
    numeral: "6",
    tituloCorto: "Comercialización o Enajenación",
    textoLegal:
      "Cuando se trate de la contratación de bienes, servicios u obras para su comercialización, donación o cualquier otra forma de enajenación ante terceros, siempre que los bienes o servicios estén asociados a la actividad propia del contratante y no ingresen de manera permanente a su patrimonio.",
  },
  {
    numeral: "7",
    tituloCorto: "Secretos Comerciales",
    textoLegal:
      "Cuando se trate de contrataciones que tengan por objeto la adquisición de bienes, prestación de servicios o ejecución de obras sobre las cuales una modalidad de selección de contratistas pudiera comprometer secretos o estrategias comerciales del contratante, cuyo conocimiento ofrecería ventaja a sus competidores.",
  },
  {
    numeral: "8",
    tituloCorto: "Convenios Comerciales",
    textoLegal:
      "Cuando se trate de la adquisición de bienes producidos por empresas con las que el contratante suscriba convenios comerciales de fabricación, ensamblaje o aprovisionamiento, siempre que tales convenios hayan sido suscritos para desarrollar la industria nacional sobre los referidos bienes, en cumplimiento de planes dictados por el Ejecutivo Nacional.",
  },
  {
    numeral: "9",
    tituloCorto: "Restablecimiento Servicios Públicos",
    textoLegal:
      "Cuando se trate de contrataciones de obras, bienes o servicios requeridos para el restablecimiento inmediato o continuidad de los servicios públicos o actividades de interés general que hayan sido objeto de interrupción o fallas, independientemente de su recurrencia.",
  },
  {
    numeral: "10",
    tituloCorto: "Obras en Ejecución Directa",
    textoLegal:
      "Cuando se trate de actividades requeridas para obras que se encuentren en ejecución directa por los órganos y entes contratantes, y que de acuerdo a su capacidad de ejecución, sea necesario por razones estratégicas de la construcción, que parcialmente sean realizadas por un tercero, siempre y cuando esta asignación, no supere el cincuenta por ciento (50%) del contrato original.",
  },
  {
    numeral: "11",
    tituloCorto: "Cadena Agroalimentaria",
    textoLegal:
      "Cuando se trate de la adquisición de bienes y contratación de servicios a pequeños y medianos actores económicos que sean indispensables para asegurar el desarrollo de la cadena agroalimentaria.",
  },
  {
    numeral: "12",
    tituloCorto: "Consulta de Precios Desierta",
    textoLegal:
      "Cuando se trate de suministros de bienes, prestación de servicios o ejecución de obras para las cuales se hayan aplicado la modalidad de consulta de precios y haya sido declarada desierta.",
  },
  {
    numeral: "13",
    tituloCorto: "Organizaciones Socioproductivas",
    textoLegal:
      "Cuando se trate de contrataciones a organizaciones socio productivas creadas en el marco de la Ley que rige el sistema económico comunal o comunidades organizadas mediante la adjudicación de proyectos para impulsar el desarrollo de las mismas.",
  },
  {
    numeral: "14",
    tituloCorto: "Empresas Conjuntas",
    textoLegal:
      "Cuando se trate de contrataciones con empresas conjuntas o conglomerados creadas en el marco de la Ley que promueve y regula las nuevas formas asociativas conjuntas entre el Estado y la iniciativa comunitaria privada, siempre y cuando se establezcan las ventajas de la contratación, con base a los principios que regula la normas de creación de estas formas asociativas conjuntas.",
  },
];

export function getCausalByNumeral(numeral: string): CausalContratacionDirecta | undefined {
  return CAUSALES_CONTRATACION_DIRECTA.find((c) => c.numeral === numeral);
}
