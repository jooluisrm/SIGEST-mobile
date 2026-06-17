import React, { useEffect } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    ScrollView, 
    Pressable, 
    Alert, 
    ActivityIndicator,
    Image
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAlunoQuery, useDeleteAlunoMutation } from "@/api/aluno";
import { formatCPF, formatPhoneBR, formatRG } from "@/utils/masks";
import axios from "axios";

function formatDateISOToBR(dateStr: string): string {
    if (!dateStr) return "Não informado";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export default function DetalheAluno() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    // Hooks
    const { data: responseData, isLoading, error } = useAlunoQuery(id);
    const { mutateAsync: deleteAluno, isPending: isDeleting } = useDeleteAlunoMutation();

    const aluno = responseData?.data;

    useEffect(() => {
        navigation.setOptions({
            title: "Perfil do Aluno"
        });
    }, [navigation]);

    // Handle Query Errors (like 404)
    useEffect(() => {
        if (error) {
            console.error("Erro ao buscar detalhes do aluno:", error);
            let errorMsg = "Não foi possível carregar os detalhes do aluno.";
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                errorMsg = "Aluno não encontrado ou já foi removido.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [error]);

    const handleEdit = () => {
        if (!aluno) return;
        router.push(`/gerenciar/aluno/cadastro?id=${aluno.id}`);
    };

    const handleDelete = () => {
        if (!aluno) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Deseja realmente excluir o aluno ${aluno.name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAluno(aluno.id);
                            Alert.alert("Sucesso", "Aluno excluído com sucesso!");
                            router.replace("/gerenciar/aluno");
                        } catch (err) {
                            console.error("Erro ao deletar aluno:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir o aluno.");
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

    if (!aluno) {
        return null;
    }

    // Get Initials for Avatar
    const initials = aluno.name
        ? aluno.name
            .trim()
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((n: string) => n[0].toUpperCase())
            .join("")
        : "";

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Banner superior */}
            <View style={styles.banner} />

            {/* Area de Informações e Foto (Avatar) */}
            <View style={styles.profileHeaderContainer}>
                {/* Avatar circular sobreposto */}
                <View style={styles.avatarContainer}>
                    <Image source={require("../../../../assets/aluno-icon.png")} style={styles.avatarImage} />
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
                    <Text style={styles.nameText}>{aluno.name}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="card-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>Matrícula: {aluno.matricula}</Text>
                    </View>
                </View>
            </View>

            {/* Detalhes de Informação */}
            <View style={styles.infoWrapper}>
                {/* Informações Gerais */}
                <Text style={styles.sectionTitle}>Dados Gerais</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="document-text-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>CPF</Text>
                    <Text style={styles.infoValue}>{formatCPF(aluno.cpf || "")}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="card-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>RG</Text>
                    <Text style={styles.infoValue}>{formatRG(aluno.rg || "")}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Nascimento</Text>
                    <Text style={styles.infoValue}>{formatDateISOToBR(aluno.data_nascimento || "")}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="transgender-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Gênero</Text>
                    <Text style={styles.infoValue}>{aluno.genero || "Prefiro não dizer"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="body-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Deficiência</Text>
                    <Text style={styles.infoValue}>{aluno.deficiencia && aluno.deficiencia !== "Nenhuma" ? aluno.deficiencia : "Não possui"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, { color: aluno.status ? "#16a34a" : "#dc2626" }]}>
                        {aluno.status ? "Ativo" : "Inativo"}
                    </Text>
                </View>

                {/* Filiação */}
                <Text style={styles.sectionTitle}>Filiação</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Nome da Mãe</Text>
                    <Text style={styles.infoValue}>{aluno.nome_mae}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Nome do Pai</Text>
                    <Text style={styles.infoValue}>{aluno.nome_pai || "Não informado"}</Text>
                </View>

                {/* Contatos */}
                <Text style={styles.sectionTitle}>Contato</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>E-mail</Text>
                    <Text style={styles.infoValue}>{aluno.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Celular</Text>
                    <Text style={styles.infoValue}>{formatPhoneBR(aluno.celular || "")}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Telefone</Text>
                    <Text style={styles.infoValue}>{aluno.telefone ? formatPhoneBR(aluno.telefone) : "Não informado"}</Text>
                </View>

                {/* Endereço */}
                <Text style={styles.sectionTitle}>Endereço</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Cidade/UF</Text>
                    <Text style={styles.infoValue}>{aluno.cidade} - {aluno.estado}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="map-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Bairro</Text>
                    <Text style={styles.infoValue}>{aluno.bairro}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="map-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Logradouro</Text>
                    <Text style={styles.infoValue}>{aluno.logradouro}, Nº {aluno.numero}</Text>
                </View>
                {aluno.complemento && (
                    <View style={styles.infoRow}>
                        <Ionicons name="information-circle-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                        <Text style={styles.infoLabel}>Complemento</Text>
                        <Text style={styles.infoValue}>{aluno.complemento}</Text>
                    </View>
                )}
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
    avatarImage: {
        width: "70%",
        height: "70%",
        resizeMode: "contain",
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
        width: 100,
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
