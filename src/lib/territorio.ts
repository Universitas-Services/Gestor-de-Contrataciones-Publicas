export interface TerritorioCiudad {
  id: number;
  nombre: string;
  municipio_id?: number;
}

interface TerritorioResponse<T> {
  message: string;
  data: T;
}

function getUniversitasBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_UNIVERSITAS_SDK_URL ?? "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/**
 * Lista ciudades por estado.
 * El SDK usa municipio/{id}/ciudades, pero la API expone estados/{id}/ciudades.
 */
export async function getCiudadesPorEstado(estadoId: number): Promise<TerritorioCiudad[]> {
  const baseURL = getUniversitasBaseUrl();
  if (!baseURL) {
    throw new Error("[Territorio] Define NEXT_PUBLIC_UNIVERSITAS_SDK_URL en tu .env");
  }

  const response = await fetch(`${baseURL}/api/v1/territorio/estados/${estadoId}/ciudades`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error al cargar ciudades: HTTP ${response.status}`);
  }

  const json = (await response.json()) as TerritorioResponse<TerritorioCiudad[]>;
  return json.data;
}
