import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { useGlobalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { useMatriculaDisciplinasByOfertaQuery } from "@/api/matriculadisciplina";
import { createFrequencia, updateFrequencia } from "@/api/frequencia";
import { StudentAttendanceRow } from "@/components/gerenciar/frequencia-student-row";
import { useOfertaDisciplinaQuery } from "@/api/ofertadisciplina";
import { Frequencia } from "@/types/frequencia";

const { height } = Dimensions.get("window");

export default function TurmaFrequenciaScreen() {
    const { id } = useGlobalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();
    const ofertaId = Number(id);

    // Initial Date (YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });

    // Local states
    const [attendanceState, setAttendanceState] = useState<
        Record<string, Record<number, { situacao: boolean | null; justificativa: string; existingFrequencia?: Frequencia }>>
    >({});

    const [justificationModalVisible, setJustificationModalVisible] = useState(false);
    const [currentJustificationStudentId, setCurrentJustificationStudentId] = useState<number | null>(null);
    const [tempJustification, setTempJustification] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState(0);

    // Reset local states on classroom change
    useEffect(() => {
        setAttendanceState({});
        setJustificationModalVisible(false);
        setCurrentJustificationStudentId(null);
        setTempJustification("");
    }, [ofertaId]);

    // Fetch offering to verify route alignment (cached, no extra network request)
    const { data: offeringResponse, isLoading: isLoadingOffering } = useOfertaDisciplinaQuery(ofertaId);

    // Load students for this class
    const {
        data: matriculaDisciplinasData,
        isLoading: isLoadingStudents,
    } = useMatriculaDisciplinasByOfertaQuery(ofertaId);

    const matriculaDisciplinasRaw = useMemo(() => {
        if (!matriculaDisciplinasData?.data) return [];
        const rawData = matriculaDisciplinasData.data;
        return Array.isArray(rawData) 
            ? rawData 
            : (typeof rawData === "object" && "data" in rawData && Array.isArray(rawData.data) ? rawData.data : []);
    }, [matriculaDisciplinasData]);

    const isDataMismatched = useMemo(() => {
        const mismatch = offeringResponse?.data && Number(offeringResponse.data.id) !== Number(ofertaId);
        return !!mismatch;
    }, [offeringResponse, ofertaId]);

    const matriculaDisciplinas = useMemo(() => {
        if (isDataMismatched) return [];
        return matriculaDisciplinasRaw;
    }, [matriculaDisciplinasRaw, isDataMismatched]);

    const isLoading = isLoadingStudents || isLoadingOffering || isDataMismatched;

    // Callbacks for Row loaders & changes
    const handleRowLoad = useCallback((mdId: number, existingFreq: Frequencia | null) => {
        setAttendanceState(prev => {
            const dateState = prev[selectedDate] || {};
            const current = dateState[mdId];
            
            if (
                current && 
                current.existingFrequencia?.id === existingFreq?.id &&
                current.existingFrequencia?.situacao === existingFreq?.situacao &&
                current.existingFrequencia?.justificativa === existingFreq?.justificativa
            ) {
                return prev;
            }

            const hasUserModified = current && (
                current.situacao !== current.existingFrequencia?.situacao ||
                current.justificativa !== (current.existingFrequencia?.justificativa || "")
            );

            const nextState = {
                situacao: hasUserModified && current ? current.situacao : (existingFreq ? existingFreq.situacao : null),
                justificativa: hasUserModified && current ? current.justificativa : (existingFreq ? (existingFreq.justificativa || "") : ""),
                existingFrequencia: existingFreq || undefined
            };

            return {
                ...prev,
                [selectedDate]: {
                    ...dateState,
                    [mdId]: nextState
                }
            };
        });
    }, [selectedDate]);

    const handleRowChange = useCallback((mdId: number, newState: { situacao: boolean | null; justificativa: string; existingFrequencia?: Frequencia }) => {
        setAttendanceState(prev => {
            const dateState = prev[selectedDate] || {};
            return {
                ...prev,
                [selectedDate]: {
                    ...dateState,
                    [mdId]: newState
                }
            };
        });
    }, [selectedDate]);

    // Date controls
    const handleAddDays = (days: number) => {
        try {
            const parts = selectedDate.split("-");
            const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            date.setDate(date.getDate() + days);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            
            setSelectedDate(`${year}-${month}-${day}`);
        } catch (e) {
            console.error(e);
        }
    };

    const formatDisplayDate = (dateStr: string) => {
        try {
            const parts = dateStr.split("-");
            if (parts.length !== 3) return dateStr;
            const [year, month, day] = parts;
            const months = [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"
            ];
            return `${day} de ${months[parseInt(month, 10) - 1]}, ${year}`;
        } catch {
            return dateStr;
        }
    };

    // Justification dialog
    const openJustificationModal = (mdId: number) => {
        setCurrentJustificationStudentId(mdId);
        const dateState = attendanceState[selectedDate] || {};
        setTempJustification(dateState[mdId]?.justificativa || "");
        setJustificationModalVisible(true);
    };

    const saveJustification = () => {
        if (currentJustificationStudentId !== null) {
            const dateState = attendanceState[selectedDate] || {};
            const currentState = dateState[currentJustificationStudentId] || { situacao: false, justificativa: "" };
            handleRowChange(currentJustificationStudentId, {
                ...currentState,
                justificativa: tempJustification
            });
        }
        setJustificationModalVisible(false);
        setCurrentJustificationStudentId(null);
    };

    // Save batch action
    const handleSave = async () => {
        const dateState = attendanceState[selectedDate] || {};

        const uncalledStudents = matriculaDisciplinas.filter(md => {
            const state = dateState[md.id];
            return !state || state.situacao === null;
        });

        if (uncalledStudents.length > 0) {
            Alert.alert(
                "Chamada Incompleta",
                `Falta realizar a chamada de ${uncalledStudents.length} aluno(s). Marque P (Presente) ou F (Falta) para todos.`
            );
            return;
        }

        setIsSaving(true);
        setSaveProgress(0);

        const studentsToSave = matriculaDisciplinas.filter(md => {
            const state = dateState[md.id];
            if (!state) return true;

            if (!state.existingFrequencia) return true;

            const changed = state.situacao !== state.existingFrequencia.situacao ||
                            (state.justificativa || null) !== (state.existingFrequencia.justificativa || null);
            return changed;
        });

        if (studentsToSave.length === 0) {
            Alert.alert("Lançamento", "Nenhuma alteração de frequência detectada.");
            setIsSaving(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < studentsToSave.length; i++) {
            const md = studentsToSave[i];
            const state = dateState[md.id];
            if (!state || state.situacao === null) continue;

            try {
                if (state.existingFrequencia) {
                    await updateFrequencia(state.existingFrequencia.id, {
                        situacao: state.situacao,
                        justificativa: state.justificativa || null
                    });
                } else {
                    await createFrequencia({
                        matricula_disciplina_id: md.id,
                        data: selectedDate,
                        situacao: state.situacao as boolean,
                        justificativa: state.justificativa || null
                    });
                }
                successCount++;
            } catch (err) {
                console.error(`Erro ao salvar frequencia:`, err);
                failCount++;
            }
            
            setSaveProgress(Math.round(((i + 1) / studentsToSave.length) * 100));
        }

        queryClient.invalidateQueries({ queryKey: ["frequencias"] });
        setIsSaving(false);
        
        if (failCount === 0) {
            Alert.alert("Sucesso", "Frequências gravadas com sucesso!");
        } else {
            Alert.alert(
                "Concluído com avisos", 
                `Chamada finalizada. Sucesso: ${successCount}, Falhas: ${failCount}`
            );
        }
    };

    const dateState = attendanceState[selectedDate] || {};

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando chamada...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Calendar Picker Header */}
            <View style={styles.headerCard}>
                <Pressable onPress={() => handleAddDays(-1)} style={styles.arrowButton} disabled={isSaving}>
                    <Ionicons name="chevron-back" size={24} color="#1D8C43" />
                </Pressable>
                
                <View style={styles.dateInfo}>
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" style={{ marginRight: 6 }} />
                    <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
                </View>

                <Pressable onPress={() => handleAddDays(1)} style={styles.arrowButton} disabled={isSaving}>
                    <Ionicons name="chevron-forward" size={24} color="#1D8C43" />
                </Pressable>
            </View>

            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: "#def7ec" }]} />
                    <Text style={styles.legendTextLabel}>P - Presente</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendIndicator, { backgroundColor: "#fde8e8" }]} />
                    <Text style={styles.legendTextLabel}>F - Falta</Text>
                </View>
            </View>

            {/* Attendance Roster */}
            <FlatList
                data={matriculaDisciplinas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <StudentAttendanceRow
                        matriculaDisciplina={item}
                        selectedDate={selectedDate}
                        value={dateState[item.id]}
                        onLoad={(existingFreq) => handleRowLoad(item.id, existingFreq)}
                        onChange={(newState) => handleRowChange(item.id, newState)}
                        onEditJustification={() => openJustificationModal(item.id)}
                        disabled={isSaving}
                    />
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-circle-outline" size={60} color="#9ca3af" />
                        <Text style={styles.emptyText}>Sem alunos enturmados nesta disciplina.</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />

            {/* Bottom Actions */}
            <View style={styles.footer}>
                <Pressable 
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <View style={styles.progressContainer}>
                            <ActivityIndicator size="small" color="#ffffff" />
                            <Text style={styles.saveButtonText}>Gravando... ({saveProgress}%)</Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                            <Text style={styles.saveButtonText}>Gravar Chamada</Text>
                        </>
                    )}
                </Pressable>
            </View>

            {/* Modal: Justification Text */}
            <Modal visible={justificationModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Justificativa de Falta</Text>
                        
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Apresentou atestado médico..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            value={tempJustification}
                            onChangeText={setTempJustification}
                            maxLength={500}
                        />

                        <View style={styles.modalActions}>
                            <Pressable 
                                style={[styles.modalBtn, styles.cancelBtn]} 
                                onPress={() => setJustificationModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.modalBtn, styles.confirmBtn]} 
                                onPress={saveJustification}
                            >
                                <Text style={styles.confirmBtnText}>Confirmar</Text>
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
    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 2,
    },
    arrowButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f4faf6",
        justifyContent: "center",
        alignItems: "center",
    },
    dateInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1f2937",
    },
    legendRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 16,
        marginBottom: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    legendTextLabel: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "500",
    },
    listContainer: {
        paddingBottom: 80,
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
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    saveButton: {
        flexDirection: "row",
        backgroundColor: "#52B28B",
        borderRadius: 10,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonDisabled: {
        opacity: 0.7,
        backgroundColor: "#9ca3af",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 14,
    },
    textInput: {
        backgroundColor: "#f9fafb",
        borderWidth: 1.5,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#1f2937",
        height: 90,
        textAlignVertical: "top",
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    modalBtn: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelBtn: {
        backgroundColor: "#f3f4f6",
    },
    cancelBtnText: {
        color: "#4b5563",
        fontWeight: "600",
    },
    confirmBtn: {
        backgroundColor: "#52B28B",
    },
    confirmBtnText: {
        color: "#ffffff",
        fontWeight: "600",
    },
});
