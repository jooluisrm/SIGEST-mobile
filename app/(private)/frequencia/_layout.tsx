import React from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FrequenciaLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#52B28B", // Theme green
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
                headerLeft: () => (
                    <Pressable
                        onPress={() => router.push("/home")}
                        style={({ pressed }) => [
                            { marginRight: 15, marginLeft: 10 },
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                ),
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Lançamento de Frequência",
                }}
            />
        </Stack>
    );
}
