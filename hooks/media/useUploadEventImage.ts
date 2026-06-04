import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

import { uploadImageFile } from "@/api/media";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { pickImageFromLibrary } from "@/lib/pickImage";
import { invalidateEventDetail, invalidateEvents } from "@/lib/invalidate";
import { API_ENDPOINTS } from "@/urls/api";
import type { EventDetail } from "@/types/api";

export function useUploadEventImage(eventId: number) {
  const { accessToken } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (input: { uri: string; fileName: string; mimeType: string }) => {
      if (!accessToken) {
        throw new Error("Brak sesji — zaloguj się ponownie");
      }
      return uploadImageFile<EventDetail>(
        accessToken,
        API_ENDPOINTS.MEDIA.IMAGE(eventId),
        input,
        "Nie udało się zaktualizować zdjęcia wydarzenia"
      );
    },
    onSuccess: () => {
      invalidateEventDetail(eventId);
      invalidateEvents();
    },
  });

  const pickAndUpload = async () => {
    if (!eventId || eventId <= 0) {
      Alert.alert("Błąd", "Nieprawidłowy event.");
      return;
    }

    const picked = await pickImageFromLibrary({ aspect: [16, 9] });
    if (!picked) return;

    try {
      await mutation.mutateAsync(picked);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia";
      Alert.alert("Błąd", message);
    }
  };

  return {
    pickAndUpload,
    uploading: mutation.isPending,
  };
}
