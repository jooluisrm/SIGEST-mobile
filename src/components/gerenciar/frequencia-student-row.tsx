import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFrequenciasQuery } from "@/api/frequencia";
import { MatriculaDisciplina } from "@/types/matriculadisciplina";
import { Frequencia } from "@/types/frequencia";

type AttendanceState = {
    situacao: boolean | null;
    justificativa: string;
    existingFrequencia?: Frequencia;
};

type Props = {
    matriculaDisciplina: MatriculaDisciplina;
    selectedDate: string;
    value?: AttendanceState;
    onLoad: (existingFreq: Frequencia | null) => void;
    onChange: (state: AttendanceState) => void;
    onEditJustification: () => void;
    disabled?: boolean;
};

export const StudentAttendanceRow = ({
    matriculaDisciplina,
    selectedDate,
    value,
    onLoad,
    onChange,
    onEditJustification,
    disabled = false
}: Props) => {
    const studentName = matriculaDisciplina.matricula?.aluno?.name || "Aluno Desconhecido";
    const studentMatricula = matriculaDisciplina.matricula?.codigo_matricula || "Sem matrícula";

    // Query student frequencies
    const { data: freqData, isLoading, isError } = useFrequenciasQuery(matriculaDisciplina.id);

    const frequenciesList = useMemo(() => {
        if (!freqData?.data) return [];
        if (Array.isArray(freqData.data)) return freqData.data;
        if (typeof freqData.data === "object" && "data" in freqData.data && Array.isArray(freqData.data.data)) {
            return freqData.data.data;
        }
        return [];
    }, [freqData]);

    const freqForDate = useMemo(() => {
        const rawDbDates = frequenciesList.map((f: any) => f.data);
        const match = frequenciesList.find((f: any) => {
            if (!f.data) return false;
            // Normalize dates to YYYY-MM-DD (handling timestamps/T separators)
            const normalizedDb = f.data.split("T")[0].split(" ")[0];
            const normalizedSel = selectedDate.split("T")[0].split(" ")[0];
            return normalizedDb === normalizedSel;
        });

        return match;
    }, [frequenciesList, selectedDate, studentName]);

    // Report loaded frequency to parent when selectedDate or query data changes
    useEffect(() => {
        if (!isLoading) {
            onLoad(freqForDate || null);
        }
    }, [freqForDate, isLoading, selectedDate]);

    const handleTogglePresence = (newPresence: boolean) => {
        if (disabled) return;
        onChange({
            situacao: newPresence,
            justificativa: newPresence ? "" : (value?.justificativa || ""),
            existingFrequencia: freqForDate
        });
    };

    const selection = value ? value.situacao : null;
    const isPresentActive = selection === true;
    const isAbsenceActive = selection === false;
    const hasJustification = value && value.justificativa && value.justificativa.trim().length > 0;

    return (
        <View style={styles.container}>
            <View style={styles.leftCol}>
                <Text style={styles.nameText} numberOfLines={1}>{studentName}</Text>
                <Text style={styles.matriculaText}>Matrícula: {studentMatricula}</Text>
                
                {/* Justification display if absent */}
                {isAbsenceActive && (
                    <View style={styles.justificationContainer}>
                        {hasJustification ? (
                            <Pressable 
                                style={styles.justificationBadge}
                                onPress={onEditJustification}
                                disabled={disabled}
                            >
                                <Ionicons name="document-text" size={14} color="#1D8C43" />
                                <Text style={styles.justificationBadgeText} numberOfLines={1}>
                                    {value.justificativa}
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable 
                                style={styles.addJustificationButton}
                                onPress={onEditJustification}
                                disabled={disabled}
                            >
                                <Ionicons name="add-circle-outline" size={14} color="#d97706" />
                                <Text style={styles.addJustificationText}>Adicionar Justificativa</Text>
                            </Pressable>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.rightCol}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#52B28B" />
                ) : (
                    <View style={styles.toggleContainer}>
                        {/* Custom visual segmented control for Presence/Absence */}
                        <Pressable
                            style={[
                                styles.toggleButton,
                                styles.presenceButton,
                                isPresentActive && styles.presenceActive,
                                disabled && styles.disabledButton
                            ]}
                            onPress={() => handleTogglePresence(true)}
                            disabled={disabled}
                        >
                            <Text style={[styles.toggleText, isPresentActive && styles.activeText]}>P</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                styles.absenceButton,
                                isAbsenceActive && styles.absenceActive,
                                disabled && styles.disabledButton
                            ]}
                            onPress={() => handleTogglePresence(false)}
                            disabled={disabled}
                        >
                            <Text style={[styles.toggleText, isAbsenceActive && styles.activeText]}>F</Text>
                        </Pressable>
                    </View>
                )}
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
        justifyContent: "center",
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
    toggleContainer: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        borderRadius: 8,
        padding: 3,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    toggleButton: {
        width: 34,
        height: 30,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#6b7280",
    },
    presenceButton: {},
    absenceButton: {},
    presenceActive: {
        backgroundColor: "#def7ec",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    absenceActive: {
        backgroundColor: "#fde8e8",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    activeText: {
        color: "#1f2937",
    },
    disabledButton: {
        opacity: 0.5,
    },
    justificationContainer: {
        marginTop: 6,
    },
    justificationBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4faf6",
        borderColor: "#52B28B",
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
        alignSelf: "flex-start",
        maxWidth: 200,
    },
    justificationBadgeText: {
        fontSize: 11,
        color: "#1D8C43",
        marginLeft: 4,
        fontWeight: "500",
    },
    addJustificationButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 3,
        alignSelf: "flex-start",
    },
    addJustificationText: {
        fontSize: 11,
        color: "#d97706",
        fontWeight: "500",
        marginLeft: 4,
    },
});
