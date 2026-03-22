import BackgroundGradient from "@/components/BackgroundGradient";
import { useLogin } from "@/hooks/auth/useLogin";
import UserLogin from "@/types/UserLogin";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Login() {
    const router = useRouter();
    const { signIn, loading } = useLogin();
    const [userlogin, setUserLogin] = useState<UserLogin>({ username: "", password: "" });
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleChange = (key: keyof UserLogin, value: string) => {
        setUserLogin((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogin = async () => {
        if (!userlogin.username || !userlogin.password) {
            Alert.alert("Błąd", "Wypełnij wszystkie pola");
            return;
        }

        try {
            await signIn({
                username: userlogin.username,
                password: userlogin.password,
            });
            router.replace("/(tabs)");
        } catch (err: any) {
            Alert.alert("Błąd logowania", err.message || "Wystąpił błąd podczas logowania");
        }
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <Text style={styles.title}>Zaloguj się</Text>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => handleChange("username", value)}
                                value={userlogin.username}
                                placeholder="Nazwa użytkownika"
                                placeholderTextColor="#6B7280"
                                autoCapitalize="none"
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => handleChange("password", value)}
                                value={userlogin.password}
                                placeholder="Hasło"
                                placeholderTextColor="#6B7280"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                                <Text style={styles.showPasswordText}>{showPassword ? "Ukryj" : "Pokaż"}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Zaloguj się</Text>}
                        </TouchableOpacity>
                        <View style={styles.linkButton}>
                            <TouchableOpacity onPress={() => router.push("/register")}>
                                <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0906" },
    safeArea: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: "center" },
    title: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF", marginBottom: 32, textAlign: "center" },
    form: { width: "100%" },
    inputContainer: { marginBottom: 16, position: "relative" },
    input: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: "#FFFFFF",
        paddingRight: 80,
    },
    showPasswordButton: { position: "absolute", right: 16, top: 16 },
    showPasswordText: { color: "#FFB90D", fontSize: 14, fontWeight: "600" },
    button: { backgroundColor: "#FFB90D", borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 52 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
    linkButton: { marginTop: 24, alignItems: "center" },
    linkText: { color: "#FFB90D", fontSize: 14, fontWeight: "600" },
});
