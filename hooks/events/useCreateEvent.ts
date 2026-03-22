import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/urls/api";

const LOG = "[useCreateEvent]";

export type CreateEventPayload = {
  name: string;
  description?: string | null;
  participant_ids: number[];
};

type CreateEventResult = {
  ok: boolean;
  status: number;
  data?: unknown;
  errorMessage?: string;
};

const safePayloadForLog = (p: CreateEventPayload) => ({
  name: p.name,
  description: p.description ? "(set)" : null,
  participantCount: p.participant_ids?.length ?? 0,
  participant_ids: p.participant_ids,
});

export const useCreateEvent = () => {
  const { authorizedFetch } = useAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(
    async (payload: CreateEventPayload): Promise<CreateEventResult> => {
      const url = API_ENDPOINTS.EVENTS.CREATE;
      setCreating(true);
      setError(null);

      console.log(LOG, "request start", {
        url,
        method: "POST",
        body: safePayloadForLog(payload),
      });

      try {
        const response = await authorizedFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const status = response.status;
        const contentType = response.headers.get("content-type") ?? "";

        console.log(LOG, "response", {
          status,
          ok: response.ok,
          contentType,
          url: response.url || url,
        });

        if (!response.ok) {
          let errorMessage = `Nie udało się utworzyć eventu (${status})`;
          let rawBody = "";

          try {
            rawBody = await response.clone().text();
            console.warn(LOG, "error body (raw)", rawBody.slice(0, 2000));

            if (contentType.includes("application/json")) {
              const errorData = JSON.parse(rawBody);
              if (typeof errorData?.detail === "string" && errorData.detail) {
                errorMessage = errorData.detail;
              } else if (typeof errorData?.message === "string" && errorData.message) {
                errorMessage = errorData.message;
              } else if (Array.isArray(errorData?.errors)) {
                errorMessage = JSON.stringify(errorData.errors);
              }
            } else {
              if (rawBody) errorMessage = `${errorMessage} — ${rawBody.slice(0, 300)}`;
            }
          } catch (parseErr) {
            console.warn(LOG, "could not read error body", parseErr);
          }

          if (status === 403) {
            console.warn(LOG, "403 Forbidden — typowe przyczyny: wygasły access token, brak uprawnień, CSRF (rzadko przy API JSON). Sprawdź czy authorizedFetch odświeżył sesję.");
          }

          setError(errorMessage);
          const err = new Error(errorMessage);
          throw err;
        }

        let data: unknown = {};
        try {
          const text = await response.text();
          if (text) data = JSON.parse(text);
        } catch {
          console.warn(LOG, "empty or non-JSON success body");
        }

        console.log(LOG, "success", {
          id: (data as { id?: number })?.id,
          name: (data as { name?: string })?.name,
        });

        return { ok: true, status, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Błąd tworzenia eventu";
        console.error(LOG, "createEvent failed", {
          message,
          err,
        });
        setError(message);
        throw err;
      } finally {
        setCreating(false);
        console.log(LOG, "request end");
      }
    },
    [authorizedFetch]
  );

  return {
    createEvent,
    creating,
    error,
  };
};
