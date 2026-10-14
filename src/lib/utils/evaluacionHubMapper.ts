import { emptyLegalFormValues } from "@/lib/constants/calificacionLegalEvaluacion";
import { emptyFinancieraFormValues } from "@/lib/constants/calificacionFinancieraEvaluacion";
import { emptyTecnicaFormValues } from "@/lib/constants/calificacionTecnicaEvaluacion";
import { emptyEvaluacionPuntajeFormValues } from "@/lib/constants/evaluacionPuntajeEvaluacion";
import { emptyPromocionFormValues } from "@/lib/constants/promocionEconomicaEvaluacion";
import type {
  CalificacionFinancieraEvaluacionValues,
  CalificacionLegalEvaluacionValues,
  CalificacionTecnicaEvaluacionValues,
  CriterioFinancieroPlantilla,
  EvaluacionPuntajeEvaluacionValues,
  HubEvaluacionResponse,
  HubPageModel,
  PlantillaFinanciera,
  PlantillaPromocion,
  PlantillaTecnica,
  PromocionEconomicaEvaluacionValues,
  RecaudoCotejoItem,
} from "@/types/evaluacionOferente.types";

const LEGAL_ITEMS_EXCLUIDOS = new Set(["modGarantiaFielCumplAuAu", "modFianzaLaboralAuAu"]);

function isOfertaTecnicoEconomica(item: RecaudoCotejoItem): boolean {
  const p = item.pregunta.toLowerCase();
  return (
    p.includes("oferta técnico") ||
    p.includes("oferta tecnico") ||
    item.id === "ofertaTecnicoEconomica"
  );
}

function mapLegalItems(items: RecaudoCotejoItem[] | undefined): RecaudoCotejoItem[] {
  if (!items?.length) return [];
  const mapped = items
    .filter((item) => !LEGAL_ITEMS_EXCLUIDOS.has(item.id))
    .map((item) => ({
      id: item.id,
      sobre: item.sobre === 2 ? 2 : (1 as 1 | 2),
      pregunta: item.pregunta,
      etiquetaCorta: item.etiquetaCorta,
      eliminatorio: true,
      personalizado: Boolean(item.personalizado),
    }));

  // Oferta técnico-económica must appear first among Sobre 2 items
  const sobre1 = mapped.filter((i) => i.sobre === 1);
  const sobre2 = mapped.filter((i) => i.sobre === 2);
  const ofertaIdx = sobre2.findIndex(isOfertaTecnicoEconomica);
  if (ofertaIdx > 0) {
    const [oferta] = sobre2.splice(ofertaIdx, 1);
    sobre2.unshift(oferta);
  }

  return [...sobre1, ...sobre2];
}

function mapPlantillaFinanciera(raw: PlantillaFinanciera): PlantillaFinanciera {
  const criterios: CriterioFinancieroPlantilla[] = (raw.criterios ?? []).map((c) => {
    if (c.kind === "descapital") {
      return {
        id: "descapital",
        kind: "descapital",
        titulo: c.titulo,
        pregunta: c.pregunta,
        basamentoLegal: c.basamentoLegal,
        puntajeMaximo: c.puntajeMaximo,
      } satisfies CriterioFinancieroPlantilla;
    }
    return {
      id: c.id,
      kind: "indice",
      titulo: c.titulo,
      pregunta: c.pregunta,
      basamentoLegal: c.basamentoLegal,
      aspectoHint: "aspectoHint" in c && c.aspectoHint ? String(c.aspectoHint) : "",
      mode: c.mode === "inverso" ? "inverso" : "ascendente",
      rangos: { ...c.rangos },
    } as CriterioFinancieroPlantilla;
  });
  return {
    puntuacionMinima: raw.puntuacionMinima ?? 0,
    criterios,
  };
}

function mapPlantillaTecnica(raw: PlantillaTecnica): PlantillaTecnica {
  return {
    puntuacionMinima: raw.puntuacionMinima ?? 0,
    criterios: (raw.criterios ?? []).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion ?? "",
      ponderacion: c.ponderacion ?? 0,
      rangos: (c.rangos ?? []).map((r) => ({
        id: r.id,
        descripcion: r.descripcion ?? "",
        puntaje: r.puntaje ?? 0,
      })),
    })),
  };
}

