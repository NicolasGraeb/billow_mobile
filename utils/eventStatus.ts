export const isEventActive = (status: string | null | undefined): boolean =>
  (status ?? "").toUpperCase() === "ACTIVE";

export const isEventFinished = (status: string | null | undefined): boolean =>
  (status ?? "").toUpperCase() === "FINISHED";
