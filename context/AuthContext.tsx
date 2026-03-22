import {API_ENDPOINTS} from "@/urls/api";
import * as SecureStore from "expo-secure-store";
import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    /** Zwraca nowy access token albo null (wtedy sesja nieaktualna). */
    refreshTokens: () => Promise<string | null>;
    authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    refreshTokens: async () => null,
    authorizedFetch: async () => new Response(null, { status: 401 }),
});

type JwtPayload = {
    sub?: string;
    exp?: number;
    type?: string;
};

const decodeJWT = (token: string | null | undefined): JwtPayload | null => {
    if (token == null || typeof token !== "string") {
        return null;
    }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

/** Access token wygasł lub wygaśnie w ciągu 2 min — odśwież zanim poleci request (unikasz 403 z Spring Security). */
const shouldRefreshAccessTokenBeforeRequest = (token: string): boolean => {
    const p = decodeJWT(token);
    if (!p?.exp || typeof p.exp !== "number") {
        return false;
    }
    const expMs = p.exp * 1000;
    const bufferMs = 2 * 60 * 1000;
    return expMs <= Date.now() + bufferMs;
};

const timeoutFetch = async (url: string, options: RequestInit = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {...options, signal: controller.signal});
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
        if (userIdFromToken !== null) {
            setUserId(userIdFromToken);
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
    };

    const refreshTokens = async (): Promise<string | null> => {
        const currentRefresh = refreshToken || (await SecureStore.getItemAsync("refresh_token"));
        if (!currentRefresh) {
            console.warn("[refreshTokens] brak refresh tokenu");
            return null;
        }

        try {
            const response = await timeoutFetch(API_ENDPOINTS.AUTH.REFRESH, {
                method: "POST",
                headers: { Authorization: `Bearer ${currentRefresh}` },
            });

            if (!response.ok) {
                console.warn("[refreshTokens] Failed:", response.status);
                await logout();
                return null;
            }

            const data = await response.json();
            const newAccess =
                (typeof data?.access_token === "string" && data.access_token) ||
                (typeof data?.accessToken === "string" && data.accessToken) ||
                "";
            const newRefresh =
                (typeof data?.refresh_token === "string" && data.refresh_token) ||
                (typeof data?.refreshToken === "string" && data.refreshToken) ||
                "";

            if (newAccess && newRefresh) {
                await login(newAccess, newRefresh);
                console.log("[refreshTokens] OK — używam access tokenu z odpowiedzi (bez ponownego odczytu ze store)");
                return newAccess;
            }

            await logout();
            return null;
        } catch (err) {
            console.error("[refreshTokens] error:", err);
            return null;
        }
    };



    useEffect(() => {
        const bootstrap = async () => {
            try {
                const storedAccess = await SecureStore.getItemAsync("access_token");
                const storedRefresh = await SecureStore.getItemAsync("refresh_token");
                
                if (storedAccess) {
                    setAccessToken(storedAccess);
                    const userIdFromToken = extractUserId(storedAccess);
                    if (userIdFromToken !== null) {
                        setUserId(userIdFromToken);
                    }
                }
                
                if (storedRefresh) setRefreshToken(storedRefresh);
            } finally {
                setLoading(false);
            }
            try {
                await refreshTokens();
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

        if (shouldRefreshAccessTokenBeforeRequest(token)) {
            console.log("[authorizedFetch] access token expired / expiring soon → refresh before request");
            const newAccess = await refreshTokens();
            if (!newAccess) {
                throw new Error("Sesja wygasła. Zaloguj się ponownie.");
            }
            token = newAccess;
        }

        let response = await performRequest(token);

        if ((response.status === 401 || response.status === 403) && retry) {
            console.warn("[authorizedFetch]", response.status, "→ próba odświeżenia tokenu i powtórki żądania");
            const newAccess = await refreshTokens();
            if (!newAccess) {
                throw new Error("Sesja wygasła. Zaloguj się ponownie.");
            }
            response = await performRequest(newAccess);
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
