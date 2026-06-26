import React, { useMemo } from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { MatriculaDisciplina } from "@/types/matriculadisciplina";
import { NotaAtividade } from "@/types/nota";

type GradeState = {
    nota: string;
    existingNota?: NotaAtividade;
};

type Props = {
    matriculaDisciplina: MatriculaDisciplina;
    value?: GradeState;
    onChangeText: (text: string) => void;
    disabled?: boolean;
    onFocus?: () => void;
};

export const GradeStudentRow = ({
    matriculaDisciplina,
    value,
    onChangeText,
    disabled = false,
    onFocus
}: Props) => {
    const studentName = matriculaDisciplina.matricula?.aluno?.name || "Aluno Desconhecido";
    const studentMatricula = matriculaDisciplina.matricula?.codigo_matricula || "Sem matrícula";

    const currentGrade = value ? value.nota : "";

    // Local validation check for styling
    const hasError = useMemo(() => {
        if (!currentGrade.trim()) return false;
        const num = parseFloat(currentGrade.replace(",", "."));
        return isNaN(num) || num < 0 || num > 10;
    }, [currentGrade]);

    return (
        <View style={styles.container}>
            <View style={styles.leftCol}>
                <Text style={styles.nameText} numberOfLines={1}>{studentName}</Text>
                <Text style={styles.matriculaText}>Matrícula: {studentMatricula}</Text>
            </View>

            <View style={styles.rightCol}>
                <View style={[
                    styles.inputContainer,
                    hasError && styles.inputContainerError,
                    disabled && styles.disabledInputContainer
                ]}>
                    <TextInput
                        style={styles.gradeInput}
                        value={currentGrade}
                        onChangeText={onChangeText}
                        placeholder="-.-"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        maxLength={4}
                        editable={!disabled}
                        onFocus={onFocus}
                    />
                </View>
                {hasError && <Text style={styles.errorIndicator}>Inválido</Text>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 1,
    },
    leftCol: {
        flex: 1,
        justifyContent: "center",
        marginRight: 12,
    },
    rightCol: {
        alignItems: "center",
        width: 80,
    },
    nameText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 2,
    },
    matriculaText: {
        fontSize: 12,
        color: "#9ca3af",
    },
    inputContainer: {
        width: 70,
        height: 42,
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#d1d5db",
        justifyContent: "center",
        alignItems: "center",
    },
    inputContainerError: {
        borderColor: "#dc2626",
        backgroundColor: "#fef2f2",
    },
    disabledInputContainer: {
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db",
        opacity: 0.6,
    },
    gradeInput: {
        width: "100%",
        height: "100%",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
    },
    errorIndicator: {
        fontSize: 9,
        fontWeight: "700",
        color: "#dc2626",
        marginTop: 2,
        textTransform: "uppercase",
    },
});
