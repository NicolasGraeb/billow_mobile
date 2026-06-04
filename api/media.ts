import { File, UploadType } from "expo-file-system";

import { ApiError } from "@/api/client";

export type UploadImageInput = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

function toFileUri(uri: string): string {
  if (uri.startsWith("file://") || uri.startsWith("content://")) {
    return uri;
  }
  return uri.startsWith("/") ? `file://${uri}` : uri;
}

async function parseUploadErrorMessage(body: string, fallback: string): Promise<string> {
  try {
    const data = JSON.parse(body) as {
      detail?: unknown;
      message?: unknown;
      errors?: unknown;
    };
    if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (Array.isArray(data?.errors)) return JSON.stringify(data.errors);
  } catch {
  }
  if (body.trim()) return `${fallback} — ${body.slice(0, 300)}`;
  return fallback;
}

export async function uploadImageFile<T>(
  accessToken: string,
  url: string,
  input: string | UploadImageInput,
  errorMessage: string
): Promise<T> {
  const payload: UploadImageInput =
    typeof input === "string" ? { uri: input } : input;

  const mimeType = payload.mimeType ?? "image/jpeg";
  const file = new File(toFileUri(payload.uri));

  const result = await file.upload(url, {
    httpMethod: "POST",
    uploadType: UploadType.MULTIPART,
    fieldName: "file",
    mimeType,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(
      await parseUploadErrorMessage(result.body, errorMessage),
      result.status
    );
  }

  if (!result.body.trim()) return {} as T;
  return JSON.parse(result.body) as T;
}
