import React, { useState, useEffect, useRef } from "react";
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
    Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Classroom } from "@/types/turma";
import { usePeriodsInfiniteQuery } from "@/api/periodo";
import { cadastroTurmaSchema, CadastroTurmaFormData } from "@/schema/cadastro-turma";

type Props = {
    onSubmit: (dados: CadastroTurmaFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: Classroom;
};

export const TurmaForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false, 
    errorMessages, 
    onClearError,
    initialData
}: Props) => {
    const [serieModalVisible, setSerieModalVisible] = useState(false);
    const [selectedSerieName, setSelectedSerieName] = useState("");
    const hasInitialized = useRef(false);

    // React Hook Form initialization with Zod resolver
    const { 
        control, 
        handleSubmit, 
        setValue, 
        watch,
        formState: { errors } 
    } = useForm<CadastroTurmaFormData>({
        resolver: zodResolver(cadastroTurmaSchema),
        defaultValues: {
            serie_id: initialData?.serie_id || 0,
            name: initialData?.name || "",
            max_students: initialData?.max_students || 30,
            shift: (initialData?.shift as any) || "Matutino",
            status: initialData ? (initialData.status === true || initialData.status === 1) : true,
        }
    });

    const watchSerieId = watch("serie_id");
    const watchShift = watch("shift");
    const watchStatus = watch("status");

    // Fetch periods (Séries) for selection modal
    const { data: periodsResponse, isLoading: isLoadingPeriods, error: periodsError } = usePeriodsInfiniteQuery();
    const periods = periodsResponse?.pages.flatMap((page) => page.data || []) || [];

    useEffect(() => {
        console.log("DEBUG TURMA-FORM PERIODS:", {
            isLoadingPeriods,
            periodsError: periodsError?.message || periodsError,
            periodsCount: periods.length,
            pagesCount: periodsResponse?.pages?.length,
            firstPageData: periodsResponse?.pages?.[0] ? {
                status: periodsResponse.pages[0].status,
                code: periodsResponse.pages[0].code,
                message: periodsResponse.pages[0].message,
                dataType: typeof periodsResponse.pages[0].data,
                isArray: Array.isArray(periodsResponse.pages[0].data),
                dataSample: Array.isArray(periodsResponse.pages[0].data) 
                    ? periodsResponse.pages[0].data.slice(0, 2) 
                    : periodsResponse.pages[0].data
            } : null
        });
    }, [periodsResponse, isLoadingPeriods, periodsError, periods]);

    // Initialize period name for display if editing
    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setValue("serie_id", initialData.serie_id);
            setValue("name", initialData.name);
            setValue("max_students", initialData.max_students);
            setValue("shift", initialData.shift as any);
            setValue("status", initialData.status === true || initialData.status === 1);
            hasInitialized.current = true;
        }
    }, [initialData, setValue]);

    // Update the period name displayed when list loads or period_id changes
    useEffect(() => {
        if (watchSerieId && periods.length > 0) {
            const match = periods.find((p) => p.id === watchSerieId);
            if (match) {
                setSelectedSerieName(match.name);
            }
        }
    }, [watchSerieId, periods]);

    const getFieldError = (key: string): string | undefined => {
        // Client-side react-hook-form errors
        if (errors[key as keyof CadastroTurmaFormData]) {
            return errors[key as keyof CadastroTurmaFormData]?.message;
        }
        
        // Server-side errors
        if (errorMessages) {
            if (errorMessages[key]) return errorMessages[key][0];
            
            // Map camelCase to snake_case
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (errorMessages[snakeKey]) return errorMessages[snakeKey][0];
        }
        
        return undefined;
    };

    const handleInputChange = (field: keyof CadastroTurmaFormData, value: any) => {
        setValue(field, value);
        if (onClearError) {
            onClearError(String(field));
            const snakeKey = String(field).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (snakeKey !== String(field)) {
                onClearError(snakeKey);
            }
        }
    };

    const handleSelectSerie = (id: number, name: string) => {
        handleInputChange("serie_id", id);
        setSelectedSerieName(name);
        setSerieModalVisible(false);
    };

    const onFormSubmit = (data: CadastroTurmaFormData) => {
        onSubmit(data);
    };

    const serieErrors = getFieldError("serie_id");
    const nameErrors = getFieldError("name");
    const maxStudentsErrors = getFieldError("max_students");
    const shiftErrors = getFieldError("shift");
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
                        {isEdit ? "Informações da Turma" : "Nova Turma"}
                    </Text>
                    
                    {/* Campo: Série Vinculada */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Série Escolar *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!serieErrors && styles.selectInputError,
                                serieModalVisible && styles.selectInputFocused,
                                isEdit && styles.selectInputDisabled
                            ]}
                            onPress={() => !isEdit && setSerieModalVisible(true)}
                            disabled={isLoading || isEdit}
                        >
                            <Text style={[styles.selectInputText, !selectedSerieName && styles.placeholderText]}>
                                {selectedSerieName || "Selecione a série"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {isEdit && (
                            <Text style={styles.helperText}>
                                A série escolar não pode ser alterada após a criação da turma.
                            </Text>
                        )}
                        {!!serieErrors && (
                            <Text style={styles.errorText}>{serieErrors}</Text>
                        )}
                    </View>

                    {/* Campo: Nome da Turma */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Nome da Turma *</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!nameErrors && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("name", text);
                                    }}
                                    placeholder="Ex: 6ª ano - Turma A"
                                    placeholderTextColor="#9ca3af"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!nameErrors && (
                            <Text style={styles.errorText}>{nameErrors}</Text>
                        )}
                    </View>

                    {/* Campo: Capacidade Máxima */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Capacidade Máxima (Alunos) *</Text>
                        <Controller
                            control={control}
                            name="max_students"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!maxStudentsErrors && styles.textInputError,
                                    ]}
                                    value={field.value ? String(field.value) : ""}
                                    onChangeText={(text) => {
                                        const parsed = text.replace(/[^0-9]/g, "");
                                        const num = parsed ? Number(parsed) : 0;
                                        field.onChange(num);
                                        handleInputChange("max_students", num);
                                    }}
                                    placeholder="Ex: 30"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="numeric"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!maxStudentsErrors && (
                            <Text style={styles.errorText}>{maxStudentsErrors}</Text>
                        )}
                    </View>

                    {/* Campo: Turno */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Turno *</Text>
                        <View style={[styles.shiftSelector, !!shiftErrors && styles.shiftSelectorError]}>
                            {["Matutino", "Vespertino", "Noturno"].map((s) => {
                                const isSelected = watchShift === s;
                                return (
                                    <Pressable
                                        key={s}
                                        style={[
                                            styles.shiftOption, 
                                            isSelected && styles.shiftOptionSelected,
                                            isLoading && styles.shiftOptionDisabled
                                        ]}
                                        onPress={() => !isLoading && handleInputChange("shift", s)}
                                    >
                                        <Text style={[
                                            styles.shiftOptionText, 
                                            isSelected && styles.shiftOptionTextSelected
                                        ]}>
                                            {s}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {!!shiftErrors && (
                            <Text style={styles.errorText}>{shiftErrors}</Text>
                        )}
                    </View>

                    {/* Campo: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Turma Ativa</Text>
                            <Text style={styles.switchSublabel}>
                                Turmas inativas não aparecem em processos de matrículas ou chamadas.
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
                <Pressable 
                    style={styles.cancelButton} 
                    onPress={onCancel} 
                    disabled={isLoading}
                >
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
                            {isEdit ? "Salvar" : "Cadastrar"}
                        </Text>
                    )}
                </Pressable>
            </View>

            {/* Period/Serie Picker Modal */}
            <Modal
                visible={serieModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setSerieModalVisible(false)}
            >
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Selecione a Série Escolar</Text>
                        
                        {isLoadingPeriods ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.pickerLoadingText}>Carregando séries...</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.pickerScroll}>
                                {periods.map((p) => (
                                    <Pressable
                                        key={p.id}
                                        style={styles.pickerOption}
                                        onPress={() => handleSelectSerie(p.id, p.name)}
                                    >
                                        <Text style={styles.pickerOptionText}>{p.name}</Text>
                                    </Pressable>
                                ))}
                                {periods.length === 0 && (
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <Text style={styles.pickerEmptyText}>Nenhuma série disponível.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                        
                        <Pressable 
                            style={styles.pickerCloseButton} 
                            onPress={() => setSerieModalVisible(false)}
                        >
                            <Text style={styles.pickerCloseButtonText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
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
    shiftSelector: {
        flexDirection: "row",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        backgroundColor: "#ffffff",
        overflow: "hidden",
        height: 48,
    },
    shiftSelectorError: {
        borderColor: "#dc2626",
    },
    shiftOption: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
    },
    shiftOptionSelected: {
        backgroundColor: "#52B28B",
    },
    shiftOptionDisabled: {
        opacity: 0.6,
    },
    shiftOptionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    shiftOptionTextSelected: {
        color: "#ffffff",
        fontWeight: "bold",
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
        maxHeight: "60%",
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
    pickerScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    pickerOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        alignItems: "center",
    },
    pickerOptionText: {
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
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
        paddingVertical: 10,
    },
});
