export interface IEvent {
  id: string;
  title: string;
  /** ISO date string: "2026-03-05" */
  startDate: string;
  /** ISO date string: "2026-03-07" */
  endDate: string;
  /**
   * CSS variable suffix — e.g. "cal-disponibilidad".
   * Used as: var(--color-<colorVar>)
   */
  colorVar: string;
}
