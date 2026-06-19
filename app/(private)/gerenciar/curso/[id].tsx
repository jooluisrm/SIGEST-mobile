import React, { useEffect } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    ScrollView, 
    Pressable, 
    Alert, 
    ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCourseQuery, useDeleteCourseMutation } from "@/api/curso";
import axios from "axios";

export default function DetalheCurso() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Hooks
    const { data: responseData, isLoading, error } = useCourseQuery(id);
    const { mutateAsync: deleteCourse, isPending: isDeleting } = useDeleteCourseMutation();

    const course = responseData?.data;

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes do Curso"
        });
    }, [navigation]);

    // Handle Query Errors (like 404)
    useEffect(() => {
        if (error) {
            console.error("Erro ao buscar detalhes do curso:", error);
            let errorMsg = "Não foi possível carregar os detalhes do curso.";
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                errorMsg = "Curso não encontrado ou já foi removido.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [error]);

    const handleEdit = () => {
        if (!course) return;
        router.push(`/gerenciar/curso/cadastro?id=${course.id}`);
    };

    const handleDelete = () => {
        if (!course) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Atenção: A exclusão ocorrerá em CASCATA no banco de dados. Isso significa que todos os períodos, turmas e disciplinas vinculados a este curso serão permanentemente excluídos.\n\nDeseja realmente excluir o curso "${course.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCourse(course.id);
                            Alert.alert("Sucesso", "Curso excluído com sucesso!");
                            router.replace("/gerenciar/curso");
                        } catch (err) {
                            console.error("Erro ao deletar curso:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir o curso.");
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || isDeleting) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando informações...</Text>
            </View>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Banner superior */}
            <View style={styles.banner} />

            {/* Area de Informações e Foto (Avatar) */}
            <View style={styles.profileHeaderContainer}>
                {/* Icone circular sobreposto */}
                <View style={styles.avatarContainer}>
                    <Ionicons name="book" size={40} color="#52B28B" />
                </View>

                {/* Seção de botões de Ação na direita (Editar, Excluir) */}
                <View style={styles.actionsRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.editButton,
                            pressed && styles.editButtonPressed
                        ]}
                        onPress={handleEdit}
                    >
                        <Text style={styles.editButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            styles.deleteButton,
                            pressed && styles.deleteButtonPressed
                        ]}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                    </Pressable>
                </View>

                {/* Identidade */}
                <View style={styles.identityContainer}>
                    <Text style={styles.nameText}>{course.name}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>
                            {course.number_periods} {course.number_periods === 1 ? "Período" : "Períodos"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Detalhes de Informação */}
            <View style={styles.infoWrapper}>
                {/* Informações Gerais */}
                <Text style={styles.sectionTitle}>Dados do Curso</Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="key-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>ID do Curso</Text>
                    <Text style={styles.infoValue}>{course.id}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Carga Horária</Text>
                    <Text style={styles.infoValue}>{course.total_hours.toLocaleString("pt-BR")} horas</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="toggle-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, { color: course.status ? "#52B28B" : "#dc2626", fontWeight: "bold" }]}>
                        {course.status ? "Ativo" : "Inativo"}
                    </Text>
                </View>

                {/* Descrição/Detalhes */}
                <Text style={styles.sectionTitle}>Descrição / Observações</Text>
                <View style={styles.detailsContainer}>
                    {course.details ? (
                        <Text style={styles.detailsText}>{course.details}</Text>
                    ) : (
                        <Text style={styles.detailsEmptyText}>Nenhuma descrição ou detalhe cadastrado para este curso.</Text>
                    )}
                </View>
            </View>
            <View style={styles.spacer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
    },
    banner: {
        height: 130,
        backgroundColor: "#52B28B",
    },
    profileHeaderContainer: {
        paddingHorizontal: 16,
        position: "relative",
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    avatarContainer: {
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: "#d1fae5",
        borderWidth: 4,
        borderColor: "#ffffff",
        position: "absolute",
        top: -43,
        left: 16,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
        height: 36,
    },
    actionButton: {
        height: 34,
        borderRadius: 17,
        paddingHorizontal: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
    },
    editButton: {
        borderColor: "#52B28B",
        backgroundColor: "#ffffff",
    },
    editButtonPressed: {
        backgroundColor: "#e8f7f0",
    },
    editButtonText: {
        color: "#52B28B",
        fontSize: 13,
        fontWeight: "bold",
    },
    deleteButton: {
        borderColor: "#fec2c2",
        backgroundColor: "#fef2f2",
    },
    deleteButtonPressed: {
        backgroundColor: "#fee2e2",
    },
    deleteButtonText: {
        color: "#dc2626",
        fontSize: 13,
        fontWeight: "bold",
    },
    identityContainer: {
        marginTop: 14,
        marginBottom: 8,
    },
    nameText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1f2937",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    metaIcon: {
        marginRight: 4,
    },
    metaText: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    infoWrapper: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: "#f9fafb",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    infoIcon: {
        marginRight: 8,
        width: 20,
    },
    infoLabel: {
        fontSize: 14,
        color: "#6b7280",
        width: 110,
    },
    infoValue: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "500",
        flex: 1,
    },
    detailsContainer: {
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    detailsText: {
        fontSize: 15,
        color: "#374151",
        lineHeight: 22,
    },
    detailsEmptyText: {
        fontSize: 14,
        color: "#9ca3af",
        fontStyle: "italic",
    },
    spacer: {
        height: 40,
    },
});
