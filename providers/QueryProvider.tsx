import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      queryClient.clear();
    }
  }, [accessToken]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
