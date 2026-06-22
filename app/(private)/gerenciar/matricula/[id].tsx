import React, { useEffect, useState, useMemo } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    ScrollView, 
    Pressable, 
    Alert, 
    ActivityIndicator,
    Modal,
    FlatList,
    TextInput
} from "react-native";
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMatriculaQuery, useDeleteMatriculaMutation } from "@/api/matricula";
import { useAlunoQuery } from "@/api/aluno";
import { usePeriodQuery } from "@/api/periodo";
import { 
    useMatriculaDisciplinasByMatriculaQuery, 
    useCreateMatriculaDisciplinaMutation, 
    useDeleteMatriculaDisciplinaMutation 
} from "@/api/matriculadisciplina";
import { useOfertaDisciplinasInfiniteQuery } from "@/api/ofertadisciplina";
import axios from "axios";

export default function DetalheMatricula() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id: string }>();

    // States for Linking/Modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // Debounce search text inside modal
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchText]);

    // Queries
    const { data: matriculaResponse, isLoading: isLoadingMatricula, error: errorMatricula } = useMatriculaQuery(id);
    const { mutateAsync: deleteMatricula, isPending: isDeleting } = useDeleteMatriculaMutation();

    const matricula = matriculaResponse?.data;

    // Resolve nested entities on client side
    const { data: alunoResponse, isLoading: isLoadingAluno } = useAlunoQuery(matricula?.aluno_id || "");
    const { data: periodResponse, isLoading: isLoadingPeriod } = usePeriodQuery(matricula?.serie_id || "");

    const studentName = alunoResponse?.data?.name || "Carregando aluno...";
    const serieName = periodResponse?.data?.name || "Carregando série...";

    // Matricula-Disciplina list
    const { 
        data: mdResponse, 
        isLoading: isLoadingMD, 
        refetch: refetchMD 
    } = useMatriculaDisciplinasByMatriculaQuery(id);

    const linkedDisciplines = useMemo(() => {
        if (!mdResponse) return [];
        // Handle pagination envelope or raw array
        if (Array.isArray(mdResponse)) return mdResponse;
        if ("data" in mdResponse) {
            if (Array.isArray(mdResponse.data)) return mdResponse.data;
            if (typeof mdResponse.data === "object" && mdResponse.data !== null && "data" in mdResponse.data && Array.isArray((mdResponse.data as any).data)) {
                return (mdResponse.data as any).data;
            }
        }
        return [];
    }, [mdResponse]);

    // Available offerings infinite query
    const { 
        data: offeringsData, 
        fetchNextPage: fetchNextOfferings, 
        hasNextPage: hasNextOfferings, 
        isFetchingNextPage: isFetchingNextOfferings 
    } = useOfertaDisciplinasInfiniteQuery();

    const offerings = useMemo(() => {
        if (!offeringsData?.pages) return [];
        return offeringsData.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            return page.data;
        });
    }, [offeringsData]);

    // Client-side filtering of offerings inside modal (by discipline or teacher)
    const filteredOfferings = useMemo(() => {
        const query = debouncedSearchText.trim().toLowerCase();
        if (!query) return offerings;
        return offerings.filter(o => 
            (o.disciplina?.name || "").toLowerCase().includes(query) ||
            (o.professor?.name || "").toLowerCase().includes(query) ||
            (o.classroom?.name || "").toLowerCase().includes(query)
        );
    }, [offerings, debouncedSearchText]);

    // Mutations for links
    const createLinkMutation = useCreateMatriculaDisciplinaMutation();
    const deleteLinkMutation = useDeleteMatriculaDisciplinaMutation();

    useEffect(() => {
        navigation.setOptions({
            title: "Detalhes da Matrícula"
        });
    }, [navigation]);

    useEffect(() => {
        if (errorMatricula) {
            console.error("Erro ao buscar detalhes da matrícula:", errorMatricula);
            let errorMsg = "Não foi possível carregar os detalhes da matrícula.";
            if (axios.isAxiosError(errorMatricula) && errorMatricula.response?.status === 404) {
                errorMsg = "Matrícula não encontrada ou já foi excluída.";
            }
            Alert.alert("Erro", errorMsg, [
                { text: "Voltar", onPress: () => router.back() }
            ]);
        }
    }, [errorMatricula]);

    const handleEdit = () => {
        if (!matricula) return;
        router.push(`/gerenciar/matricula/cadastro?id=${matricula.id}` as any);
    };

    const handleDeleteMatricula = () => {
        if (!matricula) return;
        Alert.alert(
            "Confirmar Exclusão",
            `Atenção: Tem certeza de que deseja excluir permanentemente esta matrícula? Todas as enturmações deste aluno serão excluídas.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteMatricula(matricula.id);
                            Alert.alert("Sucesso", "Matrícula excluída com sucesso!");
                            router.replace("/gerenciar/matricula" as any);
                        } catch (err) {
                            console.error("Erro ao excluir matrícula:", err);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir a matrícula.");
                        }
                    }
                }
            ]
        );
    };

    const handleAddDiscipline = async (ofertaId: number) => {
        if (!id) return;
        createLinkMutation.mutate({
            matricula_id: Number(id),
            oferta_disciplina_id: ofertaId
        }, {
            onSuccess: () => {
                Alert.alert("Sucesso", "Aluno enturmado na disciplina com sucesso!");
                setAddModalVisible(false);
                setSearchText("");
                refetchMD();
            },
            onError: (err: any) => {
                console.error("Erro ao enturmar aluno:", err);
                const msg = err?.response?.data?.message || err?.message || "Erro ao criar vínculo.";
                Alert.alert("Erro", msg);
            }
        });
    };

    const handleRemoveDiscipline = (mdId: number, name: string) => {
        Alert.alert(
            "Confirmar Desenturmação",
            `Deseja desvincular o aluno da disciplina "${name}"? Notas e frequências associadas poderão ser afetadas.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: () => {
                        deleteLinkMutation.mutate(mdId, {
                            onSuccess: () => {
                                Alert.alert("Sucesso", "Disciplina desvinculada com sucesso!");
                                refetchMD();
                            },
                            onError: (err) => {
                                console.error("Erro ao desvincular:", err);
                                Alert.alert("Erro", "Não foi possível desvincular a disciplina.");
                            }
                        });
                    }
                }
            ]
        );
    };

    if (isLoadingMatricula || isDeleting) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando informações...</Text>
            </View>
        );
    }

    if (!matricula) {
        return null;
    }

    const isAtiva = matricula.status === true || matricula.status === 1;

    // Date display helpers
    const brMatriculaDate = matricula.data_matricula ? matricula.data_matricula.split("-").reverse().join("/") : "";
    const brCancelDate = matricula.data_cancelamento ? matricula.data_cancelamento.split("-").reverse().join("/") : "N/A";

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.banner} />

            <View style={styles.profileHeaderContainer}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="clipboard" size={40} color="#52B28B" />
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
                        onPress={handleDeleteMatricula}
                    >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                    </Pressable>
                </View>

                <View style={styles.identityContainer}>
                    <Text style={styles.nameText}>{studentName}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="key-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>Matrícula: {matricula.codigo_matricula}</Text>
                    </View>
                </View>
            </View>

            {/* General Info */}
            <View style={styles.infoWrapper}>
                <Text style={styles.sectionTitle}>Dados da Matrícula</Text>

                <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Série Escolar</Text>
                    <Text style={styles.infoValue}>{serieName}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Data Matrícula</Text>
                    <Text style={styles.infoValue}>{brMatriculaDate}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Cancelamento</Text>
                    <Text style={styles.infoValue}>{brCancelDate}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="toggle-outline" size={18} color="#6b7280" style={styles.infoIcon} />
                    <Text style={styles.infoLabel}>Situação</Text>
                    <Text style={[styles.infoValue, { color: isAtiva ? "#52B28B" : "#dc2626", fontWeight: "bold" }]}>
                        {isAtiva ? "Ativa" : "Inativa"}
                    </Text>
                </View>
            </View>

            {/* Enturmação section (Linked disciplines list) */}
            <View style={styles.linkedWrapper}>
                <View style={styles.linkedHeader}>
                    <Text style={styles.linkedTitle}>Disciplinas Vinculadas (Enturmação)</Text>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.addButton,
                            pressed && styles.addButtonPressed
                        ]}
                        onPress={() => setAddModalVisible(true)}
                    >
                        <Ionicons name="add" size={16} color="#ffffff" />
                        <Text style={styles.addButtonText}>Vincular</Text>
                    </Pressable>
                </View>

                {isLoadingMD ? (
                    <ActivityIndicator size="small" color="#52B28B" style={{ marginVertical: 20 }} />
                ) : linkedDisciplines.length === 0 ? (
                    <View style={styles.emptyMD}>
                        <Ionicons name="book-outline" size={32} color="#9ca3af" />
                        <Text style={styles.emptyMDText}>Nenhuma disciplina vinculada ainda.</Text>
                    </View>
                ) : (
                    linkedDisciplines.map((md: any) => {
                        const offering = md.oferta_disciplina;
                        const discName = offering?.disciplina?.name || "Sem Nome";
                        const profName = offering?.professor?.name || "Sem Professor";
                        const roomName = offering?.classroom?.name || "Sem Turma";
                        return (
                            <View key={md.id} style={styles.mdRow}>
                                <View style={styles.mdInfo}>
                                    <Text style={styles.mdName}>{discName}</Text>
                                    <Text style={styles.mdSubtitle}>{roomName} | Prof: {profName}</Text>
                                </View>
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.trashBtn,
                                        pressed && styles.trashBtnPressed
                                    ]}
                                    onPress={() => handleRemoveDiscipline(md.id, discName)}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#dc2626" />
                                </Pressable>
                            </View>
                        );
                    })
                )}
            </View>

            <View style={styles.spacer} />

            {/* Link Offering Modal */}
            <Modal
                visible={addModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Vincular Oferta de Disciplina</Text>
                        
                        <View style={styles.searchBarWrapper}>
                            <Ionicons name="search" size={18} color="#9ca3af" />
                            <TextInput
                                style={styles.searchBarInput}
                                placeholder="Filtrar por disciplina, professor ou turma..."
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <FlatList
                            data={filteredOfferings}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.offeringItem,
                                        pressed && styles.offeringItemPressed
                                    ]}
                                    onPress={() => handleAddDiscipline(item.id)}
                                >
                                    <View style={styles.offeringDetails}>
                                        <Text style={styles.offeringName}>{item.disciplina?.name}</Text>
                                        <Text style={styles.offeringSub}>Turma: {item.classroom?.name} | Prof: {item.professor?.name}</Text>
                                    </View>
                                    <Ionicons name="link-outline" size={18} color="#52B28B" />
                                </Pressable>
                            )}
                            style={styles.modalScroll}
                            onEndReached={() => {
                                if (hasNextOfferings && !isFetchingNextOfferings) {
                                    fetchNextOfferings();
                                }
                            }}
                            onEndReachedThreshold={0.2}
                            ListFooterComponent={
                                isFetchingNextOfferings ? (
                                    <ActivityIndicator size="small" color="#52B28B" style={{ marginVertical: 10 }} />
                                ) : null
                            }
                            ListEmptyComponent={
                                <Text style={styles.pickerEmptyText}>Nenhuma oferta encontrada.</Text>
                            }
                        />

                        <Pressable 
                            style={styles.modalCloseBtn}
                            onPress={() => setAddModalVisible(false)}
                        >
                            <Text style={styles.modalCloseBtnText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
    // Enturmação Styles
    linkedWrapper: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    linkedHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    linkedTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
    },
    addButton: {
        backgroundColor: "#1D8C43",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
    },
    addButtonPressed: {
        backgroundColor: "#15632f",
    },
    addButtonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 12,
    },
    emptyMD: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        paddingVertical: 30,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderStyle: "dashed",
        gap: 8,
    },
    emptyMDText: {
        color: "#9ca3af",
        fontSize: 14,
        fontWeight: "500",
    },
    mdRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#f9fafb",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    mdInfo: {
        flex: 1,
        paddingRight: 10,
    },
    mdName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1f2937",
    },
    mdSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    trashBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fee2e2",
    },
    trashBtnPressed: {
        backgroundColor: "#fec2c2",
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: "80%",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 16,
        textAlign: "center",
    },
    searchBarWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 16,
        gap: 8,
    },
    searchBarInput: {
        flex: 1,
        fontSize: 14,
        color: "#1f2937",
    },
    modalScroll: {
        flex: 1,
        marginBottom: 16,
    },
    offeringItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    offeringItemPressed: {
        backgroundColor: "#f9fafb",
    },
    offeringDetails: {
        flex: 1,
        paddingRight: 10,
    },
    offeringName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1f2937",
    },
    offeringSub: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    pickerEmptyText: {
        textAlign: "center",
        color: "#9ca3af",
        paddingVertical: 40,
    },
    modalCloseBtn: {
        height: 46,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCloseBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    spacer: {
        height: 40,
    },
});
