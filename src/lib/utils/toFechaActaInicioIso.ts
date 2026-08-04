/** Normaliza yyyy-MM-dd → ISO midnight UTC (mismo criterio que Fase 1 legada). */
export function toFechaActaInicioIso(fecha: string): string {
  if (fecha.includes("T")) return fecha;
  return `${fecha}T00:00:00.000Z`;
}