function mergeLegalForm(
  items: RecaudoCotejoItem[],
  form: HubEvaluacionResponse["legal"]["form"] | undefined
): CalificacionLegalEvaluacionValues {
  const base = emptyLegalFormValues(items);
  if (!form) return base;

  for (const [id, respuesta] of Object.entries(form.items ?? {})) {
    if (!(id in base.items)) {
      base.items[id] = { consignado: undefined, observacion: "" };
    }
    const consignado =
      respuesta?.consignado === "SI" || respuesta?.consignado === "NO"
        ? respuesta.consignado
        : undefined;
    base.items[id] = {
      consignado,
      observacion: respuesta?.observacion ?? "",
    };
  }

  return {
    items: base.items,
    justificacion: form.justificacion ?? "",
    indVerificadoGarantia:
      typeof form.indVerificadoGarantia === "boolean" ? form.indVerificadoGarantia : null,
    indVerificadoCrs: typeof form.indVerificadoCrs === "boolean" ? form.indVerificadoCrs : null,
    obsVerificadoGarantia: form.obsVerificadoGarantia ?? "",
    obsVerificadoCrs: form.obsVerificadoCrs ?? "",
  };
}

function mergeFinancieraForm(
  plantilla: PlantillaFinanciera,
  form: CalificacionFinancieraEvaluacionValues | undefined
): CalificacionFinancieraEvaluacionValues {
  const base = emptyFinancieraFormValues(plantilla);
  if (!form) return base;
  return {
    criterios: { ...base.criterios, ...form.criterios },
    justificacion: form.justificacion ?? "",
  };
}

function mergeTecnicaForm(
  plantilla: PlantillaTecnica,
  form: CalificacionTecnicaEvaluacionValues | undefined
): CalificacionTecnicaEvaluacionValues {
  const base = emptyTecnicaFormValues(plantilla);
  if (!form) return base;
  const criterios = { ...base.criterios };
  for (const [id, respuesta] of Object.entries(form.criterios ?? {})) {
    criterios[id] = {
      rangoIdSeleccionado: respuesta?.rangoIdSeleccionado,
      puntuacionObtenida:
        respuesta?.puntuacionObtenida === undefined ? null : respuesta.puntuacionObtenida,
      valorObtenido: respuesta?.valorObtenido ?? "",
    };
  }
  return { criterios, justificacion: form.justificacion ?? "" };
}

function mergeEvaluacionForm(
  plantilla: HubEvaluacionResponse["plantillaEvaluacion"],
  form: EvaluacionPuntajeEvaluacionValues | undefined
): EvaluacionPuntajeEvaluacionValues {
  const base = emptyEvaluacionPuntajeFormValues(plantilla);
  if (!form) return base;
  return {
    tecnica: {
      criterios: {
        ...base.tecnica.criterios,
        ...form.tecnica?.criterios,
      },
      justificacion: form.tecnica?.justificacion ?? "",
    },
    economica: {
      criterios: {
        ...base.economica.criterios,
        ...form.economica?.criterios,
      },
      justificacion: form.economica?.justificacion ?? "",
    },
    posicionPrelacion: form.posicionPrelacion ?? "",
  };
}

function mergePromocionForm(
  form: HubEvaluacionResponse["promocion"]
): PromocionEconomicaEvaluacionValues {
  const base = emptyPromocionFormValues();
  if (!form) return base;
  const f = form.form ?? {};
  return {
    ...base,
    consignoDeclaracionVan: f.consignoDeclaracionVan,
    valVanOferente: f.valVanOferente ?? null,
    ptsBonoVan: f.ptsBonoVan ?? null,
    aplicaPrefLocal: f.aplicaPrefLocal,
    aplicaBonoSujeto: f.aplicaBonoSujeto,
    totalPuntosPromocion: form.totalPuntosPromocion ?? 0,
    puntuacionFinalConBonos: form.puntuacionFinalConBonos ?? 0,
    calculado:
      form.totalPuntosPromocion != null || form.puntuacionFinalConBonos != null || form.submitted,
  };
}

