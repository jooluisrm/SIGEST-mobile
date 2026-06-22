import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    Pressable, 
    ScrollView, 
    ActivityIndicator, 
    Platform, 
    KeyboardAvoidingView, 
    Switch, 
    Modal,
    FlatList
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Matricula } from "@/types/matricula";
import { useAlunosInfiniteQuery } from "@/api/aluno";
import { usePeriodsInfiniteQuery } from "@/api/periodo";
import { formatDateBR } from "@/utils/masks";
import { cadastroMatriculaSchema, CadastroMatriculaFormData } from "@/schema/cadastro-matricula";

type Props = {
    onSubmit: (dados: CadastroMatriculaFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: Matricula;
};

type ModalType = "aluno" | "serie" | null;

function formatDateISOToBR(dateStr: string | null): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export const MatriculaForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false, 
    errorMessages, 
    onClearError,
    initialData
}: Props) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [pickerSearch, setPickerSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const hasInitialized = useRef(false);

    // Display labels
    const [selectedAlunoName, setSelectedAlunoName] = useState("");
    const [selectedSerieName, setSelectedSerieName] = useState("");

    const { 
        control, 
        handleSubmit, 
        setValue, 
        watch,
        formState: { errors } 
    } = useForm<CadastroMatriculaFormData>({
        resolver: zodResolver(cadastroMatriculaSchema),
        defaultValues: {
            aluno_id: initialData?.aluno_id || 0,
            serie_id: initialData?.serie_id || 0,
            codigo_matricula: initialData?.codigo_matricula || "",
            data_matricula: initialData?.data_matricula ? formatDateISOToBR(initialData.data_matricula) : "",
            data_cancelamento: initialData?.data_cancelamento ? formatDateISOToBR(initialData.data_cancelamento) : null,
            status: initialData ? (initialData.status === true || initialData.status === 1) : true,
        }
    });

    const watchStatus = watch("status");
    const watchAlunoId = watch("aluno_id");
    const watchSerieId = watch("serie_id");

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(pickerSearch);
        }, 400);
        return () => clearTimeout(handler);
    }, [pickerSearch]);

    // Reset search when active modal changes
    useEffect(() => {
        setPickerSearch("");
        setDebouncedSearch("");
    }, [activeModal]);

    // Fetch lists
    const { 
        data: alunosData, 
        fetchNextPage: fetchNextAlunos, 
        hasNextPage: hasNextAlunos, 
        isFetchingNextPage: isFetchingNextAlunos,
        isLoading: isLoadingAlunos 
    } = useAlunosInfiniteQuery(activeModal === "aluno" ? debouncedSearch : "");

    const { 
        data: seriesData, 
        fetchNextPage: fetchNextSeries, 
        hasNextPage: hasNextSeries, 
        isFetchingNextPage: isFetchingNextSeries,
        isLoading: isLoadingSeries 
    } = usePeriodsInfiniteQuery();

    const alunos = useMemo(() => {
        if (!alunosData?.pages) return [];
        return alunosData.pages.flatMap((page) => page.data || []);
    }, [alunosData]);

    const series = useMemo(() => {
        if (!seriesData?.pages) return [];
        return seriesData.pages.flatMap((page) => page.data || []);
    }, [seriesData]);

    // Hydrate names on edit
    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setValue("aluno_id", initialData.aluno_id);
            setValue("serie_id", initialData.serie_id);
            setValue("codigo_matricula", initialData.codigo_matricula);
            setValue("data_matricula", formatDateISOToBR(initialData.data_matricula));
            setValue("data_cancelamento", initialData.data_cancelamento ? formatDateISOToBR(initialData.data_cancelamento) : null);
            setValue("status", initialData.status === true || initialData.status === 1);
            
            if (initialData.aluno) {
                setSelectedAlunoName(initialData.aluno.name);
            }
            hasInitialized.current = true;
        }
    }, [initialData, setValue]);

    // Update names display when query lists load
    useEffect(() => {
        if (watchAlunoId && alunos.length > 0 && !selectedAlunoName) {
            const match = alunos.find((a) => a.id === watchAlunoId);
            if (match) {
                setSelectedAlunoName(match.name);
            }
        }
    }, [watchAlunoId, alunos]);

    useEffect(() => {
        if (watchSerieId && series.length > 0) {
            const match = series.find((s) => s.id === watchSerieId);
            if (match) {
                setSelectedSerieName(match.name);
            }
        }
    }, [watchSerieId, series]);

    const getFieldError = (key: string): string | undefined => {
        if (errors[key as keyof CadastroMatriculaFormData]) {
            return errors[key as keyof CadastroMatriculaFormData]?.message;
        }
        if (errorMessages) {
            if (errorMessages[key]) return errorMessages[key][0];
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (errorMessages[snakeKey]) return errorMessages[snakeKey][0];
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CadastroMatriculaFormData, value: any) => {
        setValue(field, value);
        if (onClearError) {
            onClearError(String(field));
            const snakeKey = String(field).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (snakeKey !== String(field)) {
                onClearError(snakeKey);
            }
        }
    };

    const handleSelectOption = (type: ModalType, id: number, name: string) => {
        if (type === "aluno") {
            handleInputChange("aluno_id", id);
            setSelectedAlunoName(name);
        } else if (type === "serie") {
            handleInputChange("serie_id", id);
            setSelectedSerieName(name);
        }
        setActiveModal(null);
    };

    const onFormSubmit = (data: CadastroMatriculaFormData) => {
        onSubmit(data);
    };

    const modalConfig = activeModal === "aluno" ? {
        data: alunos,
        isLoading: isLoadingAlunos,
        isFetchingNext: isFetchingNextAlunos,
        hasNext: hasNextAlunos,
        fetchNext: fetchNextAlunos,
        placeholder: "Buscar aluno...",
        title: "Selecionar Aluno",
        keyExtractor: (item: any) => String(item.id),
        renderItem: ({ item }: { item: any }) => (
            <Pressable 
                style={styles.pickerOption}
                onPress={() => handleSelectOption("aluno", item.id, item.name)}
            >
                <Text style={styles.pickerOptionText}>{item.name}</Text>
                <Text style={styles.pickerOptionSubtitle}>CPF: {item.cpf}</Text>
            </Pressable>
        )
    } : activeModal === "serie" ? {
        data: series,
        isLoading: isLoadingSeries,
        isFetchingNext: isFetchingNextSeries,
        hasNext: hasNextSeries,
        fetchNext: fetchNextSeries,
        placeholder: "Buscar série...",
        title: "Selecionar Série",
        keyExtractor: (item: any) => String(item.id),
        renderItem: ({ item }: { item: any }) => (
            <Pressable 
                style={styles.pickerOption}
                onPress={() => handleSelectOption("serie", item.id, item.name)}
            >
                <Text style={styles.pickerOptionText}>{item.name}</Text>
            </Pressable>
        )
    } : null;

    const isEdit = !!initialData;

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <ScrollView 
                style={styles.formScroll} 
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        {isEdit ? "Editar Matrícula" : "Nova Matrícula"}
                    </Text>

                    {/* Selector: Aluno */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Aluno *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("aluno_id") && styles.selectInputError,
                                activeModal === "aluno" && styles.selectInputFocused,
                                isEdit && styles.selectInputDisabled
                            ]}
                            onPress={() => !isEdit && setActiveModal("aluno")}
                            disabled={isLoading || isEdit}
                        >
                            <Text style={[styles.selectInputText, !selectedAlunoName && styles.placeholderText]}>
                                {selectedAlunoName || "Selecione o aluno"}
                            </Text>
                            {!isEdit && <Ionicons name="chevron-down" size={18} color="#6b7280" />}
                        </Pressable>
                        {isEdit && (
                            <Text style={styles.helperText}>
                                O aluno não pode ser alterado após a matrícula ser criada.
                            </Text>
                        )}
                        {!!getFieldError("aluno_id") && (
                            <Text style={styles.errorText}>{getFieldError("aluno_id")}</Text>
                        )}
                    </View>

                    {/* Selector: Série */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Série Escolar *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("serie_id") && styles.selectInputError,
                                activeModal === "serie" && styles.selectInputFocused
                            ]}
                            onPress={() => setActiveModal("serie")}
                            disabled={isLoading}
                        >
                            <Text style={[styles.selectInputText, !selectedSerieName && styles.placeholderText]}>
                                {selectedSerieName || "Selecione a série"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {!!getFieldError("serie_id") && (
                            <Text style={styles.errorText}>{getFieldError("serie_id")}</Text>
                        )}
                    </View>

                    {/* Input: Código Matrícula */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Código de Matrícula *</Text>
                        <Controller
                            control={control}
                            name="codigo_matricula"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("codigo_matricula") && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("codigo_matricula", text);
                                    }}
                                    placeholder="Ex: MAT-2026-99"
                                    placeholderTextColor="#9ca3af"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("codigo_matricula") && (
                            <Text style={styles.errorText}>{getFieldError("codigo_matricula")}</Text>
                        )}
                    </View>

                    {/* Input: Data Matrícula */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Data de Matrícula *</Text>
                        <Controller
                            control={control}
                            name="data_matricula"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("data_matricula") && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        const formatted = formatDateBR(text);
                                        field.onChange(formatted);
                                        handleInputChange("data_matricula", formatted);
                                    }}
                                    placeholder="Ex: 01/02/2026"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("data_matricula") && (
                            <Text style={styles.errorText}>{getFieldError("data_matricula")}</Text>
                        )}
                    </View>

                    {/* Input: Data Cancelamento */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Data de Cancelamento (Opcional)</Text>
                        <Controller
                            control={control}
                            name="data_cancelamento"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("data_cancelamento") && styles.textInputError,
                                    ]}
                                    value={field.value || ""}
                                    onChangeText={(text) => {
                                        const formatted = formatDateBR(text);
                                        field.onChange(formatted || null);
                                        handleInputChange("data_cancelamento", formatted || null);
                                    }}
                                    placeholder="Ex: 15/06/2026"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("data_cancelamento") && (
                            <Text style={styles.errorText}>{getFieldError("data_cancelamento")}</Text>
                        )}
                    </View>

                    {/* Switch: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Situação Ativa</Text>
                            <Text style={styles.switchSublabel}>
                                Matrículas inativas representam alunos desligados, trancados ou cancelados.
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#e5e7eb", true: "#a7f3d0" }}
                            thumbColor={watchStatus ? "#52B28B" : "#d1d5db"}
                            ios_backgroundColor="#e5e7eb"
                            onValueChange={(val) => handleInputChange("status", val)}
                            value={watchStatus}
                            disabled={isLoading}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <Pressable style={styles.cancelButton} onPress={onCancel} disabled={isLoading}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable 
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
                    onPress={handleSubmit(onFormSubmit)} 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {isEdit ? "Salvar" : "Matricular"}
                        </Text>
                    )}
                </Pressable>
            </View>

            {/* Selector Modal */}
            <Modal
                visible={activeModal !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setActiveModal(null)}
            >
                {modalConfig && (
                    <View style={styles.pickerBackdrop}>
                        <View style={styles.pickerModal}>
                            <Text style={styles.pickerTitle}>{modalConfig.title}</Text>
                            
                            {/* Search bar inside picker (only for Aluno modal) */}
                            {activeModal === "aluno" && (
                                <View style={styles.searchBarWrapper}>
                                    <Ionicons name="search" size={18} color="#9ca3af" />
                                    <TextInput
                                        style={styles.searchBarInput}
                                        placeholder={modalConfig.placeholder}
                                        value={pickerSearch}
                                        onChangeText={setPickerSearch}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            )}

                            {modalConfig.isLoading ? (
                                <View style={styles.pickerLoading}>
                                    <ActivityIndicator size="large" color="#52B28B" />
                                    <Text style={styles.pickerLoadingText}>Buscando...</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={modalConfig.data}
                                    keyExtractor={modalConfig.keyExtractor}
                                    renderItem={modalConfig.renderItem}
                                    style={styles.pickerScroll}
                                    onEndReached={() => {
                                        if (modalConfig.hasNext && !modalConfig.isFetchingNext) {
                                            modalConfig.fetchNext();
                                        }
                                    }}
                                    onEndReachedThreshold={0.2}
                                    ListFooterComponent={
                                        modalConfig.isFetchingNext ? (
                                            <ActivityIndicator size="small" color="#52B28B" style={{ marginVertical: 10 }} />
                                        ) : null
                                    }
                                    ListEmptyComponent={
                                        <Text style={styles.pickerEmptyText}>Nenhum registro encontrado.</Text>
                                    }
                                />
                            )}
                            
                            <Pressable 
                                style={styles.pickerCloseButton} 
                                onPress={() => setActiveModal(null)}
                            >
                                <Text style={styles.pickerCloseButtonText}>Fechar</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    formScroll: {
        flex: 1,
    },
    formScrollContent: {
        padding: 20,
        paddingBottom: 150,
    },
    formSection: {
        gap: 18,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 4,
    },
    inputWrapper: {
        width: "100%",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
        marginBottom: 6,
    },
    textInput: {
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#1f2937",
    },
    textInputError: {
        borderColor: "#dc2626",
    },
    selectInput: {
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectInputDisabled: {
        backgroundColor: "#f3f4f6",
        borderColor: "#e5e7eb",
    },
    selectInputFocused: {
        borderColor: "#52B28B",
    },
    selectInputError: {
        borderColor: "#dc2626",
    },
    selectInputText: {
        fontSize: 15,
        color: "#1f2937",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    helperText: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
        fontStyle: "italic",
    },
    errorText: {
        fontSize: 12,
        color: "#dc2626",
        marginTop: 4,
    },
    switchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        marginTop: 8,
    },
    switchLabelContainer: {
        flex: 1,
        paddingRight: 16,
    },
    switchSublabel: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        justifyContent: "space-between",
        gap: 12,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    cancelButton: {
        flex: 1,
        height: 48,
        borderWidth: 1.5,
        borderColor: "#d1d5db",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#4b5563",
    },
    submitButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#52B28B",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#a7f3d0",
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#ffffff",
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    pickerModal: {
        width: "100%",
        maxHeight: "80%",
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
        fontSize: 16,
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
    pickerScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    pickerOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    pickerOptionText: {
        fontSize: 15,
        color: "#171717",
        fontWeight: "600",
    },
    pickerOptionSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    pickerCloseButton: {
        height: 44,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    pickerCloseButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    pickerLoading: {
        paddingVertical: 30,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    pickerLoadingText: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    pickerEmptyText: {
        textAlign: "center",
        fontSize: 14,
        color: "#9ca3af",
        paddingVertical: 30,
    },
});
