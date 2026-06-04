import { API_BASE_URL } from "@/urls/urls";
import type { ImageProps } from "expo-image";

export type MediaVariant = "avatar-sm" | "avatar" | "thumb" | "card" | "hero";

export function resolveMediaUrl(uri: string | null | undefined): string | null {
  if (!uri) return null;

  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    try {
      const parsed = new URL(uri);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return uri;
    }
    return uri;
  }

  const path = uri.startsWith("/") ? uri : `/${uri}`;
  return `${API_BASE_URL}${path}`;
}

export function isApiMediaUrl(uri: string | null | undefined): boolean {
  if (!uri) return false;
  if (uri.startsWith("/media/")) return true;
  return uri.includes("/media/") || uri.startsWith(`${API_BASE_URL}/media/`);
}

export function mediaImageHeaders(
  uri: string | null | undefined,
  accessToken: string | null
): Record<string, string> | undefined {
  const resolved = resolveMediaUrl(uri);
  if (!resolved || !accessToken || !isApiMediaUrl(resolved)) {
    return undefined;
  }
  return { Authorization: `Bearer ${accessToken}` };
}

export function mediaImageSource(
  uri: string | null | undefined,
  accessToken: string | null
): { uri: string; headers?: Record<string, string> } | null {
  const resolved = resolveMediaUrl(uri);
  if (!resolved) return null;

  let finalUri = resolved;
  if (accessToken && isApiMediaUrl(resolved)) {
    const sep = resolved.includes("?") ? "&" : "?";
    finalUri = `${resolved}${sep}access_token=${encodeURIComponent(accessToken)}`;
  }

  return {
    uri: finalUri,
    headers: mediaImageHeaders(uri, accessToken),
  };
}

export function mediaCacheKey(uri: string, variant: MediaVariant): string {
  const resolved = resolveMediaUrl(uri) ?? uri;
  return `${resolved}::${variant}`;
}

export function mediaPriority(variant: MediaVariant): ImageProps["priority"] {
  if (variant === "hero") return "high";
  if (variant === "card") return "normal";
  return "low";
}

export function mediaTransitionMs(variant: MediaVariant): number {
  if (variant === "hero") return 450;
  if (variant === "thumb" || variant === "avatar-sm") return 280;
  return 350;
}
