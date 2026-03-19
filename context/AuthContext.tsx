import { API_ENDPOINTS } from "@/urls/api";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshTokens: () => Promise<boolean>;
    authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    refreshTokens: async () => false,
    authorizedFetch: async () => new Response(null, { status: 401 }),
});

const decodeJWT = (token: string | null | undefined): { sub?: string } | null => {
    if (token == null || typeof token !== "string") {
        return null;
    }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        // Dekoduj payload (druga część tokena)
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

const timeoutFetch = async (url: string, options: RequestInit = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        return res;
    } finally {
        clearTimeout(id);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const extractUserId = (token: string): number | null => {
        const payload = decodeJWT(token);
        if (!payload || !payload.sub) {
            return null;
        }
        const userIdNum = parseInt(payload.sub, 10);
        return isNaN(userIdNum) ? null : userIdNum;
    };

    const login = async (access: string, refresh: string) => {
        setAccessToken(access);
        setRefreshToken(refresh);
        
        const userIdFromToken = extractUserId(access);
        if (userIdFromToken) {
            setUserId(userIdFromToken);
            await SecureStore.setItemAsync("user_id", userIdFromToken.toString());
        }
        
        await SecureStore.setItemAsync("access_token", access);
        await SecureStore.setItemAsync("refresh_token", refresh);
    };

    const logout = async () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUserId(null);
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("user_id");
    };

    const refreshTokens = async (): Promise<boolean> => {
        const currentRefresh = refreshToken || (await SecureStore.getItemAsync("refresh_token"));
        if (!currentRefresh) return false;

        try {
            const response = await timeoutFetch(API_ENDPOINTS.AUTH.REFRESH, {
                method: "POST",
                headers: { Authorization: `Bearer ${currentRefresh}` },
            });

            if (!response.ok) {
                console.warn("[refreshTokens] Failed:", response.status);
                await logout();
                return false;
            }

            const data = await response.json();
            if (data.access_token && data.refresh_token) {
                await login(data.access_token, data.refresh_token);
                await new Promise(r => setTimeout(r, 100));
                return true;
            }

            await logout();
            return false;
        } catch (err) {
            console.error("[refreshTokens] error:", err);
            return false;
        }
    };



    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedAccess = await SecureStore.getItemAsync("access_token");
                const storedRefresh = await SecureStore.getItemAsync("refresh_token");
                const storedUserId = await SecureStore.getItemAsync("user_id");
                
                if (storedAccess) {
                    setAccessToken(storedAccess);
                    // Wyciągnij userId z tokena, jeśli nie ma w SecureStore
                    const userIdFromToken = extractUserId(storedAccess);
                    if (userIdFromToken) {
                        setUserId(userIdFromToken);
                        if (!storedUserId) {
                            await SecureStore.setItemAsync("user_id", userIdFromToken.toString());
                        }
                    } else if (storedUserId) {
                        setUserId(parseInt(storedUserId, 10));
                    }
                } else if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10));
                }
                
                if (storedRefresh) setRefreshToken(storedRefresh);
            } finally {
                setLoading(false);
            }
            try {
                const refreshed = await refreshTokens();
                // userId jest już aktualizowany w funkcji login, która jest wywoływana w refreshTokens
            } catch {}
        };
        bootstrap();
    }, []);

    const authorizedFetch = async (input: RequestInfo, init: RequestInit = {}, retry = true): Promise<Response> => {
        const buildHeaders = (token: string, headersInit?: HeadersInit): Headers => {
            const headers = new Headers(headersInit);
            headers.set("Authorization", `Bearer ${token}`);
            if (!headers.has("Content-Type") && !(init && init.body instanceof FormData)) {
                headers.set("Content-Type", "application/json");
            }
            return headers;
        };

        const performRequest = async (token: string) => {
            const headers = buildHeaders(token, init.headers);
            const rawAuthHeader = headers instanceof Headers
                ? headers.get("Authorization")
                : (headers as Record<string, string>)?.Authorization;
            const maskedAuthHeader = rawAuthHeader
                ? `${rawAuthHeader.slice(0, 16)}...${rawAuthHeader.slice(-5)}`
                : 'none';
            return fetch(input, { ...init, headers });
        };

        const getToken = async () => {
            const stored = await SecureStore.getItemAsync("access_token");
            if (stored) return stored;
            return accessToken;
        };

        let token = await getToken();
        if (!token) {
            throw new Error("Brak tokenu uwierzytelniającego");
        }

        let response = await performRequest(token);

        if (response.status === 401 && retry) {
            const refreshed = await refreshTokens();
            if (!refreshed) {
                throw new Error("Sesja wygasła. Zaloguj się ponownie.");
            }
            token = await getToken();
            if (!token) {
                throw new Error("Brak tokenu uwierzytelniającego");
            }
            response = await performRequest(token);
        }

        return response;
    };

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                refreshToken,
                userId,
                loading,
                login,
                logout,
                refreshTokens,
                authorizedFetch,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
