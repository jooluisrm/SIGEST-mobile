import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GerenciarLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={({ route }) => ({
                headerStyle: {
                    backgroundColor: "#52B28B", // Theme green
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
                headerLeft: route.name.endsWith("index") ? () => (
                    <Pressable
                        onPress={() => router.push('/home')}
                        style={({ pressed }) => [
                            { marginRight: 15, marginLeft: 10 },
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                ) : undefined,
            })}
        >
            <Stack.Screen
                name="aluno/index"
                options={{
                    title: "Gerenciar Alunos",
                }}
            />
            <Stack.Screen
                name="aluno/cadastro"
                options={{
                    title: "Cadastrar Aluno",
                }}
            />
            <Stack.Screen
                name="usuario/index"
                options={{
                    title: "Gerenciar Usuários",
                }}
            />
            <Stack.Screen
                name="usuario/cadastro"
                options={{
                    title: "Cadastrar Usuário",
                }}
            />
            <Stack.Screen
                name="professor/index"
                options={{
                    title: "Gerenciar Professores",
                }}
            />
            <Stack.Screen
                name="professor/cadastro"
                options={{
                    title: "Cadastrar Professor",
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
