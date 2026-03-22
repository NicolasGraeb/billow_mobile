/**
 * Backend zwraca status z enum EventStatus: "ACTIVE" | "FINISHED" (Jackson .name()).
 * Nie porównuj na sztywno do 'active' — wtedy UI mylnie pokazuje event jako zakończony.
 */
export const isEventActive = (status: string | null | undefined): boolean =>
  (status ?? "").toUpperCase() === "ACTIVE";

export const isEventFinished = (status: string | null | undefined): boolean =>
  (status ?? "").toUpperCase() === "FINISHED";
