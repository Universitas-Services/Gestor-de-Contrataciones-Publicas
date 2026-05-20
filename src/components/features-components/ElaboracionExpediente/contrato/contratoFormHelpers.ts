export function sanitizeMontoInput(value: string): string {
  return value.replace(/[^\d.,]/g, "");
}

export function sanitizePercentInput(value: string): string {
  return value.replace(/[^\d.,]/g, "");
}

export const CONTRATO_INPUT_CLASS =
  "h-11 bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full max-w-xl";

export const CONTRATO_TEXTAREA_CLASS =
  "min-h-[100px] bg-white border-slate-300 rounded-md focus-visible:ring-1 focus-visible:ring-color-boton-2/30 w-full max-w-2xl resize-y";
