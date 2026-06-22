import React, { useState, useEffect, useMemo } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    Pressable, 
    ActivityIndicator, 
    Alert, 
    Modal, 
    TextInput,
    Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useOfertaDisciplinasInfiniteQuery } from "@/api/ofertadisciplina";
import { useAtividadesQuery, useDeleteAtividadeMutation } from "@/api/atividade";
import { RestrictedAccess } from "@/components/restricted-access";
import { OfertaDisciplina } from "@/types/ofertadisciplina";
import { Atividade } from "@/types/atividade";

const { height } = Dimensions.get("window");

export default function AvaliacaoScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Check RBAC
    const hasAccess = useMemo(() => {
        if (!user || !user.role) return false;
        return user.role.includes("admin") || user.role.includes("professor");
    }, [user]);

    // Local states
    const [selectedOferta, setSelectedOferta] = useState<OfertaDisciplina | null>(null);
    const [isOfertaModalVisible, setIsOfertaModalVisible] = useState(false);
    const [offeringSearch, setOfferingSearch] = useState("");
    const [debouncedOfferingSearch, setDebouncedOfferingSearch] = useState("");

    // Debounce search in offering picker
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedOfferingSearch(offeringSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [offeringSearch]);

    // Fetch offerings for selection modal
    const {
        data: offeringsData,
        fetchNextPage: fetchNextOfferings,
        hasNextPage: hasNextOfferings,
        isFetchingNextPage: isFetchingNextOfferings,
        isLoading: isLoadingOfferings
    } = useOfertaDisciplinasInfiniteQuery();

    const offerings = useMemo(() => {
        if (!offeringsData?.pages) return [];
        return offeringsData.pages.flatMap((page) => page.data || []);
    }, [offeringsData]);

    const filteredOfferings = useMemo(() => {
        const query = debouncedOfferingSearch.trim().toLowerCase();
        if (!query) return offerings;
        return offerings.filter(o => 
            (o.disciplina?.name || "").toLowerCase().includes(query) ||
            (o.classroom?.name || "").toLowerCase().includes(query) ||
            (o.professor?.name || "").toLowerCase().includes(query)
        );
    }, [offerings, debouncedOfferingSearch]);

    // Fetch activities for selected offering
    const {
        data: activitiesData,
        isLoading: isLoadingActivities,
        refetch: refetchActivities
    } = useAtividadesQuery(selectedOferta?.id || 0);

    const activities = useMemo(() => {
        if (!activitiesData?.data) return [];
        if (Array.isArray(activitiesData.data)) return activitiesData.data;
        if (typeof activitiesData.data === "object" && "data" in activitiesData.data && Array.isArray(activitiesData.data.data)) {
            return activitiesData.data.data;
        }
        return [];
    }, [activitiesData]);

    // Invalidate/refetch when focusing screen
    useEffect(() => {
        if (selectedOferta?.id) {
            refetchActivities();
        }
    }, [selectedOferta]);

    // Delete Mutation
    const deleteMutation = useDeleteAtividadeMutation();

    const handleDeleteActivity = (id: number) => {
        Alert.alert(
            "Excluir Avaliação",
            "Deseja realmente excluir esta avaliação? Todas as notas associadas aos alunos nesta avaliação serão excluídas permanentemente.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive", 
                    onPress: () => {
                        deleteMutation.mutate(id, {
                            onSuccess: () => {
                                Alert.alert("Sucesso", "Avaliação excluída com sucesso.");
                                queryClient.invalidateQueries({ queryKey: ["atividades", "oferta", selectedOferta?.id] });
                            },
                            onError: (err) => {
                                console.error(err);
                                Alert.alert("Erro", "Não foi possível excluir a avaliação.");
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleLoadMoreOfferings = () => {
        if (hasNextOfferings && !isFetchingNextOfferings) {
            fetchNextOfferings();
        }
    };

    const formatDisplayDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "-";
        try {
            const cleanDate = dateStr.split("T")[0].split(" ")[0];
            const parts = cleanDate.split("-");
            if (parts.length !== 3) return dateStr;
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        } catch {
            return dateStr;
        }
    };

    // Render restricted access if no permissions
    if (!hasAccess) {
        return <RestrictedAccess />;
    }

    return (
        <View style={styles.container}>
            {/* Class Selection header */}
            <View style={styles.headerCard}>
                <Pressable onPress={() => setIsOfertaModalVisible(true)} style={styles.selectClassBtn}>
                    <View style={styles.classIconBg}>
                        <Ionicons name="school" size={24} color="#1D8C43" />
                    </View>
                    <View style={styles.selectClassBtnTextContainer}>
                        <Text style={styles.selectClassBtnTitle}>
                            {selectedOferta ? `${selectedOferta.disciplina?.name || "Sem Nome"}` : "Selecionar Turma & Disciplina"}
                        </Text>
                        <Text style={styles.selectClassBtnSub}>
                            {selectedOferta 
                                ? `Turma: ${selectedOferta.classroom?.name || "Sem Turma"}` 
                                : "Toque aqui para escolher a disciplina"
                            }
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                </Pressable>
            </View>

            {/* Activities List */}
            {selectedOferta ? (
                isLoadingActivities && activities.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#52B28B" />
                        <Text style={styles.loadingText}>Carregando avaliações...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={activities}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <View style={styles.activityCard}>
                                <View style={styles.activityHeader}>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeBadgeText}>{item.tipo}</Text>
                                    </View>
                                    <View style={styles.headerActions}>
                                        <Pressable 
                                            style={styles.actionBtn}
                                            onPress={() => router.push({
                                                pathname: "/(private)/gerenciar/avaliacao/cadastro",
                                                params: { id: item.id, ofertaId: selectedOferta.id }
                                            })}
                                        >
                                            <Ionicons name="create-outline" size={20} color="#4b5563" />
                                        </Pressable>
                                        <Pressable 
                                            style={styles.actionBtn}
                                            onPress={() => handleDeleteActivity(item.id)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#dc2626" />
                                        </Pressable>
                                    </View>
                                </View>

                                <Text style={styles.activityTitle}>{item.titulo}</Text>
                                
                                {item.descricao && (
                                    <Text style={styles.activityDesc} numberOfLines={2}>
                                        {item.descricao}
                                    </Text>
                                )}

                                <View style={styles.activityFooter}>
                                    <View style={styles.dateRow}>
                                        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                                        <Text style={styles.dateText}>
                                            Data: {formatDisplayDate(item.data_inicio)}
                                            {item.data_fim ? ` até ${formatDisplayDate(item.data_fim)}` : ""}
                                        </Text>
                                    </View>

                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.gradeLaunchBtn,
                                            pressed && styles.gradeLaunchBtnPressed
                                        ]}
                                        onPress={() => router.push(`/(private)/gerenciar/avaliacao/${item.id}` as any)}
                                    >
                                        <Ionicons name="create" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                                        <Text style={styles.gradeLaunchBtnText}>Notas</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={54} color="#d1d5db" />
                                <Text style={styles.emptyText}>Nenhuma avaliação cadastrada para esta disciplina.</Text>
                                <Pressable 
                                    style={styles.createFirstBtn}
                                    onPress={() => router.push({
                                        pathname: "/(private)/gerenciar/avaliacao/cadastro",
                                        params: { ofertaId: selectedOferta.id }
                                    })}
                                >
                                    <Text style={styles.createFirstBtnText}>Criar Primeira Avaliação</Text>
                                </Pressable>
                            </View>
                        }
                    />
                )
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="book-outline" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyStateTitle}>Avaliações & Notas</Text>
                    <Text style={styles.emptyStateDesc}>
                        Selecione uma disciplina no topo para gerenciar suas atividades, provas e realizar o lançamento de notas.
                    </Text>
                    <Pressable 
                        style={styles.emptyStateBtn} 
                        onPress={() => setIsOfertaModalVisible(true)}
                    >
                        <Text style={styles.emptyStateBtnText}>Selecionar Disciplina</Text>
                    </Pressable>
                </View>
            )}

            {/* Floating Action Button (FAB) to add evaluation */}
            {selectedOferta && (
                <Pressable
                    style={({ pressed }) => [
                        styles.fab,
                        pressed && styles.fabPressed
                    ]}
                    onPress={() => router.push({
                        pathname: "/(private)/gerenciar/avaliacao/cadastro",
                        params: { ofertaId: selectedOferta.id }
                    })}
                >
                    <Ionicons name="add" size={28} color="#ffffff" />
                </Pressable>
            )}

            {/* Modal: Select Oferta (Class Offering) */}
            <Modal
                visible={isOfertaModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsOfertaModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Disciplina</Text>
                            <Pressable 
                                onPress={() => setIsOfertaModalVisible(false)}
                                style={styles.closeModalBtn}
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </Pressable>
                        </View>

                        {/* Search Input */}
                        <View style={styles.modalSearchContainer}>
                            <Ionicons name="search-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Filtrar por disciplina, turma..."
                                value={offeringSearch}
                                onChangeText={setOfferingSearch}
                                placeholderTextColor="#9ca3af"
                                autoCapitalize="none"
                            />
                            {offeringSearch.length > 0 && (
                                <Pressable onPress={() => setOfferingSearch("")}>
                                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                </Pressable>
                            )}
                        </View>

                        {/* Offerings list */}
                        {isLoadingOfferings && offerings.length === 0 ? (
                            <View style={styles.modalCenterContainer}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.modalLoadingText}>Buscando disciplinas...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredOfferings}
                                keyExtractor={(item) => String(item.id)}
                                onEndReached={handleLoadMoreOfferings}
                                onEndReachedThreshold={0.2}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.offeringItem}
                                        onPress={() => {
                                            setSelectedOferta(item);
                                            setIsOfertaModalVisible(false);
                                        }}
                                    >
                                        <View style={styles.offeringDetails}>
                                            <Text style={styles.offeringTitle}>
                                                {item.disciplina?.name || `Disciplina ID: ${item.id}`}
                                            </Text>
                                            <View style={styles.offeringMetaRow}>
                                                <Ionicons name="school-outline" size={13} color="#6b7280" />
                                                <Text style={styles.offeringMetaText}>Turma: {item.classroom?.name || "Sem Turma"}</Text>
                                            </View>
                                            <View style={styles.offeringMetaRow}>
                                                <Ionicons name="person-outline" size={13} color="#6b7280" />
                                                <Text style={styles.offeringMetaText} numberOfLines={1}>
                                                    Prof: {item.professor?.name || "Sem Professor"}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                                    </Pressable>
                                )}
                                ListFooterComponent={
                                    isFetchingNextOfferings ? (
                                        <ActivityIndicator size="small" color="#52B28B" style={{ marginVertical: 10 }} />
                                    ) : null
                                }
                                ListEmptyComponent={
                                    <View style={styles.modalCenterContainer}>
                                        <Text style={styles.modalEmptyText}>Nenhuma disciplina encontrada.</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    headerCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    selectClassBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    classIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#e8f5ed",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    selectClassBtnTextContainer: {
        flex: 1,
    },
    selectClassBtnTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 2,
    },
    selectClassBtnSub: {
        fontSize: 13,
        color: "#6b7280",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },
    activityCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    typeBadge: {
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0369a1",
        textTransform: "uppercase",
    },
    headerActions: {
        flexDirection: "row",
        gap: 6,
    },
    actionBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 6,
    },
    activityDesc: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 18,
        marginBottom: 12,
    },
    activityFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        paddingTop: 12,
        marginTop: 4,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "500",
    },
    gradeLaunchBtn: {
        backgroundColor: "#52B28B",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
    },
    gradeLaunchBtnPressed: {
        backgroundColor: "#419572",
    },
    gradeLaunchBtnText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "700",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 20,
    },
    createFirstBtn: {
        backgroundColor: "#52B28B",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    createFirstBtnText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyStateBtn: {
        backgroundColor: "#52B28B",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    emptyStateBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#1D8C43", // Matching theme dark green
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    fabPressed: {
        backgroundColor: "#156731",
        transform: [{ scale: 0.95 }],
    },
    // Picker modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: height * 0.75,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
    },
    closeModalBtn: {
        padding: 4,
    },
    modalSearchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    modalSearchInput: {
        flex: 1,
        height: "100%",
        fontSize: 14,
        color: "#1f2937",
    },
    modalCenterContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    modalLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },
    modalEmptyText: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    offeringItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    offeringDetails: {
        flex: 1,
    },
    offeringTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4,
    },
    offeringMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
        gap: 6,
    },
    offeringMetaText: {
        fontSize: 12,
        color: "#6b7280",
    },
});