export function mapHubToPageModel(hub: HubEvaluacionResponse): HubPageModel {
  const plantillaLegal = mapLegalItems(hub.plantillaLegal?.items);
  const plantillaFinanciera = mapPlantillaFinanciera(hub.plantillaFinanciera);
  const plantillaTecnica = mapPlantillaTecnica(hub.plantillaTecnica);
  const plantillaEvaluacion = {
    tecnica: {
      puntuacionMinima: hub.plantillaEvaluacion?.tecnica?.puntuacionMinima ?? 0,
      maxPuntos: hub.plantillaEvaluacion?.tecnica?.maxPuntos ?? 0,
      criterios: mapPlantillaTecnica({
        puntuacionMinima: hub.plantillaEvaluacion?.tecnica?.puntuacionMinima ?? 0,
        criterios: hub.plantillaEvaluacion?.tecnica?.criterios ?? [],
      }).criterios,
    },
    economica: {
      puntuacionMinima: hub.plantillaEvaluacion?.economica?.puntuacionMinima ?? 0,
      maxPuntos: hub.plantillaEvaluacion?.economica?.maxPuntos ?? 0,
      criterios: mapPlantillaTecnica({
        puntuacionMinima: hub.plantillaEvaluacion?.economica?.puntuacionMinima ?? 0,
        criterios: hub.plantillaEvaluacion?.economica?.criterios ?? [],
      }).criterios,
    },
  };

  const plantillaPromocion: PlantillaPromocion | null = hub.plantillaPromocion
    ? {
        activa: Boolean(hub.plantillaPromocion.activa),
        requiereVan: Boolean(hub.plantillaPromocion.requiereVan),
        puntajeVanMax: hub.plantillaPromocion.puntajeVanMax ?? 0,
        indPrefLocal: Boolean(hub.plantillaPromocion.indPrefLocal),
        puntuacionBonoLocal: hub.plantillaPromocion.puntuacionBonoLocal ?? 0,
        indBonoSujeto: Boolean(hub.plantillaPromocion.indBonoSujeto),
        puntuacionBonoSujeto: hub.plantillaPromocion.puntuacionBonoSujeto ?? 0,
      }
    : null;

  const unlocked = {
    financiera: Boolean(hub.unlocked?.financiera),
    tecnica: Boolean(hub.unlocked?.tecnica),
    evaluacion: Boolean(hub.unlocked?.evaluacion),
    promocion: Boolean(hub.unlocked?.promocion) && plantillaPromocion !== null,
  };

  return {
    banner: {
      nombreProveedor: hub.banner?.nombreProveedor ?? "—",
      rif: hub.banner?.rif ?? "—",
      montoOfertaBs:
        hub.banner?.montoOfertaBs === undefined || hub.banner?.montoOfertaBs === null
          ? null
          : Number(hub.banner.montoOfertaBs),
    },
    plantillaLegal,
    plantillaFinanciera,
    plantillaTecnica,
    plantillaEvaluacion,
    plantillaPromocion,
    notaBase: hub.evaluacion?.notaBase ?? null,
    state: {
      resultadoFinal: hub.resultadoFinal ?? "pendiente",
      legalSubmitted: Boolean(hub.legal?.submitted),
      oferenteCalificadoLegal: hub.legal?.oferenteCalificadoLegal ?? null,
      legalForm: mergeLegalForm(plantillaLegal, hub.legal?.form),
      financieraSubmitted: Boolean(hub.financiera?.submitted),
      oferenteCalificadoFinanciera: hub.financiera?.oferenteCalificadoFinanciera ?? null,
      financieraForm: mergeFinancieraForm(plantillaFinanciera, hub.financiera?.form),
      tecnicaSubmitted: Boolean(hub.tecnica?.submitted),
      oferenteCalificadoTecnica: hub.tecnica?.oferenteCalificadoTecnica ?? null,
      tecnicaForm: mergeTecnicaForm(plantillaTecnica, hub.tecnica?.form),
      evaluacionSubmitted: Boolean(hub.evaluacion?.submitted),
      oferenteEvaluadoTecnico: hub.evaluacion?.oferenteEvaluadoTecnico ?? null,
      oferenteEvaluadoEconomico: hub.evaluacion?.oferenteEvaluadoEconomico ?? null,
      evaluacionForm: mergeEvaluacionForm(plantillaEvaluacion, hub.evaluacion?.form),
      promocionSubmitted: Boolean(hub.promocion?.submitted),
      promocionForm: mergePromocionForm(hub.promocion),
      unlocked,
      activeModulo: hub.activeModulo ?? "legal",
    },
  };
}

