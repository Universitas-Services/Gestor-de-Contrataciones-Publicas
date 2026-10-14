/** Meta de paginación de biblioteca (normativa / cláusulas). */
export interface BibliotecaListMeta {
  total: number;
  page: number;
  lastPage: number;
}

export interface BibliotecaListResponse<T> {
  data: T[];
  meta: BibliotecaListMeta;
}

export interface BibliotecaListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

/** Normativa global (catálogo Universitas). Campos flexibles por row Prisma. */
export interface NormativaGlobal {
  id: string;
  textoNormativaCompleto?: string;
  texto_normativa_completo?: string;
  indActivo?: boolean;
  ind_activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface NormativaGlobalQuery extends BibliotecaListQuery {
  indActivo?: boolean;
}

export interface NormativaEnte {
  id: string;
  textoNormativaCompleto: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateNormativaEntePayload {
  textoNormativaCompleto: string;
}

export interface UpdateNormativaEntePayload {
  textoNormativaCompleto: string;
}

export interface ClausulaGenerica {
  id: string;
  titulo: string;
  cuerpo: string;
  origen: "generica" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClausulaEnte {
  id: string;
  titulo: string;
  cuerpo: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateClausulaEntePayload {
  titulo: string;
  cuerpo: string;
}

export interface UpdateClausulaEntePayload {
  titulo: string;
  cuerpo: string;
}

export type TokenDisponibleDesde = "EXPEDIENTE" | "ADJUDICACION" | string;

export interface BibliotecaToken {
  etiqueta: string;
  insertar: string;
  descripcion: string;
  disponibleDesde: TokenDisponibleDesde;
  fuente?: string;
}

export interface BibliotecaTokensResponse {
  data: BibliotecaToken[];
  meta: { total: number };
}

export interface ValidarTokensPayload {
  texto: string;
}

export interface TokenValidacionItem {
  original: string;
  clave: string;
  reconocido: boolean;
}

export interface ValidarTokensResponse {
  valido: boolean;
  tokens: TokenValidacionItem[];
  errores: string[];
}

export type PreviewTokensModo = "ETIQUETA" | "LINEA" | "VALOR";

export interface PreviewTokensPayload {
  texto: string;
  modo?: PreviewTokensModo;
  expedienteId?: string;
}

export interface PreviewTokenItem extends TokenValidacionItem {
  resuelto?: boolean;
}

export interface PreviewTokensResponse {
  modo: PreviewTokensModo;
  texto: string;
  tokens: PreviewTokenItem[];
}

export interface TokensEjemploResponse {
  original: string;
  renderizado: string;
}

/** Extrae el texto normativo de un ítem global o de ente. */
export function getNormativaTexto(
  item: NormativaGlobal | NormativaEnte | null | undefined
): string {
  if (!item) return "";
  const raw =
    item.textoNormativaCompleto ??
    (item as NormativaGlobal).texto_normativa_completo ??
    (typeof item.texto === "string" ? item.texto : undefined);
  return typeof raw === "string" ? raw : "";
}
