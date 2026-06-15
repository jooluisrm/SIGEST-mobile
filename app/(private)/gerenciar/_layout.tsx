import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GerenciarLayout() {
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
                        onPress={() => router.back()}
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
                name="aluno/index"
                options={{
                    title: "Gerenciar Alunos",
                }}
            />
            <Stack.Screen
                name="usuario/index"
                options={{
                    title: "Gerenciar Usuários",
                }}
            />
            <Stack.Screen
                name="professor/index"
                options={{
                    title: "Gerenciar Professores",
                }}
            />
            <Stack.Screen
                name="curso/index"
                options={{
                    title: "Gerenciar Cursos",
                }}
            />
            <Stack.Screen
                name="disciplina/index"
                options={{
                    title: "Gerenciar Disciplinas",
                }}
            />
            <Stack.Screen
                name="turma/index"
                options={{
                    title: "Gerenciar Turmas",
                }}
            />
            <Stack.Screen
                name="avaliacao/index"
                options={{
                    title: "Gerenciar Avaliações",
                }}
            />

        </Stack>
    );
}
