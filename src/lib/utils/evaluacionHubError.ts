export class EvaluacionHubError extends Error {
  readonly status: number;
  readonly errores: string[];

  constructor(message: string, status: number, errores: string[] = []) {
    super(message);
    this.name = "EvaluacionHubError";
    this.status = status;
    this.errores = errores;
  }
}

export function formatHubErrorMessage(error: unknown, fallback = "Ocurrió un error."): string {
  if (error instanceof EvaluacionHubError) {
    if (error.errores.length > 0) return error.errores.join("\n");
    return error.message;
  }
  if (error instanceof Error) {
    // Server actions serializan Error; el detalle ya va en message.
    if (error.name === "EvaluacionHubError" && error.message) return error.message;
    return error.message;
  }
  return fallback;
}
