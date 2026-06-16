import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, Image, Pressable, Text, ActivityIndicator, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

const queryClient = new QueryClient();

function NavigationLayout() {
    const router = useRouter();
    const segments = useSegments();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const inPrivateGroup = segments[0] === "(private)";

        if (!user && inPrivateGroup) {
            // Se não logado e tenta acessar rota privada, vai para a tela de boas-vindas
            router.replace("/(public)/welcome-screen");
        } else if (user && !inPrivateGroup) {
            // Se logado e tenta acessar rota pública, vai para o painel privado (home)
            router.replace("/(private)/home");
        }
    }, [user, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#52B28B" }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Screen
                name="(public)/welcome-screen"
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: "#52B28B",
                    },
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Image
                            source={require("../assets/sigest-logo.png")}
                            style={{ width: 100, height: 38, resizeMode: "contain" }}
                        />
                    ),
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/login")}
                            style={({ pressed }) => [
                                {
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                    borderWidth: 1,
                                    borderColor: "rgba(255, 255, 255, 0.4)",
                                    marginRight: 10,
                                },
                                pressed && { backgroundColor: "rgba(255, 255, 255, 0.35)" }
                            ]}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600" }}>
                                Acessar o sistema
                            </Text>
                        </Pressable>
                    ),
                }}
            />
            <Stack.Screen
                name="(public)/login"
                options={{
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: "",
                    headerTintColor: "#fff"
                }}
            />

            <Stack.Screen name="(private)" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <AuthProvider>
                    <NavigationLayout />
                </AuthProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}