"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  crearInformeRecomendacion,
  guardarCausaNoAdjudicado,
  guardarDictamenParcial,
  guardarDictamenTotal,
  obtenerGestionAdjudicacion,
  setCaracterAdjudicacionApi,
  type GestionAdjudicacionGates,
  type GestionAdjudicacionResponse,
} from "@/services/oferenteService";
import type { ParticipanteEvaluacion } from "@/lib/utils/evaluacionesFase3Utils";
import { actividadesPreviasFromApi } from "@/lib/utils/fase1MicromodulosMapper";
import { obtenerActividadesPrevias } from "@/services/fase1MicromodulosService";
import { generarDocumento } from "@/services/generadorDocumentosService";
import { montoToNumber, montoToString } from "./montoUtils";
import {
  EMPTY_INFORME,
  createEmptyFase3State,
  type AdjudicacionParcialFormLocal,
  type AdjudicacionTotalFormLocal,
  type CaracterAdjudicacion,
  type DictamenOferenteLocal,
  type Fase3GestionPersistedState,
  type InformeRecomendacionLocal,
} from "./types";

export function isElegibleFase3(p: ParticipanteEvaluacion): boolean {
  return p.oferenteCalificado === true;
}

function mapToTotalForm(d: Record<string, unknown>): AdjudicacionTotalFormLocal {
  return {
    partidasAdjudicadasTotalAuAu: String(d.partidasAdjudicadasTotal ?? ""),
    montoAdjudicadoTotalAuAu: montoToString(d.montoAdjudicadoTotal),
    plazoEjecucionOfertaGanadoraAuAu: String(d.plazoEjecucionOfertaGanadora ?? ""),
    montoManoObraOfertadoAuAu: montoToString(d.montoManoObraOfertado),
  };
}

function mapToParcialForm(d: Record<string, unknown>): AdjudicacionParcialFormLocal {
  return {
    oferenteAdjudicadoProcedimientoAuAu:
      d.oferenteAdjudicadoProcedimiento === true
        ? true
        : d.oferenteAdjudicadoProcedimiento === false
          ? false
          : undefined,
    causaNoAdjudicadoAuAu: String(d.causaNoAdjudicado ?? ""),
    cantidadRenglonesAuAu: String(d.cantidadRenglones ?? ""),
    alcanceAdjudicacionParcialAuAu: String(d.alcanceAdjudicacionParcial ?? ""),
    partidasAdjudicadasParcialAuAu: String(d.partidasAdjudicadasParcial ?? ""),
    montoAdjudicadoParcialAuAu: montoToString(d.montoAdjudicadoParcial),
    plazoEjecucionOfertaParcialAuAu: String(d.plazoEjecucionOfertaParcial ?? ""),
    montoManoObraOfertadoAuAu: montoToString(d.montoManoObraOfertado),
  };
}

function mapApiInformeToLocal(raw: Record<string, unknown>): InformeRecomendacionLocal {
  return {
    existeItemsSinOfertasAuAu: raw.existeItemsSinOfertas as boolean | undefined,
    itemsSinOfertasAuAu: String(raw.itemsSinOfertas ?? ""),
    motivoItemsSinOfertasAuAu: String(raw.motivoItemsSinOfertas ?? ""),
    actualizacionPresupuestoAuAu: raw.actualizacionPresupuesto as boolean | undefined,
    montoNuevoPresupuestoAuAu: montoToString(raw.montoNuevoPresupuesto),
    justificacionActualizacionPresupuestoAuAu: String(raw.justificacionActualizacionPresup ?? ""),
    observacionFormalidadesAuAu: raw.observacionFormalidades as boolean | undefined,
    omisionFormalidadesAuAu: String(raw.omisionFormalidades ?? ""),
    subsanacionActoAuAu: String(raw.subsanacionActo ?? ""),
    datosActoSubsanacionAuAu: String(raw.datosActoSubsanacion ?? ""),
    generado: true,
  };
}

