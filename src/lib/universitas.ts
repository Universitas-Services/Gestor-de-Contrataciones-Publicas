import "server-only"; // Garantiza que este archivo jamás llegue al navegador
import { UniversitasAPI } from "@universitas/sdk-global";

// Extendemos el objeto global de TypeScript para evitar errores de tipado
declare global {
  var universitasGlobal: UniversitasAPI | undefined;
}

/**
 * Lazy getter del SDK de Universitas (servidor).
 * La instancia se crea la primera vez que se llama a esta función,
 * NO al importar el módulo. Esto evita el crash en build-time cuando
 * la variable de entorno UNIVERSITAS_SDK_URL aún no está disponible.
 */
export function getUniversitas(): UniversitasAPI {
  if (globalThis.universitasGlobal) return globalThis.universitasGlobal;

  const url = process.env.UNIVERSITAS_SDK_URL;
  if (!url) {
    throw new Error("[Universitas SDK] UNIVERSITAS_SDK_URL no está definida. Agrégala en tu .env");
  }

  const instance = new UniversitasAPI(url);

  // En desarrollo conservamos la instancia para sobrevivir recargas del HMR
  if (process.env.NODE_ENV !== "production") {
    globalThis.universitasGlobal = instance;
  }

  return instance;
}
