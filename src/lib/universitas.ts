import "server-only"; // Garantiza que este archivo jamás llegue al navegador
import { UniversitasAPI } from "@universitas/sdk-global";

// Extendemos el objeto global de TypeScript para evitar errores de tipado
declare global {
   
  var universitasGlobal: UniversitasAPI | undefined;
}

// Instanciamos el SDK apuntando a la API Global de Universitas
export const universitas =
  globalThis.universitasGlobal || new UniversitasAPI(process.env.UNIVERSITAS_SDK_URL!);

// En desarrollo, guardamos la instancia en globalThis para que sobreviva a las recargas del HMR
if (process.env.NODE_ENV !== "production") {
  globalThis.universitasGlobal = universitas;
}
