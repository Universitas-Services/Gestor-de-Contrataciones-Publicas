export type EventColor = "blue" | "red" | "green" | "orange" | "yellow" | "purple" | "gray";

export interface IEvent {
  id: string;
  title: string;
  /** ISO date string: "2026-03-05" */
  startDate: string;
  /** ISO date string: "2026-03-07" */
  endDate: string;
  color: EventColor;
}
