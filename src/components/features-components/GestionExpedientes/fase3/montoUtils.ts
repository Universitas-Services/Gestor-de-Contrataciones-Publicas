// MoneyInput trabaja con "1234567,89"; la API recibe y devuelve números.
export function montoToString(v: unknown): string {
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2).replace(".", ",") : "";
}

export function montoToNumber(v: string | undefined | null): number | undefined {
  if (!v?.trim()) return undefined;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function formatBs(n: number): string {
  return `${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} Bs.`;
}

export function excedePresupuestoMensaje(
  monto: string | undefined,
  presupuestoBase: number | null
): string | null {
  const n = montoToNumber(monto);
  if (n === undefined || presupuestoBase === null || presupuestoBase <= 0) return null;
  if (n <= presupuestoBase) return null;
  return `El monto adjudicado (${formatBs(n)}) excede el presupuesto base de la Fase 1 con I.V.A. (${formatBs(presupuestoBase)}).`;
}
