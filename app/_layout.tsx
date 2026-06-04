import "react-native-gesture-handler";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { DarkTheme, ThemeProvider } from "expo-router/react-navigation";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const TransparentDark = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: "transparent", card: "transparent" },
};

function RootLayoutNav() {
    const { accessToken, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!segments || segments.length === 0) return;
        const inAuthGroup = segments[0] === "(auth)";
        const inTabsGroup = segments[0] === "(tabs)";
        const inEventGroup = segments[0] === "event";
        if (!accessToken && !inAuthGroup) {
            router.replace("/login");
            return;
        }
        if (accessToken && !inTabsGroup && !inEventGroup && !inAuthGroup) {
            router.replace("/");
            return;
        }
    }, [accessToken, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: "#0A0906", justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FFB90D" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="event/[id]" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: "#0A0906" }}>
            <LinearGradient colors={["#0A0906", "#0F0E0A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["rgba(255,185,13,0.14)", "transparent"]} start={{ x: 0.06, y: 0 }} end={{ x: 0.6, y: 0.4 }} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["transparent", "rgba(255,185,13,0.1)"]} start={{ x: 0.4, y: 0.7 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <StatusBar style="light" />
            <ThemeProvider value={TransparentDark}>
                <AuthProvider>
                    <QueryProvider>
                        <RootLayoutNav />
                    </QueryProvider>
                </AuthProvider>
            </ThemeProvider>
        </View>
    );
}
