import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";

import { uploadImageFile } from "@/api/media";
import { useAuthorizedApi } from "@/hooks/useAuthorizedApi";
import { pickImageFromLibrary } from "@/lib/pickImage";
import { invalidateProfile } from "@/lib/invalidate";
import { API_ENDPOINTS } from "@/urls/api";
import type { UserProfile } from "@/types/api";

export function useUploadAvatar() {
  const { accessToken } = useAuthorizedApi();

  const mutation = useMutation({
    mutationFn: (input: { uri: string; fileName: string; mimeType: string }) => {
      if (!accessToken) {
        throw new Error("Brak sesji — zaloguj się ponownie");
      }
      return uploadImageFile<UserProfile>(
        accessToken,
        API_ENDPOINTS.USERS.AVATAR,
        input,
        "Nie udało się zaktualizować zdjęcia profilowego"
      );
    },
    onSuccess: () => invalidateProfile(),
  });

  const pickAndUpload = async () => {
    const picked = await pickImageFromLibrary({ aspect: [1, 1] });
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