function buildDictamenesMap(
  oferentes: Array<Record<string, unknown>>,
  notificacionesGeneradas: boolean
): Record<string, DictamenOferenteLocal> {
  const map: Record<string, DictamenOferenteLocal> = {};
  for (const o of oferentes) {
    const evaluacionId = String(o.evaluacionId ?? "");
    if (!evaluacionId) continue;
    const dictamen = o.dictamen as Record<string, unknown> | null;
    if (!dictamen) continue;
    const tipo = String(dictamen.tipoDictamen ?? "");
    const totalNoAdjudicado =
      tipo === "TOTAL" && dictamen.oferenteAdjudicadoProcedimiento === false;
    map[evaluacionId] = {
      evaluacionId,
      guardado: true,
      total: tipo === "TOTAL" && !totalNoAdjudicado ? mapToTotalForm(dictamen) : undefined,
      parcial: tipo === "PARCIAL" ? mapToParcialForm(dictamen) : undefined,
      causaNoAdjudicado: totalNoAdjudicado ? String(dictamen.causaNoAdjudicado ?? "") : undefined,
      notificacionGenerada: notificacionesGeneradas || Boolean(dictamen.notificacionGenerada),
    };
  }
  return map;
}

export function useFase3GestionState(
  expedienteId: string,
  _participantes: ParticipanteEvaluacion[]
) {
  const [gestion, setGestion] = useState<GestionAdjudicacionResponse | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [manoObraRequerida, setManoObraRequerida] = useState(false);

  useEffect(() => {
    let cancelled = false;
    obtenerGestionAdjudicacion(expedienteId)
      .then((data) => {
        if (!cancelled) {
          setGestion(data);
          setHydrated(true);
        }
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });
    obtenerActividadesPrevias(expedienteId)
      .then((raw) => {
        if (cancelled) return;
        const actividades = actividadesPreviasFromApi(raw as Record<string, unknown>);
        setManoObraRequerida(actividades.requiereGarantiaLaboralAuAu === true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [expedienteId]);

  const state = useMemo((): Fase3GestionPersistedState => {
    if (!gestion) return createEmptyFase3State();
    return {
      caracterAdjudicacionAuAu: gestion.caracterAdjudicacion ?? null,
      dictamenes: buildDictamenesMap(gestion.oferentes, gestion.gates.notificacionesGeneradas),
      informe: {
        ...(gestion.informe
          ? mapApiInformeToLocal(gestion.informe as Record<string, unknown>)
          : EMPTY_INFORME),
        // "generado" = Word generado y vigente, no solo el formulario guardado.
        generado: gestion.gates.informeGenerado,
      },
      documentoAdjudicacionGenerado: gestion.gates.actaGenerada,
    };
  }, [gestion]);

  const gates: GestionAdjudicacionGates | undefined = gestion?.gates;

  const canChangeCaracter = gates?.puedeCambiarCaracter ?? true;
  const adjudicacionGateOk = gates?.dictamenesCompletos ?? false;
  const docsUnlocked = gates?.puedeGenerarInforme ?? false;
  const actaUnlocked = gates?.puedeGenerarActa ?? false;
  const notificacionesUnlocked = gates?.puedeGenerarNotificaciones ?? false;

  const informePersistido = gates?.informePersistido ?? false;
  const notificacionesGeneradas = gates?.notificacionesGeneradas ?? false;

  const requiereCausaSet = useMemo(() => {
    if (!gestion) return new Set<string>();
    return new Set(
      gestion.oferentes
        .filter((o) => o.requiereCausaNoAdjudicado === true)
        .map((o) => String(o.evaluacionId))
    );
  }, [gestion]);

  const puedeAdjudicarSet = useMemo(() => {
    if (!gestion) return new Set<string>();
    return new Set(
      gestion.oferentes.filter((o) => Boolean(o.puedeAdjudicar)).map((o) => String(o.evaluacionId))
    );
  }, [gestion]);

  const refetch = useCallback(async () => {
    const updated = await obtenerGestionAdjudicacion(expedienteId);
    setGestion(updated);
  }, [expedienteId]);

  const setCaracter = useCallback(
    async (caracter: CaracterAdjudicacion): Promise<boolean> => {
      const updated = await setCaracterAdjudicacionApi(expedienteId, caracter);
      setGestion(updated);
      return true;
    },
    [expedienteId]
  );

  const saveDictamenTotal = useCallback(
    async (evaluacionId: string, form: AdjudicacionTotalFormLocal): Promise<void> => {
      const payload: Record<string, unknown> = {
        partidasAdjudicadasTotalAuAu: form.partidasAdjudicadasTotalAuAu,
        montoAdjudicadoTotalAuAu: montoToNumber(form.montoAdjudicadoTotalAuAu),
        plazoEjecucionOfertaGanadoraAuAu: Number(form.plazoEjecucionOfertaGanadoraAuAu),
        montoManoObraOfertadoAuAu: montoToNumber(form.montoManoObraOfertadoAuAu),
      };
      await guardarDictamenTotal(expedienteId, evaluacionId, payload);
      const updated = await obtenerGestionAdjudicacion(expedienteId);
      setGestion(updated);
    },
    [expedienteId]
  );

  const saveDictamenParcial = useCallback(
    async (evaluacionId: string, form: AdjudicacionParcialFormLocal): Promise<void> => {
      const adjudicado = form.oferenteAdjudicadoProcedimientoAuAu === true;
      const payload: Record<string, unknown> = {
        oferenteAdjudicadoProcedimientoAuAu: form.oferenteAdjudicadoProcedimientoAuAu ?? false,
        causaNoAdjudicadoAuAu: form.causaNoAdjudicadoAuAu,
        cantidadRenglonesAuAu:
          adjudicado && form.cantidadRenglonesAuAu ? Number(form.cantidadRenglonesAuAu) : undefined,
        alcanceAdjudicacionParcialAuAu: adjudicado
          ? form.alcanceAdjudicacionParcialAuAu
          : undefined,
        partidasAdjudicadasParcialAuAu: adjudicado
          ? form.partidasAdjudicadasParcialAuAu
          : undefined,
        montoAdjudicadoParcialAuAu: adjudicado
          ? montoToNumber(form.montoAdjudicadoParcialAuAu)
          : undefined,
        plazoEjecucionOfertaParcialAuAu:
          adjudicado && form.plazoEjecucionOfertaParcialAuAu
            ? Number(form.plazoEjecucionOfertaParcialAuAu)
            : undefined,
        montoManoObraOfertadoAuAu: adjudicado
          ? montoToNumber(form.montoManoObraOfertadoAuAu)
          : undefined,
      };
      await guardarDictamenParcial(expedienteId, evaluacionId, payload);
      const updated = await obtenerGestionAdjudicacion(expedienteId);
      setGestion(updated);
    },
    [expedienteId]
  );

  const saveCausaNoAdjudicado = useCallback(
    async (evaluacionId: string, causa: string): Promise<void> => {
      await guardarCausaNoAdjudicado(expedienteId, evaluacionId, causa.trim());
      const updated = await obtenerGestionAdjudicacion(expedienteId);
      setGestion(updated);
    },
    [expedienteId]
  );

  const saveInforme = useCallback(
    /** Devuelve un aviso si el formulario se guardó pero el Word no se pudo generar. */
    async (informe: Omit<InformeRecomendacionLocal, "generado">): Promise<string | null> => {
      const payload = {
        ...informe,
        validarCompleto: true,
        montoNuevoPresupuestoAuAu: montoToNumber(informe.montoNuevoPresupuestoAuAu),
      };
      await crearInformeRecomendacion(expedienteId, payload);
      let generacionError: unknown = null;
      try {
        await generarDocumento("informe-recomendacion", expedienteId);
      } catch (e) {
        generacionError = e;
      }
      const updated = await obtenerGestionAdjudicacion(expedienteId);
      setGestion(updated);
      if (!generacionError) return null;
      const detalle = generacionError instanceof Error ? ` ${generacionError.message}` : "";
      return `El formulario se guardó, pero el documento no se pudo generar.${detalle}`;
    },
    [expedienteId]
  );

  const generarInforme = useCallback(async (): Promise<void> => {
    await generarDocumento("informe-recomendacion", expedienteId);
    const updated = await obtenerGestionAdjudicacion(expedienteId);
    setGestion(updated);
  }, [expedienteId]);

  const canAdjudicar = useCallback(
    (p: ParticipanteEvaluacion) => puedeAdjudicarSet.has(p.id),
    [puedeAdjudicarSet]
  );

  const requiereCausa = useCallback(
    (p: ParticipanteEvaluacion) => requiereCausaSet.has(p.id),
    [requiereCausaSet]
  );

  return {
    state,
    hydrated,
    canChangeCaracter,
    adjudicacionGateOk,
    docsUnlocked,
    informePersistido,
    actaUnlocked,
    notificacionesUnlocked,
    notificacionesGeneradas,
    manoObraRequerida,
    setCaracter,
    saveDictamenTotal,
    saveDictamenParcial,
    saveCausaNoAdjudicado,
    saveInforme,
    generarInforme,
    canAdjudicar,
    requiereCausa,
    refetch,
  };
}
