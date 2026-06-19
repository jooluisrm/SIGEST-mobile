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
    Alert
} from "react-native";
import { Course } from "@/types/curso";

type Props = {
    onSubmit: (dados: {
        name: string;
        number_periods: number;
        total_hours: number;
        details: string;
        status: boolean;
    }) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: Course;
};

export const CursoForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false, 
    errorMessages, 
    onClearError,
    initialData
}: Props) => {
    const hasInitialized = useRef(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    
    // Form state
    const [name, setName] = useState("");
    const [numberPeriods, setNumberPeriods] = useState("");
    const [totalHours, setTotalHours] = useState("");
    const [details, setDetails] = useState("");
    const [status, setStatus] = useState(true);

    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setName(initialData.name || "");
            setNumberPeriods(String(initialData.number_periods ?? ""));
            setTotalHours(String(initialData.total_hours ?? ""));
            setDetails(initialData.details || "");
            setStatus(initialData.status !== false); // default to true if undefined or true
            hasInitialized.current = true;
        }
    }, [initialData]);

    const getFieldError = (key: string): string[] | undefined => {
        if (!errorMessages) return undefined;
        if (errorMessages[key]) return errorMessages[key];
        
        // Map camelCase to snake_case just in case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (errorMessages[snakeKey]) return errorMessages[snakeKey];
        
        return undefined;
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === "name") setName(value);
        if (field === "number_periods") setNumberPeriods(value.replace(/\D/g, ""));
        if (field === "total_hours") setTotalHours(value.replace(/\D/g, ""));
        if (field === "details") setDetails(value);

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

    const validateForm = () => {
        if (!name.trim()) return "Nome do Curso é obrigatório.";
        if (name.trim().length < 5 || name.trim().length > 30) {
            return "O Nome do Curso deve ter entre 5 e 30 caracteres.";
        }
        
        const periodsVal = parseInt(numberPeriods, 10);
        if (isNaN(periodsVal) || periodsVal < 1 || periodsVal > 100) {
            return "O número de períodos deve ser um número entre 1 e 100.";
        }

        const hoursVal = parseInt(totalHours, 10);
        if (isNaN(hoursVal) || hoursVal < 1 || hoursVal > 10000) {
            return "A carga horária total deve ser um número entre 1 e 10.000.";
        }

        if (details.length > 2000) {
            return "A descrição/detalhes deve ter no máximo 2.000 caracteres.";
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
            name: name.trim(),
            number_periods: parseInt(numberPeriods, 10),
            total_hours: parseInt(totalHours, 10),
            details: details.trim(),
            status,
        });
    };

    const nameErrors = getFieldError("name");
    const periodsErrors = getFieldError("number_periods");
    const hoursErrors = getFieldError("total_hours");
    const detailsErrors = getFieldError("details");
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
                        {isEdit ? "Informações do Curso" : "Novo Curso"}
                    </Text>
                    
                    {/* Campo: Nome do Curso */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Nome do Curso *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                !!nameErrors && styles.textInputError,
                                focusedField === "name" && styles.textInputFocused
                            ]}
                            value={name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            placeholder="Ex: Engenharia de Computação"
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

                    {/* Campo: Número de Períodos */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Número de Períodos *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                isEdit && styles.textInputDisabled,
                                !!periodsErrors && styles.textInputError,
                                focusedField === "number_periods" && styles.textInputFocused
                            ]}
                            value={numberPeriods}
                            onChangeText={(text) => handleInputChange("number_periods", text)}
                            placeholder="Ex: 8"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            autoCorrect={false}
                            editable={!isLoading && !isEdit}
                            onFocus={() => setFocusedField("number_periods")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {isEdit && (
                            <Text style={styles.helperText}>
                                O número de períodos não pode ser editado após a criação para evitar inconsistências.
                            </Text>
                        )}
                        {!!periodsErrors && (
                            <Text style={styles.errorText}>{periodsErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Carga Horária Total */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Carga Horária Total (Horas) *</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                !!hoursErrors && styles.textInputError,
                                focusedField === "total_hours" && styles.textInputFocused
                            ]}
                            value={totalHours}
                            onChangeText={(text) => handleInputChange("total_hours", text)}
                            placeholder="Ex: 3200"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            autoCorrect={false}
                            editable={!isLoading}
                            onFocus={() => setFocusedField("total_hours")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {!!hoursErrors && (
                            <Text style={styles.errorText}>{hoursErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Detalhes/Descrição */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Descrição/Detalhes do Curso</Text>
                        <TextInput
                            style={[
                                styles.textInput, 
                                styles.textAreaInput,
                                !!detailsErrors && styles.textInputError,
                                focusedField === "details" && styles.textInputFocused
                            ]}
                            value={details}
                            onChangeText={(text) => handleInputChange("details", text)}
                            placeholder="Descreva informações gerais sobre o curso..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            autoCorrect={false}
                            editable={!isLoading}
                            onFocus={() => setFocusedField("details")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {!!detailsErrors && (
                            <Text style={styles.errorText}>{detailsErrors[0]}</Text>
                        )}
                    </View>

                    {/* Campo: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Curso Ativo</Text>
                            <Text style={styles.switchSublabel}>
                                Cursos inativos não poderão ser selecionados para novas turmas.
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
    textInputDisabled: {
        backgroundColor: "#f3f4f6",
        borderColor: "#e5e7eb",
        color: "#9ca3af",
    },
    textInputFocused: {
        borderColor: "#52B28B",
    },
    textInputError: {
        borderColor: "#dc2626",
    },
    textAreaInput: {
        height: 100,
        paddingVertical: 12,
        textAlignVertical: "top",
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
});
