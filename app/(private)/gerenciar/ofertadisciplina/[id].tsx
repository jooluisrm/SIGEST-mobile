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
import { useOfertaDisciplinaQuery, useDeleteOfertaDisciplinaMutation } from "@/api/ofertadisciplina";
import axios from "axios";

export default function DetalheOferta() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: responseData, isLoading, error } = useOfertaDisciplinaQuery(id);
    const { mutateAsync: deleteOferta, isPending: isDeleting } = useDeleteOfertaDisciplinaMutation();

    const oferta = responseData?.data;

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes da Oferta"
        });
    }, [navigation]);

    useEffect(() => {
        if (error) {
            console.error("Erro ao buscar detalhes da oferta:", error);
            let errorMsg = "Não foi possível carregar os detalhes da oferta.";
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                errorMsg = "Oferta de disciplina não encontrada ou já foi excluída.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [error]);

    const handleEdit = () => {
        if (!oferta) return;
        router.push(`/gerenciar/ofertadisciplina/cadastro?id=${oferta.id}` as any);
    };

    const handleDelete = () => {
        if (!oferta) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Atenção: Tem certeza de que deseja excluir permanentemente esta oferta? Alunos enturmados nesta oferta serão desvinculados.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteOferta(oferta.id);
                            Alert.alert("Sucesso", "Oferta excluída com sucesso!");
                            router.replace("/gerenciar/ofertadisciplina" as any);
                        } catch (err) {
                            console.error("Erro ao excluir oferta:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir a oferta.");
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

    if (!oferta) {
        return null;
    }

    const isAtiva = oferta.status === true || oferta.status === 1;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.banner} />

            <View style={styles.profileHeaderContainer}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="briefcase" size={40} color="#52B28B" />
                </View>

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

                <View style={styles.identityContainer}>
                    <Text style={styles.nameText}>{oferta.disciplina?.name || "Oferta de Disciplina"}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="school-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>Turma: {oferta.classroom?.name || "N/A"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.infoWrapper}>
                <Text style={styles.sectionTitle}>Dados da Oferta</Text>

                <View style={styles.infoRow}>
                    <Ionicons name="key-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>ID da Oferta</Text>
                    <Text style={styles.infoValue}>{oferta.id}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="book-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Disciplina</Text>
                    <Text style={styles.infoValue}>{oferta.disciplina?.name || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Turma</Text>
                    <Text style={styles.infoValue}>{oferta.classroom?.name || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Professor</Text>
                    <Text style={styles.infoValue}>{oferta.professor?.name || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Período Letivo</Text>
                    <Text style={styles.infoValue}>{oferta.periodo_letivo?.name || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="toggle-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Situação</Text>
                    <Text style={[styles.infoValue, { color: isAtiva ? "#52B28B" : "#dc2626", fontWeight: "bold" }]}>
                        {isAtiva ? "Ativa" : "Inativa"}
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
        fontSize: 20,
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
        paddingVertical: 12,
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
        width: 125,
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