export function legalFormToHubPatch(
  form: CalificacionLegalEvaluacionValues
): Record<string, unknown> {
  const items: Record<string, { consignado: "SI" | "NO" | null; observacion: string }> = {};
  for (const [id, respuesta] of Object.entries(form.items ?? {})) {
    items[id] = {
      consignado:
        respuesta?.consignado === "SI" || respuesta?.consignado === "NO"
          ? respuesta.consignado
          : null,
      observacion: respuesta?.observacion ?? "",
    };
  }
  // These items are hidden from evaluation (post-adjudication documents) but the
  // API requires an answer for them, so we always send SI.
  for (const id of LEGAL_ITEMS_EXCLUIDOS) {
    items[id] = { consignado: "SI", observacion: "" };
  }
  return {
    items,
    justificacion: form.justificacion ?? "",
    indVerificadoGarantia: form.indVerificadoGarantia,
    indVerificadoCrs: form.indVerificadoCrs,
    obsVerificadoGarantia: form.obsVerificadoGarantia?.trim() || null,
    obsVerificadoCrs: form.obsVerificadoCrs?.trim() || null,
  };
}

export function financieraFormToHubPatch(
  form: CalificacionFinancieraEvaluacionValues
): Record<string, unknown> {
  const criterios: Record<string, { valor: string }> = {};
  for (const [id, respuesta] of Object.entries(form.criterios ?? {})) {
    if (respuesta?.valor === undefined || respuesta.valor === null || respuesta.valor === "") {
      continue;
    }
    criterios[id] = { valor: String(respuesta.valor) };
  }
  return {
    criterios,
    justificacion: form.justificacion ?? "",
  };
}

export function tecnicaFormToHubPatch(
  form: CalificacionTecnicaEvaluacionValues
): Record<string, unknown> {
  const criterios: Record<
    string,
    {
      rangoIdSeleccionado?: string;
      puntuacionObtenida?: number | null;
      valorObtenido?: string;
    }
  > = {};
  for (const [id, respuesta] of Object.entries(form.criterios ?? {})) {
    criterios[id] = {
      rangoIdSeleccionado: respuesta?.rangoIdSeleccionado,
      puntuacionObtenida: respuesta?.puntuacionObtenida ?? null,
      valorObtenido: respuesta?.valorObtenido ?? "",
    };
  }
  return {
    criterios,
    justificacion: form.justificacion ?? "",
  };
}

export function evaluacionFormToHubPatch(
  form: EvaluacionPuntajeEvaluacionValues
): Record<string, unknown> {
  // posicionPrelacion la calcula el servidor; no se envía desde el cliente.
  return {
    tecnica: tecnicaFormToHubPatch({
      criterios: form.tecnica.criterios,
      justificacion: form.tecnica.justificacion,
    }),
    economica: tecnicaFormToHubPatch({
      criterios: form.economica.criterios,
      justificacion: form.economica.justificacion,
    }),
  };
}

export function promocionFormToHubPatch(
  form: PromocionEconomicaEvaluacionValues
): Record<string, unknown> {
  return {
    consignoDeclaracionVan: form.consignoDeclaracionVan,
    valVanOferente: form.valVanOferente,
    ptsBonoVan: form.ptsBonoVan,
    aplicaPrefLocal: form.aplicaPrefLocal,
    aplicaBonoSujeto: form.aplicaBonoSujeto,
  };
}
