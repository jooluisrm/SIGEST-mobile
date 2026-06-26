import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, Pressable, ActivityIndicator, Modal, TextInput, Alert, ScrollView, Platform } from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { useAtividadesQuery, useCreateAtividadeMutation } from "@/api/atividade";
import { cadastroAtividadeSchema, CadastroAtividadeData } from "@/schema/cadastro-atividade";

export default function AtividadesScreen() {
    const { id } = useGlobalSearchParams<{ id: string }>();
    const router = useRouter();
    const ofertaId = Number(id);

    // States
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    // Fetch activities for this class
    const { data: activitiesResponse, isLoading: isLoadingActivities } = useAtividadesQuery(ofertaId);
    
    const activitiesRawList = useMemo(() => {
        if (!activitiesResponse?.data) return [];
        if (Array.isArray(activitiesResponse.data)) return activitiesResponse.data;
        if (typeof activitiesResponse.data === "object" && "data" in activitiesResponse.data && Array.isArray(activitiesResponse.data.data)) {
            return activitiesResponse.data.data;
        }
        return [];
    }, [activitiesResponse]);

    const isDataMismatched = useMemo(() => {
        if (activitiesRawList.length === 0) return false;
        return Number(activitiesRawList[0].oferta_disciplina_id) !== Number(ofertaId);
    }, [activitiesRawList, ofertaId]);

    const activitiesList = useMemo(() => {
        if (isDataMismatched) return [];
        return activitiesRawList;
    }, [activitiesRawList, isDataMismatched]);

    const isLoading = isLoadingActivities || isDataMismatched;

    // Create activity mutation
    const createAtividadeMutation = useCreateAtividadeMutation();

    // React Hook Form for Activity
    const { control, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<CadastroAtividadeData>({
        resolver: zodResolver(cadastroAtividadeSchema),
        defaultValues: {
            titulo: "",
            tipo: "Prova",
            data_inicio: new Date().toISOString().split("T")[0],
            data_fim: "",
            descricao: "",
        }
    });

    const dataInicioValue = watch("data_inicio");
    const dataFimValue = watch("data_fim");

    // Date Picker States
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const parseDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return new Date();
        try {
            const cleanDate = dateStr.split("T")[0].split(" ")[0];
            const parts = cleanDate.split("-");
            if (parts.length === 3) {
                return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
        } catch {}
        return new Date();
    };

    const formatDisplayDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return "";
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

    const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === "ios");
        if (selectedDate && event.type === "set") {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");
            setValue("data_inicio", `${year}-${month}-${day}`, { shouldValidate: true });
        }
    };

    const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === "ios");
        if (selectedDate && event.type === "set") {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
            const day = String(selectedDate.getDate()).padStart(2, "0");
            setValue("data_fim", `${year}-${month}-${day}`, { shouldValidate: true });
        }
    };

    // Handlers
    const handleCreateActivity = (data: CadastroAtividadeData) => {
        const payload = {
            oferta_disciplina_id: ofertaId,
            titulo: data.titulo,
            tipo: data.tipo,
            data_inicio: data.data_inicio,
            data_fim: data.data_fim || null,
            descricao: data.descricao || null,
        };

        createAtividadeMutation.mutate(payload, {
            onSuccess: () => {
                Alert.alert("Sucesso", "Atividade criada com sucesso!");
                setIsCreateModalVisible(false);
                reset();
            },
            onError: (err: any) => {
                console.error("[DEBUG] createAtividadeMutation onError object:", err);
                if (err.response) {
                    const errorData = err.response.data;
                    const errorMsg = errorData.message || errorData.mensagem || "Erro de validação.";
                    const details = errorData.errors ? Object.values(errorData.errors).flat().join("\n") : "";
                    Alert.alert("Erro de Validação", `${errorMsg}\n${details}`);
                } else {
                    Alert.alert("Erro", "Erro ao criar atividade.");
                }
            }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando atividades...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.titleText}>Atividades e Provas</Text>
                <Pressable
                    style={styles.addButton}
                    onPress={() => {
                        reset({
                            titulo: "",
                            tipo: "Prova",
                            data_inicio: new Date().toISOString().split("T")[0],
                            data_fim: "",
                            descricao: "",
                        });
                        setIsCreateModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </Pressable>
            </View>

            <FlatList
                data={activitiesList}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            styles.activityCard,
                            pressed && styles.cardPressed
                        ]}
                        onPress={() => router.push({
                            pathname: "/(private)/turma/[id]/atividade/[atividadeId]" as any,
                            params: { id: String(ofertaId), atividadeId: String(item.id) }
                        })}
                    >
                        <View style={styles.cardInfo}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>{item.tipo}</Text>
                            </View>
                            <Text style={styles.cardTitle}>{item.titulo}</Text>
                            <Text style={styles.cardDates}>
                                Período: {formatDisplayDate(item.data_inicio)}{item.data_fim ? ` até ${formatDisplayDate(item.data_fim)}` : ""}
                            </Text>
                            {item.descricao && (
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    {item.descricao}
                                </Text>
                            )}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#52B28B" />
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={56} color="#9ca3af" />
                        <Text style={styles.emptyText}>Nenhuma atividade cadastrada.</Text>
                    </View>
                }
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal: Create Activity */}
            <Modal visible={isCreateModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Criar Nova Atividade</Text>
                            <Pressable onPress={() => setIsCreateModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1f2937" />
                            </Pressable>
                        </View>

                        <ScrollView 
                            contentContainerStyle={styles.modalForm}
                            automaticallyAdjustKeyboardInsets={true}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.fieldLabel}>Título</Text>
                            <Controller
                                control={control}
                                name="titulo"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={[styles.input, errors.titulo && styles.inputError]}
                                        placeholder="Ex: Prova Bimestral 1"
                                        placeholderTextColor="#9ca3af"
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {errors.titulo && <Text style={styles.errorLabel}>{errors.titulo.message}</Text>}

                            <Text style={styles.fieldLabel}>Tipo de Avaliação</Text>
                            <Controller
                                control={control}
                                name="tipo"
                                render={({ field: { onChange, value } }) => (
                                    <View style={styles.typesContainer}>
                                        {["Prova", "Trabalho", "Seminário", "Exercício", "Outro"].map((t) => {
                                            const isSelected = value === t;
                                            return (
                                                <Pressable
                                                    key={t}
                                                    style={[
                                                        styles.typeOptionBtn,
                                                        isSelected && styles.typeOptionBtnSelected
                                                    ]}
                                                    onPress={() => onChange(t)}
                                                >
                                                    <Text style={[
                                                        styles.typeOptionText,
                                                        isSelected && styles.typeOptionTextSelected
                                                    ]}>
                                                        {t}
                                                    </Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            />
                            {errors.tipo && <Text style={styles.errorLabel}>{errors.tipo.message}</Text>}

                            {/* Date Row */}
                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.fieldLabel}>Data de Início</Text>
                                    <Controller
                                        control={control}
                                        name="data_inicio"
                                        render={({ field: { value } }) => (
                                            <Pressable
                                                onPress={() => setShowStartPicker(true)}
                                                style={[styles.input, styles.dateInputPressable, errors.data_inicio && styles.inputError]}
                                            >
                                                <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
                                                    {value ? formatDisplayDate(value) : "Selecionar data"}
                                                </Text>
                                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                            </Pressable>
                                        )}
                                    />
                                    {errors.data_inicio && <Text style={styles.errorLabel}>{errors.data_inicio.message}</Text>}
                                    {showStartPicker && (
                                        <DateTimePicker
                                            value={parseDate(dataInicioValue)}
                                            mode="date"
                                            display="default"
                                            onChange={handleStartDateChange}
                                        />
                                    )}
                                </View>

                                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.fieldLabel}>Data Final (Opcional)</Text>
                                    <Controller
                                        control={control}
                                        name="data_fim"
                                        render={({ field: { value } }) => (
                                            <View style={styles.dateInputWrapper}>
                                                <Pressable
                                                    onPress={() => setShowEndPicker(true)}
                                                    style={[styles.input, styles.dateInputPressable, errors.data_fim && styles.inputError]}
                                                >
                                                    <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
                                                        {value ? formatDisplayDate(value) : "Selecionar data"}
                                                    </Text>
                                                    {value ? (
                                                        <Pressable
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                setValue("data_fim", "");
                                                            }}
                                                            style={styles.clearDateBtn}
                                                        >
                                                            <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                                        </Pressable>
                                                    ) : (
                                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                                    )}
                                                </Pressable>
                                            </View>
                                        )}
                                    />
                                    {errors.data_fim && <Text style={styles.errorLabel}>{errors.data_fim.message}</Text>}
                                    {showEndPicker && (
                                        <DateTimePicker
                                            value={parseDate(dataFimValue)}
                                            mode="date"
                                            display="default"
                                            onChange={handleEndDateChange}
                                        />
                                    )}
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>Descrição / Conteúdo</Text>
                            <Controller
                                control={control}
                                name="descricao"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        style={[styles.input, styles.textArea, errors.descricao && styles.inputError]}
                                        placeholder="Ex: Conteúdo referente aos capítulos 1 a 3 do livro."
                                        placeholderTextColor="#9ca3af"
                                        onChangeText={onChange}
                                        value={value || ""}
                                        multiline
                                        numberOfLines={4}
                                    />
                                )}
                            />
                            {errors.descricao && <Text style={styles.errorLabel}>{errors.descricao.message}</Text>}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Pressable style={styles.footerCancelBtn} onPress={() => setIsCreateModalVisible(false)}>
                                <Text style={styles.footerCancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={styles.footerSaveBtn}
                                onPress={handleSubmit(handleCreateActivity)}
                                disabled={createAtividadeMutation.isPending}
                            >
                                {createAtividadeMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.footerSaveBtnText}>Salvar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f9fafb",
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
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    titleText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#52B28B",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 4,
    },
    addButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 14,
    },
    activityCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.8,
        backgroundColor: "#f9fafb",
    },
    cardInfo: {
        flex: 1,
        marginRight: 12,
    },
    typeBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#def7ec",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#1D8C43",
        textTransform: "uppercase",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 4,
    },
    cardDates: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: "#9ca3af",
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        height: "85%",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 16,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
    },
    modalForm: {
        padding: 20,
        gap: 14,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: "#1f2937",
    },
    inputError: {
        borderColor: "#dc2626",
        backgroundColor: "#fef2f2",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    errorLabel: {
        fontSize: 12,
        color: "#dc2626",
        fontWeight: "500",
        marginTop: -6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    formGroup: {
        marginBottom: 14,
    },
    typesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 6,
    },
    typeOptionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    typeOptionBtnSelected: {
        backgroundColor: "#def7ec",
        borderColor: "#52B28B",
    },
    typeOptionText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4b5563",
    },
    typeOptionTextSelected: {
        color: "#1D8C43",
    },
    dateInputPressable: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
    },
    dateInputText: {
        fontSize: 15,
        color: "#1f2937",
    },
    dateInputWrapper: {
        position: "relative",
        width: "100%",
    },
    clearDateBtn: {
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        gap: 12,
    },
    footerCancelBtn: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    footerCancelBtnText: {
        color: "#4b5563",
        fontWeight: "600",
        fontSize: 15,
    },
    footerSaveBtn: {
        flex: 1,
        backgroundColor: "#52B28B",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    footerSaveBtnText: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 15,
    },
});
