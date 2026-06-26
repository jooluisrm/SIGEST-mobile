import React from "react";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOfertaDisciplinaQuery } from "@/api/ofertadisciplina";

export default function TurmaLayout() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data: response } = useOfertaDisciplinaQuery(id);
    
    const disciplineName = response?.data?.disciplina?.name || "Diário de Classe";
    const classroomName = response?.data?.classroom?.name ? ` - ${response.data.classroom.name}` : "";

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: "#52B28B",
                tabBarInactiveTintColor: "#6b7280",
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
                tabBarStyle: {
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom || 8,
                    paddingTop: 8,
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e5e7eb",
                },
                headerStyle: {
                    backgroundColor: "#52B28B",
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 16,
                },
                headerLeft: () => (
                    <Pressable
                        onPress={() => {
                            if (route.name.startsWith("atividade/")) {
                                router.replace({
                                    pathname: "/(private)/turma/[id]/atividades" as any,
                                    params: { id }
                                });
                            } else {
                                router.replace("/(private)/home");
                            }
                        }}
                        style={({ pressed }) => [
                            { marginLeft: 16, justifyContent: "center", alignItems: "center" },
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                ),
            })}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Informações",
                    headerTitle: `${disciplineName}${classroomName}`,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="atividades"
                options={{
                    title: "Atividades",
                    headerTitle: `${disciplineName}${classroomName}`,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="frequencia"
                options={{
                    title: "Frequência",
                    headerTitle: `${disciplineName}${classroomName}`,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="atividade/[atividadeId]"
                options={{
                    href: null,
                    title: "Detalhes da Atividade",
                    headerTitle: "Detalhes da Atividade",
                    tabBarStyle: { display: "none" },
                }}
            />
        </Tabs>
    );
}
