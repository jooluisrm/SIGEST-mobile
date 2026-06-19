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
    Alert,
    Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PeriodoLetivo } from "@/types/periodoletivo";
import { useCoursesQuery } from "@/api/curso";
import { formatDateBR } from "@/utils/masks";

type Props = {
    onSubmit: (dados: {
        course_id: number;
        name: string;
        data_inicio: string; // YYYY-MM-DD
        data_encerramento: string; // YYYY-MM-DD
        status: boolean;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: PeriodoLetivo;
};

function parseDateBRToISO(dateStr: string): string {
    const parts = dateStr.trim().split("/");
    if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

function formatDateISOToBR(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export const PeriodoLetivoForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false, 
    errorMessages, 
    onClearError,
    initialData
}: Props) => {
    const hasInitialized = useRef(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [courseModalVisible, setCourseModalVisible] = useState(false);
    
    // Form fields state
    const [courseId, setCourseId] = useState<number | null>(null);
    const [selectedCourseName, setSelectedCourseName] = useState("");
    const [name, setName] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataEncerramento, setDataEncerramento] = useState("");
    const [status, setStatus] = useState(true);

    // Queries to load active courses for picker selection (page 1, up to 10 items)
    const { data: coursesResponse, isLoading: isLoadingCourses } = useCoursesQuery("", 1);
    const courses = coursesResponse && "data" in coursesResponse && Array.isArray(coursesResponse.data)
        ? coursesResponse.data.filter(c => c.status !== false)
        : [];

    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setCourseId(initialData.course_id);
            setName(initialData.name || "");
            setDataInicio(initialData.data_inicio ? formatDateISOToBR(initialData.data_inicio) : "");
            setDataEncerramento(initialData.data_encerramento ? formatDateISOToBR(initialData.data_encerramento) : "");
            setStatus(initialData.status !== false && initialData.status !== 0);
            hasInitialized.current = true;
        }
    }, [initialData]);

    // Update the course name display when courses are loaded or courseId changes
    useEffect(() => {
        if (courseId && courses.length > 0) {
            const match = courses.find(c => c.id === courseId);
            if (match) {
                setSelectedCourseName(match.name);
            }
        }
    }, [courseId, courses]);

    const getFieldError = (key: string): string[] | undefined => {
        if (!errorMessages) return undefined;
        if (errorMessages[key]) return errorMessages[key];
        
        // Map camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (errorMessages[snakeKey]) return errorMessages[snakeKey];
        
        return undefined;
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === "name") setName(value);
        if (field === "data_inicio") setDataInicio(formatDateBR(value));
        if (field === "data_encerramento") setDataEncerramento(formatDateBR(value));

        if (onClearError) {
            onClearError(field);
            const snakeKey = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (snakeKey !== field) {
                onClearError(snakeKey);
            }
        }
    };

    const handleStatusChange = (value: boolean) => {
        setStatus(value);
        if (onClearError) {
            onClearError("status");
        }
    };

    const handleSelectCourse = (id: number, name: string) => {
        setCourseId(id);
        setSelectedCourseName(name);
        setCourseModalVisible(false);
        if (onClearError) {
            onClearError("course_id");
        }
    };

    const validateForm = () => {
        if (!courseId) return "Selecione um curso para vincular ao período letivo.";
        if (!name.trim()) return "Nome do Período Letivo é obrigatório.";
        
        if (!dataInicio.trim()) return "Data de Início é obrigatória.";
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(dataInicio)) return "A data de início deve estar no formato DD/MM/AAAA.";

        if (!dataEncerramento.trim()) return "Data de Encerramento é obrigatória.";
        if (!dateRegex.test(dataEncerramento)) return "A data de encerramento deve estar no formato DD/MM/AAAA.";

        const startISO = parseDateBRToISO(dataInicio);
        const endISO = parseDateBRToISO(dataEncerramento);
        if (new Date(startISO) > new Date(endISO)) {
            return "A data de encerramento deve ser igual ou posterior à data de início.";
        }

        return null;
    };

    const handleSave = () => {
        const error = validateForm();
        if (error) {
            Alert.alert("Campos inválidos", error);
            return;
        }
        onSubmit({
            course_id: courseId!,
            name: name.trim(),
            data_inicio: parseDateBRToISO(dataInicio),
            data_encerramento: parseDateBRToISO(dataEncerramento),
            status,
        });
    };

    const courseErrors = getFieldError("course_id");
    const nameErrors = getFieldError("name");
    const startErrors = getFieldError("data_inicio");
    const endErrors = getFieldError("data_encerramento");
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
                        {isEdit ? "Informações do Período Letivo" : "Novo Período Letivo"}
                    </Text>
                    
                    {/* Campo: Curso Vinculado */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Curso Vinculado *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!courseErrors && styles.selectInputError,
                                courseModalVisible && styles.selectInputFocused,
                                isEdit && styles.selectInputDisabled
                            ]}
                            onPress={() => !isEdit && setCourseModalVisible(true)}
                            disabled={isLoading || isEdit}
                        >
                            <Text style={[styles.selectInputText, !selectedCourseName && styles.placeholderText]}>
                                {selectedCourseName || "Selecione um curso"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {isEdit && (
                            <Text style={styles.helperText}>
                                O curso não pode ser alterado após o período letivo ser criado.
                            </Text>
                        )}
                        {!!courseErrors && (
                            <Text style={styles.errorText}>{courseErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Nome do Período */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Nome do Período Letivo *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                !!nameErrors && styles.textInputError,
                                focusedField === "name" && styles.textInputFocused
                            ]}
                            value={name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            placeholder="Ex: Ano Letivo 2026 - Fundamental I"
                            placeholderTextColor="#9ca3af"
                            autoCorrect={false}
                            editable={!isLoading}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {!!nameErrors && (
                            <Text style={styles.errorText}>{nameErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Data de Início */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Data de Início *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                !!startErrors && styles.textInputError,
                                focusedField === "data_inicio" && styles.textInputFocused
                            ]}
                            value={dataInicio}
                            onChangeText={(text) => handleInputChange("data_inicio", text)}
                            placeholder="Ex: 01/02/2026"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            autoCorrect={false}
                            editable={!isLoading}
                            onFocus={() => setFocusedField("data_inicio")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {!!startErrors && (
                            <Text style={styles.errorText}>{startErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Data de Encerramento */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Data de Encerramento *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                !!endErrors && styles.textInputError,
                                focusedField === "data_encerramento" && styles.textInputFocused
                            ]}
                            value={dataEncerramento}
                            onChangeText={(text) => handleInputChange("data_encerramento", text)}
                            placeholder="Ex: 15/12/2026"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            autoCorrect={false}
                            editable={!isLoading}
                            onFocus={() => setFocusedField("data_encerramento")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {!!endErrors && (
                            <Text style={styles.errorText}>{endErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Período Letivo Ativo</Text>
                            <Text style={styles.switchSublabel}>
                                Períodos inativos ocultam suas turmas associadas no painel.
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#e5e7eb", true: "#a7f3d0" }}
                            thumbColor={status ? "#52B28B" : "#d1d5db"}
                            ios_backgroundColor="#e5e7eb"
                            onValueChange={handleStatusChange}
                            value={status}
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
                    onPress={handleSave} 
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

            {/* Course Picker Custom Modal */}
            <Modal
                visible={courseModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCourseModalVisible(false)}
            >
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Selecione o Curso Vinculado</Text>
                        
                        {isLoadingCourses ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.pickerLoadingText}>Carregando cursos...</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.pickerScroll}>
                                {courses.map((c) => (
                                    <Pressable
                                        key={c.id}
                                        style={styles.pickerOption}
                                        onPress={() => handleSelectCourse(c.id, c.name)}
                                    >
                                        <Text style={styles.pickerOptionText}>{c.name}</Text>
                                    </Pressable>
                                ))}
                                {courses.length === 0 && (
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <Text style={styles.pickerEmptyText}>Nenhum curso ativo disponível.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                        
                        <Pressable 
                            style={styles.pickerCloseButton} 
                            onPress={() => setCourseModalVisible(false)}
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
    textInputFocused: {
        borderColor: "#52B28B",
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
