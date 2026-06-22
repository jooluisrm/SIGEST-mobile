import React, { useState, useEffect, useMemo } from "react";
import { 
    StyleSheet, 
    View, 
    FlatList, 
    Text, 
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    Pressable,
    ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { SearchAddHeader } from "@/components/gerenciar/search-add-header";
import { TurmaCard } from "@/components/gerenciar/turma/turma-card";
import { Ionicons } from "@expo/vector-icons";
import { useClassroomsInfiniteQuery, useGenerateClassroomsMutation } from "@/api/turma";
import { usePeriodsInfiniteQuery } from "@/api/periodo";

export default function GerenciarTurmas() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // State for Automatic Generation Modal (Enturmação)
    const [generateModalVisible, setGenerateModalVisible] = useState(false);
    const [selectedSerieId, setSelectedSerieId] = useState<number | null>(null);
    const [selectedSerieName, setSelectedSerieName] = useState("");
    const [maxStudents, setMaxStudents] = useState("30");
    const [selectedShift, setSelectedShift] = useState("Matutino");
    const [seriePickerVisible, setSeriePickerVisible] = useState(false);

    // Debounce search text
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchText]);

    // Queries & Mutations
    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        refetch
    } = useClassroomsInfiniteQuery(debouncedSearchText);

    const { data: periodsResponse } = usePeriodsInfiniteQuery();
    const periods = periodsResponse?.pages.flatMap((page) => page.data || []) || [];

    const generateMutation = useGenerateClassroomsMutation();

    // Map serie_id to Serie Name
    const serieMap = useMemo(() => {
        const map = new Map<number, string>();
        periods.forEach((p) => map.set(p.id, p.name));
        return map;
    }, [periods]);

    // Flatten classrooms list safely handling the pagination envelope
    const classrooms = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            
            // Caso o backend retorne um array plano direto na propriedade 'data'
            if (Array.isArray(page.data)) {
                return page.data;
            }
            
            // Caso o backend retorne o envelope de paginação padrão
            if (typeof page.data === "object" && "data" in page.data && Array.isArray(page.data.data)) {
                return page.data.data;
            }
            
            return [];
        });
    }, [data]);

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar turmas:", error);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível buscar a lista de turmas. Verifique a conexão com o servidor."
            );
        }
    }, [error]);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleAddPress = () => {
        router.push("/gerenciar/turma/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/turma/${id}` as any);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Execute the auto classroom generation
    const handleConfirmGenerate = () => {
        if (!selectedSerieId) {
            Alert.alert("Campo Obrigatório", "Selecione uma série escolar.");
            return;
        }

        const maxNum = Number(maxStudents);
        if (isNaN(maxNum) || maxNum < 5 || maxNum > 60) {
            Alert.alert("Limite de alunos inválido", "A capacidade por turma deve ser entre 5 e 60 alunos.");
            return;
        }

        generateMutation.mutate({
            serieId: selectedSerieId,
            maxStudents: maxNum,
            shift: selectedShift
        }, {
            onSuccess: (res) => {
                Alert.alert(
                    "Sucesso", 
                    res.message || "Turmas geradas e alunos distribuídos com sucesso!"
                );
                setGenerateModalVisible(false);
                setSelectedSerieId(null);
                setSelectedSerieName("");
                setMaxStudents("30");
                setSelectedShift("Matutino");
                refetch();
            },
            onError: (err: any) => {
                console.error("Erro ao gerar turmas:", err);
                const backendMsg = err?.response?.data?.message || err?.message || "Erro desconhecido";
                Alert.alert(
                    "Erro de Geração",
                    `Não foi possível gerar as turmas: ${backendMsg}`
                );
            }
        });
    };

    return (
        <View style={styles.container}>
            {/* Header com busca e botão de adicionar */}
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar turma por nome"
                onAddPress={handleAddPress}
            />

            {/* Quick Action Button for Enturmação Automática */}
            <Pressable 
                style={({ pressed }) => [
                    styles.autoGenerateBtn,
                    pressed && styles.autoGenerateBtnPressed
                ]}
                onPress={() => setGenerateModalVisible(true)}
            >
                <Ionicons name="flash-outline" size={18} color="#1D8C43" style={styles.autoGenerateIcon} />
                <Text style={styles.autoGenerateText}>Enturmação Automática</Text>
            </Pressable>

            {/* Helper search warning */}
            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
                <Text style={styles.searchHelperText}>
                    Digite pelo menos 3 caracteres para buscar.
                </Text>
            )}

            {isLoading && classrooms.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando turmas...</Text>
                </View>
            ) : (
                <FlatList
                    data={classrooms}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <TurmaCard
                            name={item.name}
                            periodName={serieMap.get(item.serie_id) || `Série ID: ${item.serie_id}`}
                            maxStudents={item.max_students}
                            shift={item.shift}
                            status={item.status}
                            onPress={() => handleCardPress(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View style={styles.footerLoading}>
                                <ActivityIndicator size="small" color="#52B28B" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color="#9ca3af" />
                            <Text style={styles.emptyText}>Nenhuma turma encontrada</Text>
                        </View>
                    }
                />
            )}

            {/* Automatic Generation Config Modal */}
            <Modal
                visible={generateModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setGenerateModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="flash-outline" size={24} color="#1D8C43" />
                            <Text style={styles.modalTitle}>Enturmação Automática</Text>
                        </View>
                        
                        <Text style={styles.modalDescription}>
                            Cria turmas dinâmicas de forma incremental para alunos da série selecionada que estão atualmente sem turma vinculada.
                        </Text>

                        {/* Campo: Selecionar Série */}
                        <View style={styles.modalInputWrapper}>
                            <Text style={styles.modalLabel}>Série Escolar *</Text>
                            <Pressable 
                                style={styles.modalSelectInput}
                                onPress={() => setSeriePickerVisible(true)}
                            >
                                <Text style={[styles.modalSelectText, !selectedSerieName && styles.placeholderText]}>
                                    {selectedSerieName || "Selecione a série"}
                                </Text>
                                <Ionicons name="chevron-down" size={18} color="#6b7280" />
                            </Pressable>
                        </View>

                        {/* Campo: Máximo de Alunos */}
                        <View style={styles.modalInputWrapper}>
                            <Text style={styles.modalLabel}>Capacidade Máxima por Turma *</Text>
                            <TextInput 
                                style={styles.modalTextInput}
                                value={maxStudents}
                                onChangeText={(val) => setMaxStudents(val.replace(/[^0-9]/g, ""))}
                                placeholder="Ex: 30"
                                keyboardType="numeric"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        {/* Campo: Turno */}
                        <View style={styles.modalInputWrapper}>
                            <Text style={styles.modalLabel}>Turno das Turmas *</Text>
                            <View style={styles.modalShiftSelector}>
                                {["Matutino", "Vespertino", "Noturno"].map((s) => {
                                    const isSelected = selectedShift === s;
                                    return (
                                        <Pressable
                                            key={s}
                                            style={[styles.modalShiftOption, isSelected && styles.modalShiftOptionSelected]}
                                            onPress={() => setSelectedShift(s)}
                                        >
                                            <Text style={[styles.modalShiftText, isSelected && styles.modalShiftTextSelected]}>
                                                {s}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Modal Action Buttons */}
                        <View style={styles.modalFooter}>
                            <Pressable 
                                style={styles.modalCancelBtn}
                                onPress={() => setGenerateModalVisible(false)}
                                disabled={generateMutation.isPending}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </Pressable>
                            
                            <Pressable 
                                style={[styles.modalConfirmBtn, generateMutation.isPending && styles.modalConfirmBtnDisabled]}
                                onPress={handleConfirmGenerate}
                                disabled={generateMutation.isPending}
                            >
                                {generateMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Confirmar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Inner Series Picker Modal */}
                <Modal
                    visible={seriePickerVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSeriePickerVisible(false)}
                >
                    <View style={styles.pickerBackdrop}>
                        <View style={styles.pickerModal}>
                            <Text style={styles.pickerTitle}>Selecione a Série Alvo</Text>
                            <ScrollView style={styles.pickerScroll}>
                                {periods.map((p) => (
                                    <Pressable
                                        key={p.id}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            setSelectedSerieId(p.id);
                                            setSelectedSerieName(p.name);
                                            setSeriePickerVisible(false);
                                        }}
                                    >
                                        <Text style={styles.pickerOptionText}>{p.name}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                            <Pressable 
                                style={styles.pickerCloseBtn}
                                onPress={() => setSeriePickerVisible(false)}
                            >
                                <Text style={styles.pickerCloseBtnText}>Fechar</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    autoGenerateBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e8f7f0",
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(29, 140, 67, 0.15)",
    },
    autoGenerateBtnPressed: {
        backgroundColor: "#d8f2e4",
    },
    autoGenerateIcon: {
        marginRight: 6,
    },
    autoGenerateText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1D8C43",
    },
    listContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
    },
    searchHelperText: {
        fontSize: 12,
        color: "#6b7280",
        fontStyle: "italic",
        marginBottom: 8,
        marginLeft: 4,
    },
    footerLoading: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    // Modal styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        gap: 16,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
    },
    modalDescription: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 20,
        marginBottom: 4,
    },
    modalInputWrapper: {
        width: "100%",
        gap: 6,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4b5563",
    },
    modalSelectInput: {
        height: 46,
        backgroundColor: "#f9fafb",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalSelectText: {
        fontSize: 15,
        color: "#1f2937",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    modalTextInput: {
        height: 46,
        backgroundColor: "#f9fafb",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#1f2937",
    },
    modalShiftSelector: {
        flexDirection: "row",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
        height: 44,
    },
    modalShiftOption: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
    },
    modalShiftOptionSelected: {
        backgroundColor: "#52B28B",
    },
    modalShiftText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4b5563",
    },
    modalShiftTextSelected: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        marginTop: 8,
    },
    modalCancelBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#d1d5db",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    modalConfirmBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        backgroundColor: "#1D8C43",
        alignItems: "center",
        justifyContent: "center",
    },
    modalConfirmBtnDisabled: {
        backgroundColor: "#a7f3d0",
    },
    modalConfirmText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
    },
    // Picker styles
    pickerBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    pickerModal: {
        width: "100%",
        maxHeight: "50%",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    pickerTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
        textAlign: "center",
    },
    pickerScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    pickerOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        alignItems: "center",
    },
    pickerOptionText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "500",
    },
    pickerCloseBtn: {
        height: 40,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    pickerCloseBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4b5563",
    },
});
