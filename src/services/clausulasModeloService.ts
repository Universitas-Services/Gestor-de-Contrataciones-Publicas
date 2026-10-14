"use server";

import type { ClausulaBase } from "@/lib/constants/modeloContrato";
import {
  listarClausulasGenericas as listarClausulasGenericasApi,
  listarClausulasEnte as listarClausulasEnteApi,
} from "@/services/bibliotecaClausulasService";
import type { ClausulaEnte, ClausulaGenerica } from "@/types/bibliotecaLegal.types";

function mapGenericaToBase(clause: ClausulaGenerica): ClausulaBase {
  return {
    id: clause.id,
    titulo: clause.titulo,
    cuerpoHtml: clause.cuerpo || "<p></p>",
    kind: "facultativa",
    origen: "generica",
  };
}

function mapEnteToBase(clause: ClausulaEnte): ClausulaBase {
  return {
    id: clause.id,
    titulo: clause.titulo,
    cuerpoHtml: clause.cuerpo || "<p></p>",
    kind: "facultativa",
    origen: "biblioteca",
  };
}

/** GET /biblioteca/clausulas-genericas → ClausulaBase[] para el repositorio del modelo. */
export async function listarClausulasGenericasModelo(): Promise<ClausulaBase[]> {
  const res = await listarClausulasGenericasApi({ page: 1, limit: 100 });
  return (res.data ?? []).map(mapGenericaToBase);
}

/** GET /entes/{enteId}/clausulas → ClausulaBase[] (origen biblioteca). */
export async function listarClausulasEnteModelo(enteId: string): Promise<ClausulaBase[]> {
  if (!enteId) return [];
  const res = await listarClausulasEnteApi(enteId, { page: 1, limit: 100 });
  return (res.data ?? []).map(mapEnteToBase);
}
