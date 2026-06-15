import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, Image, Pressable, Text } from "react-native";

export default function RootLayout() {
    const router = useRouter();

    return (
        <SafeAreaProvider>
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
        </SafeAreaProvider>
    )
}