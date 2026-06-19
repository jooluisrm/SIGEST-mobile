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
import { usePeriodoLetivoQuery, useDeletePeriodoLetivoMutation } from "@/api/periodoletivo";
import { useCourseQuery } from "@/api/curso";
import axios from "axios";

function formatDateISOToBR(dateStr: string): string {
    if (!dateStr) return "Não informada";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export default function DetalhePeriodoLetivo() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Hooks
    const { data: responseData, isLoading, error } = usePeriodoLetivoQuery(id);
    const { mutateAsync: deletePeriodoLetivo, isPending: isDeleting } = useDeletePeriodoLetivoMutation();

    const periodoLetivo = responseData?.data;

    // Fetch matching course details to get the name
    const { data: courseResponse } = useCourseQuery(periodoLetivo?.course_id || "");
    const courseName = courseResponse?.data?.name || "Carregando informações do curso...";

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes do Período Letivo"
        });
    }, [navigation]);

    // Handle Query Errors (like 404)
    useEffect(() => {
        if (error) {
            console.error("Erro ao buscar detalhes do período letivo:", error);
            let errorMsg = "Não foi possível carregar os detalhes do período letivo.";
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                errorMsg = "Período letivo não encontrado ou já foi removido.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [error]);

    const handleEdit = () => {
        if (!periodoLetivo) return;
        router.push(`/gerenciar/periodoletivo/cadastro?id=${periodoLetivo.id}` as any);
    };

    const handleDelete = () => {
        if (!periodoLetivo) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Atenção: A exclusão ocorrerá em CASCATA no banco de dados. Isso significa que TODAS as séries (periods), turmas (classrooms) e matrículas filhas associadas a este período letivo serão permanentemente excluídas.\n\nDeseja realmente excluir o período letivo "${periodoLetivo.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePeriodoLetivo(periodoLetivo.id);
                            Alert.alert("Sucesso", "Período letivo excluído com sucesso!");
                            router.replace("/gerenciar/periodoletivo" as any);
                        } catch (err) {
                            console.error("Erro ao deletar período letivo:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir o período letivo.");
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

    if (!periodoLetivo) {
        return null;
    }

    const isAtivo = periodoLetivo.status === true || periodoLetivo.status === 1;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Banner superior */}
            <View style={styles.banner} />

            {/* Area de Informações e Foto (Avatar) */}
            <View style={styles.profileHeaderContainer}>
                {/* Icone circular sobreposto */}
                <View style={styles.avatarContainer}>
                    <Ionicons name="calendar" size={40} color="#52B28B" />
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
                    <Text style={styles.nameText}>{periodoLetivo.name}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="book-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                            {courseName}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Detalhes de Informação */}
            <View style={styles.infoWrapper}>
                {/* Informações Gerais */}
                <Text style={styles.sectionTitle}>Dados do Período Letivo</Text>
                
                <View style={styles.infoRow}>
                    <Ionicons name="key-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>ID do Período</Text>
                    <Text style={styles.infoValue}>{periodoLetivo.id}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Data de Início</Text>
                    <Text style={styles.infoValue}>{formatDateISOToBR(periodoLetivo.data_inicio)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Encerramento</Text>
                    <Text style={styles.infoValue}>{formatDateISOToBR(periodoLetivo.data_encerramento)}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="toggle-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, { color: isAtivo ? "#52B28B" : "#dc2626", fontWeight: "bold" }]}>
                        {isAtivo ? "Ativo" : "Inativo"}
                    </Text>
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
    spacer: {
        height: 40,
    },
});
