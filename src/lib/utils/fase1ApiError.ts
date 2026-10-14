export class Fase1MicromoduloError extends Error {
  readonly errores: string[];

  constructor(message: string, errores: string[] = []) {
    super(message);
    this.name = "Fase1MicromoduloError";
    this.errores = errores;
  }
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function parseApiErrorPayload(
  json: unknown,
  fallbackMessage: string
): Fase1MicromoduloError {
  const payload = json as Record<string, unknown> | null;
  const messageFromArray = asStringList(payload?.message);
  const errores = asStringList(payload?.errores);

  const baseMessage =
    (typeof payload?.message === "string" && payload.message) ||
    (messageFromArray.length > 0 ? messageFromArray.join("\n") : "") ||
    (typeof payload?.error === "string" && payload.error) ||
    fallbackMessage;

  const detalle = errores.length > 0 ? errores : messageFromArray;
  // Incluir detalle en message: los server actions no serializan bien propiedades custom al cliente.
  const message =
    detalle.length > 0 && !detalle.every((item) => baseMessage.includes(item))
      ? `${baseMessage}\n${detalle.join("\n")}`
      : baseMessage;

  return new Fase1MicromoduloError(message, detalle);
}

export async function parseApiErrorResponse(
  response: Response,
  fallbackMessage: string
): Promise<Fase1MicromoduloError> {
  const json = await response.json().catch(() => ({}));
  const parsed = parseApiErrorPayload(json, fallbackMessage);

  // 500 genérico del Nest: orientar a logs del API (no es un fallo de UI).
  if (response.status >= 500) {
    const generic =
      !parsed.message ||
      /^internal server error$/i.test(parsed.message.trim()) ||
      parsed.message === fallbackMessage;
    if (generic) {
      return new Fase1MicromoduloError(
        "Error del servidor al guardar el micromódulo. Revise los logs del API (NestJS); no es un fallo de la interfaz.",
        parsed.errores
      );
    }
  }

  return parsed;
}

export function formatMicromoduloErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error."
): string {
  if (error instanceof Fase1MicromoduloError) {
    if (error.errores.length > 0) {
      return error.errores.join("\n");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
