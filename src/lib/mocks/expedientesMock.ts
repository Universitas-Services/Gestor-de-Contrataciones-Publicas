/**
 * Datos mock para el módulo de Elaboración de Expediente
 * NOTA: La mayoría de los mocks han sido reemplazados por datos reales del backend.
 * Este archivo se mantiene por si se necesitan datos de referencia durante el desarrollo.
 */

import type { IEvent } from "@/components/features-components/ElaboracionExpediente/calendar/types";

/**
 * Cronograma de ejemplo — Solo como referencia para desarrollo
 * En producción se usa POST /expedientes/generar-cronograma
 */
export const CRONOGRAMA_EJEMPLO: IEvent[] = [
  {
    id: "ev-1",
    title: "Disponibilidad del Pliego",
    startDate: "2026-03-02",
    endDate: "2026-03-07",
    colorVar: "orange",
  },
  {
    id: "ev-2",
    title: "Apertura de Actividades",
    startDate: "2026-03-05",
    endDate: "2026-03-05",
    colorVar: "green",
  },
  {
    id: "ev-3",
    title: "Modificaciones al Pliego",
    startDate: "2026-03-09",
    endDate: "2026-03-09",
    colorVar: "blue",
  },
];
