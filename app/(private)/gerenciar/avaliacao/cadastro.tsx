import React, { useState, useEffect } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    Pressable, 
    ScrollView, 
    ActivityIndicator, 
    Alert,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { 
    useCreateAtividadeMutation, 
    useUpdateAtividadeMutation, 
    useAtividadeQuery 
} from "@/api/atividade";
import { cadastroAtividadeSchema, CadastroAtividadeFormData } from "@/schema/atividade";


const AVALIACAO_TIPOS = ["Prova", "Trabalho", "Seminário", "Exercício", "Outro"];

export default function CadastroAvaliacaoScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id, ofertaId } = useLocalSearchParams<{ id?: string; ofertaId: string }>();

    // API Mutations & Queries
    const { mutateAsync: createAtividade, isPending: isCreating } = useCreateAtividadeMutation();
    const { mutateAsync: updateAtividade, isPending: isUpdating } = useUpdateAtividadeMutation();
    const { data: activityData, isLoading: isLoadingQuery } = useAtividadeQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

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


    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Avaliação" : "Cadastrar Avaliação"
        });
    }, [id, navigation]);

    // Setup React Hook Form
    const { 
        control, 
        handleSubmit, 
        setValue, 
        reset,
        formState: { errors } 
    } = useForm<CadastroAtividadeFormData>({
        resolver: zodResolver(cadastroAtividadeSchema),
        defaultValues: {
            oferta_disciplina_id: Number(ofertaId),
            titulo: "",
            tipo: "",
            data_inicio: new Date().toISOString().split("T")[0],
            data_fim: "",
            descricao: ""
        }
    });

    // Populate data if editing
    useEffect(() => {
        if (id && activityData?.data) {
            const data = activityData.data;
            reset({
                oferta_disciplina_id: data.oferta_disciplina_id,
                titulo: data.titulo,
                tipo: data.tipo,
                data_inicio: data.data_inicio,
                data_fim: data.data_fim || "",
                descricao: data.descricao || ""
            });
        }
    }, [id, activityData, reset]);

    const handleFormSubmit = async (dados: CadastroAtividadeFormData) => {
        setErrorMessages({});

        const payload = {
            oferta_disciplina_id: dados.oferta_disciplina_id,
            titulo: dados.titulo,
            tipo: dados.tipo,
            data_inicio: dados.data_inicio,
            data_fim: dados.data_fim && dados.data_fim.trim() !== "" ? dados.data_fim : null,
            descricao: dados.descricao && dados.descricao.trim() !== "" ? dados.descricao : null,
        };

        try {
            if (id) {
                await updateAtividade({ id, payload });
                Alert.alert("Sucesso", "Avaliação atualizada com sucesso!");
            } else {
                await createAtividade(payload);
                Alert.alert("Sucesso", "Avaliação cadastrada com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar avaliação:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422) {
                    setErrorMessages(responseData.errors || responseData.mensagem || {});
                    Alert.alert(
                        "Erro de Validação", 
                        "Verifique os dados informados nos campos destacados."
                    );
                } else {
                    const msg = responseData?.message || "Erro de comunicação com o servidor.";
                    Alert.alert("Erro ao salvar", msg);
                }
            } else {
                Alert.alert("Erro", "Ocorreu uma falha inesperada.");
            }
        }
    };

    const getFieldError = (key: keyof CadastroAtividadeFormData): string | undefined => {
        if (errors[key]) {
            return errors[key]?.message;
        }
        if (errorMessages[key]) {
            return errorMessages[key][0];
        }
        return undefined;
    };

    if (id && isLoadingQuery) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Buscando dados da avaliação...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    {/* Title input */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Título da Avaliação</Text>
                        <Controller
                            control={control}
                            name="titulo"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[styles.input, getFieldError("titulo") && styles.inputError]}
                                    placeholder="Ex: Prova Bimestral de Português"
                                    value={value}
                                    onChangeText={onChange}
                                    placeholderTextColor="#9ca3af"
                                />
                            )}
                        />
                        {getFieldError("titulo") && (
                            <Text style={styles.errorText}>{getFieldError("titulo")}</Text>
                        )}
                    </View>

                    {/* Type selection */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tipo de Avaliação</Text>
                        <Controller
                            control={control}
                            name="tipo"
                            render={({ field: { onChange, value } }) => (
                                <View style={styles.typesContainer}>
                                    {AVALIACAO_TIPOS.map((t) => {
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
                        {getFieldError("tipo") && (
                            <Text style={styles.errorText}>{getFieldError("tipo")}</Text>
                        )}
                    </View>

                    {/* Date Row */}
                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Data de Início</Text>
                            <Controller
                                control={control}
                                name="data_inicio"
                                render={({ field: { value } }) => (
                                    <Pressable
                                        onPress={() => setShowStartPicker(true)}
                                        style={[styles.input, styles.dateInputPressable, getFieldError("data_inicio") && styles.inputError]}
                                    >
                                        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
                                            {value ? formatDisplayDate(value) : "Selecionar data"}
                                        </Text>
                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                    </Pressable>
                                )}
                            />
                            {getFieldError("data_inicio") && (
                                <Text style={styles.errorText}>{getFieldError("data_inicio")}</Text>
                            )}
                            {showStartPicker && (
                                <DateTimePicker
                                    value={parseDate(control._formValues.data_inicio)}
                                    mode="date"
                                    display="default"
                                    onChange={handleStartDateChange}
                                />
                            )}
                        </View>

                        <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                            <Text style={styles.label}>Data Final (Opcional)</Text>
                            <Controller
                                control={control}
                                name="data_fim"
                                render={({ field: { value } }) => (
                                    <View style={styles.dateInputWrapper}>
                                        <Pressable
                                            onPress={() => setShowEndPicker(true)}
                                            style={[styles.input, styles.dateInputPressable, getFieldError("data_fim") && styles.inputError]}
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
                            {getFieldError("data_fim") && (
                                <Text style={styles.errorText}>{getFieldError("data_fim")}</Text>
                            )}
                            {showEndPicker && (
                                <DateTimePicker
                                    value={parseDate(control._formValues.data_fim)}
                                    mode="date"
                                    display="default"
                                    onChange={handleEndDateChange}
                                />
                            )}
                        </View>
                    </View>


                    {/* Description input */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Descrição / Observações</Text>
                        <Controller
                            control={control}
                            name="descricao"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    style={[styles.input, styles.textArea, getFieldError("descricao") && styles.inputError]}
                                    placeholder="Descreva detalhes como conteúdo cobrado ou instruções..."
                                    value={value || ""}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#9ca3af"
                                />
                            )}
                        />
                        {getFieldError("descricao") && (
                            <Text style={styles.errorText}>{getFieldError("descricao")}</Text>
                        )}
                    </View>
                </View>

                {/* Submit Actions */}
                <View style={styles.actionsContainer}>
                    <Pressable
                        style={[styles.btn, styles.cancelBtn]}
                        onPress={() => router.back()}
                        disabled={isCreating || isUpdating}
                    >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.btn, styles.submitBtn]}
                        onPress={handleSubmit(handleFormSubmit)}
                        disabled={isCreating || isUpdating}
                    >
                        {isCreating || isUpdating ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.submitBtnText}>
                                {id ? "Salvar Alterações" : "Cadastrar Avaliação"}
                            </Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        padding: 16,
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
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#d1d5db",
        height: 48,
        paddingHorizontal: 14,
        fontSize: 15,
        color: "#1f2937",
    },
    inputError: {
        borderColor: "#dc2626",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
        paddingVertical: 12,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 12,
        marginTop: 6,
        fontWeight: "500",
    },
    row: {
        flexDirection: "row",
    },
    typesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    typeOptionBtn: {
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
    },
    typeOptionBtnSelected: {
        backgroundColor: "#e8f5ed",
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
    actionsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 40,
    },
    btn: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelBtn: {
        backgroundColor: "#f3f4f6",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
    },
    cancelBtnText: {
        color: "#4b5563",
        fontSize: 15,
        fontWeight: "600",
    },
    submitBtn: {
        backgroundColor: "#1D8C43",
    },
    submitBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
    dateInputPressable: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dateInputText: {
        fontSize: 15,
        color: "#1f2937",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    dateInputWrapper: {
        position: "relative",
    },
    clearDateBtn: {
        padding: 4,
    },
});

