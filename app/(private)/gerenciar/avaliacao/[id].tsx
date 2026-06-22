import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    Pressable, 
    ActivityIndicator, 
    Alert 
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useAtividadeQuery } from "@/api/atividade";
import { useMatriculaDisciplinasByOfertaQuery } from "@/api/matriculadisciplina";
import { 
    useNotasAtividadeQuery, 
    createNotaAtividade, 
    updateNotaAtividade, 
    deleteNotaAtividade 
} from "@/api/nota";
import { RestrictedAccess } from "@/components/restricted-access";
import { GradeStudentRow } from "@/components/gerenciar/grade-student-row";
import { NotaAtividade } from "@/types/nota";

export default function LançamentoNotasScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { id } = useLocalSearchParams<{ id: string }>();
    const activityId = Number(id);

    // Check RBAC
    const hasAccess = useMemo(() => {
        if (!user || !user.role) return false;
        return user.role.includes("admin") || user.role.includes("professor");
    }, [user]);

    // Fetch Activity Details
    const { 
        data: activityData, 
        isLoading: isLoadingActivity 
    } = useAtividadeQuery(activityId);

    const activity = activityData?.data;
    const ofertaId = activity?.oferta_disciplina_id;

    // Fetch Enrolled Students
    const { 
        data: matriculaDisciplinasData, 
        isLoading: isLoadingStudents 
    } = useMatriculaDisciplinasByOfertaQuery(ofertaId);

    const matriculaDisciplinas = useMemo(() => {
        if (!matriculaDisciplinasData?.data) return [];
        if (Array.isArray(matriculaDisciplinasData.data)) return matriculaDisciplinasData.data;
        return [];
    }, [matriculaDisciplinasData]);

    // Fetch Existing Grades
    const { 
        data: notasData, 
        isLoading: isLoadingGrades,
        dataUpdatedAt: gradesUpdatedAt
    } = useNotasAtividadeQuery(activityId);

    const notasList = useMemo(() => {
        if (!notasData?.data) return [];
        if (Array.isArray(notasData.data)) return notasData.data;
        if (typeof notasData.data === "object" && "data" in notasData.data && Array.isArray(notasData.data.data)) {
            return notasData.data.data;
        }
        return [];
    }, [notasData]);

    // Local grading states
    const [gradesState, setGradesState] = useState<
        Record<number, { nota: string; existingNota?: NotaAtividade }>
    >({});
    const [lastInitializedUpdatedAt, setLastInitializedUpdatedAt] = useState<number>(0);
    const [prevActivityId, setPrevActivityId] = useState<number | null>(null);

    // Reset initialization status if activity id changes (done during render to avoid useEffect batching race conditions on mount)
    if (activityId !== prevActivityId) {
        setPrevActivityId(activityId);
        setGradesState({});
        setLastInitializedUpdatedAt(0);
    }

    // Saving progress states
    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState(0);

    // Dynamic Navigation Title
    useEffect(() => {
        if (activity) {
            navigation.setOptions({
                title: activity.titulo || "Lançamento de Notas"
            });
        }
    }, [activity, navigation]);

    // Initialize grades state
    useEffect(() => {
        if (!isLoadingGrades && !isLoadingStudents && matriculaDisciplinas.length > 0) {
            if (gradesUpdatedAt > lastInitializedUpdatedAt) {
                const initialGrades: Record<number, { nota: string; existingNota?: NotaAtividade }> = {};
                matriculaDisciplinas.forEach(student => {
                    const match = notasList.find((n: any) => n.matricula_disciplina_id === student.id);
                    initialGrades[student.id] = {
                        nota: match ? String(match.nota) : "",
                        existingNota: match || undefined
                    };
                });
                setGradesState(initialGrades);
                setLastInitializedUpdatedAt(gradesUpdatedAt);
            }
        }
    }, [matriculaDisciplinas, notasList, isLoadingGrades, isLoadingStudents, gradesUpdatedAt, lastInitializedUpdatedAt]);

    const handleGradeChange = useCallback((mdId: number, text: string) => {
        setGradesState(prev => {
            const existing = prev[mdId]?.existingNota;
            return {
                ...prev,
                [mdId]: {
                    nota: text,
                    existingNota: existing
                }
            };
        });
    }, []);

    // Save grades
    const handleSave = async () => {
        // 1. Perform validation checks across all student rows
        for (let i = 0; i < matriculaDisciplinas.length; i++) {
            const student = matriculaDisciplinas[i];
            const state = gradesState[student.id];
            if (state && state.nota.trim()) {
                const num = parseFloat(state.nota.replace(",", "."));
                if (isNaN(num) || num < 0 || num > 10) {
                    Alert.alert(
                        "Nota Inválida", 
                        `A nota do aluno "${student.matricula?.aluno?.name || "Desconhecido"}" deve ser um número entre 0.0 e 10.0.`
                    );
                    return;
                }
            }
        }

        setIsSaving(true);
        setSaveProgress(0);

        // 2. Identify students with changes
        const studentsToSave = matriculaDisciplinas.filter(student => {
            const state = gradesState[student.id];
            if (!state) return false;

            const typedText = state.nota.trim();

            if (state.existingNota) {
                // If text is cleared, delete grade, or compare floats if modified
                if (typedText === "") return true;
                const currentNum = parseFloat(typedText.replace(",", "."));
                const originalNum = state.existingNota.nota;
                return currentNum !== originalNum;
            }

            // If it had no grade, it's saved if a grade is written
            return typedText !== "";
        });

        if (studentsToSave.length === 0) {
            Alert.alert("Lançamento", "Nenhuma alteração de notas detectada.");
            setIsSaving(false);
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < studentsToSave.length; i++) {
            const student = studentsToSave[i];
            const state = gradesState[student.id];
            const typedText = state.nota.trim();

            try {
                if (state.existingNota) {
                    if (typedText === "") {
                        // Delete grade
                        await deleteNotaAtividade(state.existingNota.id);
                    } else {
                        // Update grade
                        const num = parseFloat(typedText.replace(",", "."));
                        await updateNotaAtividade(state.existingNota.id, { nota: num });
                    }
                } else {
                    if (typedText !== "") {
                        // Create grade
                        const num = parseFloat(typedText.replace(",", "."));
                        await createNotaAtividade({
                            matricula_disciplina_id: student.id,
                            atividade_id: activityId,
                            nota: num
                        });
                    }
                }
                successCount++;
            } catch (err) {
                console.error(`Erro ao salvar nota para matricula_disciplina ${student.id}:`, err);
                failCount++;
            }
            
            setSaveProgress(Math.round(((i + 1) / studentsToSave.length) * 100));
        }

        // Invalidate queries to reload updated records
        queryClient.invalidateQueries({ queryKey: ["notas", "atividade", activityId] });
        queryClient.invalidateQueries({ queryKey: ["notas"] });
        
        setIsSaving(false);

        if (failCount === 0) {
            Alert.alert("Sucesso", "Notas gravadas com sucesso!");
        } else {
            Alert.alert(
                "Concluído com avisos", 
                `Lançamento finalizado. Sucesso: ${successCount}, Falhas: ${failCount}`
            );
        }
    };

    const isLoading = isLoadingActivity || isLoadingStudents || isLoadingGrades;

    // Render restricted access if no permissions
    if (!hasAccess) {
        return <RestrictedAccess />;
    }

    return (
        <View style={styles.container}>
            {/* Header info card */}
            {activity && (
                <View style={styles.activityInfoCard}>
                    <View style={styles.metaRow}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{activity.tipo}</Text>
                        </View>
                        <Text style={styles.metaText}>
                            Oferta ID: #{activity.oferta_disciplina_id}
                        </Text>
                    </View>
                    <Text style={styles.activityTitle}>{activity.titulo}</Text>
                    {activity.descricao && (
                        <Text style={styles.activityDesc}>{activity.descricao}</Text>
                    )}
                </View>
            )}

            {/* Students roll */}
            {isLoading && matriculaDisciplinas.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando alunos e notas...</Text>
                </View>
            ) : (
                <FlatList
                    data={matriculaDisciplinas}
                    extraData={gradesState}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <GradeStudentRow
                            matriculaDisciplina={item}
                            value={gradesState[item.id]}
                            onChangeText={(text) => handleGradeChange(item.id, text)}
                            disabled={isSaving}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={54} color="#d1d5db" />
                            <Text style={styles.emptyText}>Nenhum aluno enturmado nesta disciplina.</Text>
                        </View>
                    }
                />
            )}

            {/* Bottom Save Action */}
            {matriculaDisciplinas.length > 0 && (
                <View style={styles.bottomBar}>
                    {isSaving && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>Gravando notas: {saveProgress}%</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${saveProgress}%` }]} />
                            </View>
                        </View>
                    )}
                    <Pressable
                        style={({ pressed }) => [
                            styles.saveButton,
                            (pressed || isSaving) && styles.saveButtonPressed
                        ]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Gravar Notas da Avaliação</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    activityInfoCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    typeBadge: {
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0369a1",
        textTransform: "uppercase",
    },
    metaText: {
        fontSize: 11,
        color: "#9ca3af",
        fontWeight: "600",
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    activityDesc: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 18,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    saveButton: {
        backgroundColor: "#1D8C43", // Matching theme dark green
        borderRadius: 12,
        height: 52,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    saveButtonPressed: {
        backgroundColor: "#156731",
        opacity: 0.9,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressText: {
        fontSize: 12,
        color: "#6b7280",
        fontWeight: "600",
        marginBottom: 6,
        textAlign: "center",
    },
    progressBarBg: {
        height: 6,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#52B28B",
    },
});
