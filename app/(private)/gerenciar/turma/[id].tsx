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
import { useClassroomQuery, useDeleteClassroomMutation } from "@/api/turma";
import { usePeriodQuery } from "@/api/periodo";
import axios from "axios";

export default function DetalheTurma() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Fetch classroom details
    const { data: responseData, isLoading, error } = useClassroomQuery(id);
    const { mutateAsync: deleteClassroom, isPending: isDeleting } = useDeleteClassroomMutation();

    const classroom = responseData?.data;

    // Fetch corresponding series (Period) details
    const { data: periodResponse } = usePeriodQuery(classroom?.serie_id || "");
    const periodName = periodResponse?.data?.name || "Carregando série...";

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes da Turma"
        });
    }, [navigation]);

    // Handle API Error
    useEffect(() => {
        if (error) {
            console.error("Erro ao buscar detalhes da turma:", error);
            let errorMsg = "Não foi possível carregar os detalhes da turma.";
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                errorMsg = "Turma não encontrada ou já foi excluída.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [error]);

    const handleEdit = () => {
        if (!classroom) return;
        router.push(`/gerenciar/turma/cadastro?id=${classroom.id}` as any);
    };

    const handleDelete = () => {
        if (!classroom) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Atenção: Tem certeza de que deseja excluir permanentemente a turma "${classroom.name}"? Alunos vinculados ficarão sem turma associada.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteClassroom(classroom.id);
                            Alert.alert("Sucesso", "Turma excluída com sucesso!");
                            router.replace("/gerenciar/turma" as any);
                        } catch (err) {
                            console.error("Erro ao excluir turma:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir a turma.");
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

    if (!classroom) {
        return null;
    }

    const isAtiva = classroom.status === true || classroom.status === 1;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Banner superior */}
            <View style={styles.banner} />

            {/* Profile Header section */}
            <View style={styles.profileHeaderContainer}>
                {/* Icon circular avatar */}
                <View style={styles.avatarContainer}>
                    <Ionicons name="school" size={40} color="#52B28B" />
                </View>

                {/* Action Buttons (Editar / Excluir) */}
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

                {/* Identity Name & Subtitle */}
                <View style={styles.identityContainer}>
                    <Text style={styles.nameText}>{classroom.name}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>{classroom.shift}</Text>
                    </View>
                </View>
            </View>

            {/* Info details */}
            <View style={styles.infoWrapper}>
                <Text style={styles.sectionTitle}>Dados Gerais da Turma</Text>

                <View style={styles.infoRow}>
                    <Ionicons name="key-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>ID da Turma</Text>
                    <Text style={styles.infoValue}>{classroom.id}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Série Escolar</Text>
                    <Text style={styles.infoValue}>{periodName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Capacidade Máxima</Text>
                    <Text style={styles.infoValue}>{classroom.max_students} alunos</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Turno</Text>
                    <Text style={styles.infoValue}>{classroom.shift}</Text>
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
