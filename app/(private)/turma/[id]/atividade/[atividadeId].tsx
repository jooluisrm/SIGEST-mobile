import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    FlatList, 
    Pressable, 
    ActivityIndicator, 
    Modal, 
    TextInput, 
    Alert, 
    ScrollView, 
    Platform,
    KeyboardAvoidingView,
    Keyboard
} from "react-native";
import { useGlobalSearchParams, useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { useAtividadeQuery, useUpdateAtividadeMutation, useDeleteAtividadeMutation } from "@/api/atividade";
import { useMatriculaDisciplinasByOfertaQuery } from "@/api/matriculadisciplina";
import { useNotasAtividadeQuery, createNotaAtividade, updateNotaAtividade } from "@/api/nota";
import { GradeStudentRow } from "@/components/gerenciar/grade-student-row";
import { cadastroAtividadeSchema, CadastroAtividadeData } from "@/schema/cadastro-atividade";
import { NotaAtividade } from "@/types/nota";

export default function AtividadeDetalhesScreen() {
    const { id: idParam, atividadeId: atividadeIdParam } = useGlobalSearchParams<{ id: string; atividadeId: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    const ofertaId = Number(idParam);
    const atividadeId = Number(atividadeIdParam);

    // Refs & Keyboard Height State
    const flatListRef = useRef<FlatList>(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    // Keyboard listener for dynamic list padding
    useEffect(() => {
        const showSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            }
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    // States
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isSavingGrades, setIsSavingGrades] = useState(false);
    const [gradesState, setGradesState] = useState<Record<number, { nota: string; existingNota?: NotaAtividade }>>({});

    // Reset grades state when changing activities
    useEffect(() => {
        setGradesState({});
    }, [atividadeId]);

    // Fetch activity details
    const { data: activityResponse, isLoading: isLoadingActivity, refetch: refetchActivity } = useAtividadeQuery(atividadeId);
    const activity = useMemo(() => {
        if (!activityResponse?.data) return null;
        if (Number(activityResponse.data.id) !== Number(atividadeId)) return null;
        return activityResponse.data;
    }, [activityResponse, atividadeId]);

    useEffect(() => {
        if (activity) {
            navigation.setOptions({
                headerTitle: activity.titulo,
            });
        }
    }, [activity, navigation]);

    // Fetch enrolled students
    const { data: studentsResponse, isLoading: isLoadingStudents } = useMatriculaDisciplinasByOfertaQuery(ofertaId);
    const matriculaDisciplinas = useMemo(() => {
        if (!studentsResponse?.data) return [];
        const rawData = studentsResponse.data;
        const data = Array.isArray(rawData)
            ? rawData
            : (typeof rawData === "object" && "data" in rawData && Array.isArray(rawData.data) ? rawData.data : []);
        return data;
    }, [studentsResponse]);

    // Fetch grades
    const { data: notasResponse, isLoading: isLoadingNotas, refetch: refetchNotas } = useNotasAtividadeQuery(atividadeId);
    const notasList = useMemo(() => {
        if (!notasResponse?.data) return [];
        const data = Array.isArray(notasResponse.data)
            ? notasResponse.data
            : (typeof notasResponse.data === "object" && "data" in notasResponse.data && Array.isArray(notasResponse.data.data) ? notasResponse.data.data : []);
        return data;
    }, [notasResponse]);

    // Mutations
    const updateAtividadeMutation = useUpdateAtividadeMutation();
    const deleteAtividadeMutation = useDeleteAtividadeMutation();

    // React Hook Form
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

    // Populate grades local state
    useEffect(() => {
        if (isLoadingStudents || isLoadingNotas || !atividadeId) return;

        const state: Record<number, { nota: string; existingNota?: NotaAtividade }> = {};
        matriculaDisciplinas.forEach(student => {
            const match = notasList.find((n: NotaAtividade) => n.matricula_disciplina_id === student.id);
            state[student.id] = {
                nota: match ? String(match.nota) : "",
                existingNota: match || undefined
            };
        });
        setGradesState(state);
    }, [matriculaDisciplinas, notasList, isLoadingStudents, isLoadingNotas]);

    // Populate form for editing
    useEffect(() => {
        if (activity) {
            reset({
                titulo: activity.titulo,
                tipo: activity.tipo,
                data_inicio: activity.data_inicio.split("T")[0].split(" ")[0],
                data_fim: activity.data_fim ? activity.data_fim.split("T")[0].split(" ")[0] : "",
                descricao: activity.descricao || "",
            });
        }
    }, [activity, reset]);

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

    // Actions
    const handleUpdateActivitySubmit = (data: CadastroAtividadeData) => {
        const payload = {
            titulo: data.titulo,
            tipo: data.tipo,
            data_inicio: data.data_inicio,
            data_fim: data.data_fim || null,
            descricao: data.descricao || null,
        };

        updateAtividadeMutation.mutate({
            id: atividadeId,
            payload
        }, {
            onSuccess: () => {
                Alert.alert("Sucesso", "Atividade atualizada com sucesso!");
                setIsEditModalVisible(false);
                refetchActivity();
                queryClient.invalidateQueries({ queryKey: ["atividades", "oferta", ofertaId] });
            },
            onError: (err: any) => {
                console.error("[DEBUG] updateAtividadeMutation onError object:", err);
                if (err.response) {
                    const errorData = err.response.data;
                    const errorMsg = errorData.message || errorData.mensagem || "Erro de validação.";
                    const details = errorData.errors ? Object.values(errorData.errors).flat().join("\n") : "";
                    Alert.alert("Erro de Validação", `${errorMsg}\n${details}`);
                } else {
                    Alert.alert("Erro", "Erro ao atualizar atividade.");
                }
            }
        });
    };

    const handleDeleteActivity = () => {
        Alert.alert(
            "Excluir Atividade",
            "Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita e removerá todas as notas associadas.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        deleteAtividadeMutation.mutate(atividadeId, {
                            onSuccess: () => {
                                Alert.alert("Sucesso", "Atividade excluída com sucesso!");
                                queryClient.invalidateQueries({ queryKey: ["atividades", "oferta", ofertaId] });
                                 router.replace({
                                     pathname: "/(private)/turma/[id]/atividades" as any,
                                     params: { id: String(ofertaId) }
                                 });
                            },
                            onError: (err) => {
                                console.error("[DEBUG] deleteAtividadeMutation onError:", err);
                                Alert.alert("Erro", "Não foi possível excluir a atividade.");
                            }
                        });
                    }
                }
            ]
        );
    };

    const handleGradeChange = (studentId: number, text: string) => {
        setGradesState(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                nota: text
            }
        }));
    };

    const handleSaveGrades = async () => {
        const studentsToSave: { studentId: number; grade: number; existingId?: number }[] = [];
        let hasValidationError = false;

        Object.keys(gradesState).forEach(key => {
            const studentId = parseInt(key);
            const state = gradesState[studentId];
            if (!state || !state.nota.trim()) return;

            const num = parseFloat(state.nota.replace(",", "."));
            if (isNaN(num) || num < 0 || num > 10) {
                hasValidationError = true;
            } else {
                studentsToSave.push({
                    studentId,
                    grade: num,
                    existingId: state.existingNota?.id
                });
            }
        });

        if (hasValidationError) {
            Alert.alert("Validação", "Notas devem ser valores numéricos entre 0,0 e 10,0.");
            return;
        }

        setIsSavingGrades(true);
        let successCount = 0;
        let failCount = 0;

        for (const item of studentsToSave) {
            try {
                if (item.existingId) {
                    await updateNotaAtividade(item.existingId, { nota: item.grade });
                } else {
                    await createNotaAtividade({
                        matricula_disciplina_id: item.studentId,
                        atividade_id: atividadeId,
                        nota: item.grade
                    });
                }
                successCount++;
            } catch (err) {
                console.error("Erro ao salvar nota:", err);
                failCount++;
            }
        }

        await refetchNotas();
        queryClient.invalidateQueries({ queryKey: ["notas", "atividade", atividadeId] });
        setIsSavingGrades(false);

        if (failCount === 0) {
            Alert.alert("Sucesso", "Todas as notas foram salvas com sucesso!");
        } else {
            Alert.alert("Lançamento Parcial", `Notas gravadas. Sucesso: ${successCount}, Falhas: ${failCount}`);
        }
    };

    const isDataMismatched = useMemo(() => {
        const activityMismatch = activityResponse?.data && Number(activityResponse.data.id) !== Number(atividadeId);
        return !!activityMismatch;
    }, [activityResponse, atividadeId]);

    const isLoading = isLoadingActivity || isLoadingStudents || isLoadingNotas || isDataMismatched;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando detalhes da atividade...</Text>
            </View>
        );
    }

    if (!activity) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
                <Text style={styles.errorText}>Atividade não encontrada.</Text>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
            <FlatList
                ref={flatListRef}
                data={matriculaDisciplinas}
                keyExtractor={(item) => String(item.id)}
                automaticallyAdjustKeyboardInsets={true}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View style={styles.headerSection}>
                        <View style={styles.activityInfoCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.typeBadge}>
                                    <Text style={styles.typeText}>{activity.tipo}</Text>
                                </View>
                                <Text style={styles.cardTitle}>{activity.titulo}</Text>
                            </View>

                            <Text style={styles.cardDates}>
                                Período: {formatDisplayDate(activity.data_inicio)}
                                {activity.data_fim ? ` até ${formatDisplayDate(activity.data_fim)}` : ""}
                            </Text>

                            {activity.descricao ? (
                                <View style={styles.descWrapper}>
                                    <Text style={styles.descText}>{activity.descricao}</Text>
                                </View>
                            ) : null}

                            <View style={styles.actionButtonsRow}>
                                <Pressable style={[styles.actionBtn, styles.editBtn]} onPress={() => setIsEditModalVisible(true)}>
                                    <Ionicons name="pencil" size={16} color="#52B28B" />
                                    <Text style={styles.editBtnText}>Editar</Text>
                                </Pressable>
                                <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDeleteActivity}>
                                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                                    <Text style={styles.deleteBtnText}>Excluir</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.gradingHeader}>
                            <Ionicons name="people-outline" size={20} color="#1D8C43" />
                            <Text style={styles.gradingTitle}>Notas dos Alunos ({matriculaDisciplinas.length})</Text>
                        </View>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <GradeStudentRow
                        matriculaDisciplina={item}
                        value={gradesState[item.id]}
                        onChangeText={(text) => handleGradeChange(item.id, text)}
                        disabled={isSavingGrades}
                        onFocus={() => {
                            setTimeout(() => {
                                try {
                                    flatListRef.current?.scrollToIndex({
                                        index,
                                        animated: true,
                                        viewPosition: 0.3,
                                    });
                                } catch (error) {
                                    console.warn("Failed to scroll to index:", error);
                                }
                            }, 150);
                        }}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-circle-outline" size={56} color="#9ca3af" />
                        <Text style={styles.emptyText}>Nenhum aluno matriculado nesta turma.</Text>
                    </View>
                }
                ListFooterComponent={
                    matriculaDisciplinas.length > 0 ? (
                        <View style={styles.footerActions}>
                            <Pressable 
                                style={styles.saveGradesBtn} 
                                onPress={handleSaveGrades}
                                disabled={isSavingGrades}
                            >
                                {isSavingGrades ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="#ffffff" />
                                        <Text style={styles.saveGradesBtnText}>Gravar Notas dos Alunos</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    ) : null
                }
                contentContainerStyle={[
                    styles.listContainer,
                    { paddingBottom: 120 + (Platform.OS === "android" ? keyboardHeight : 0) }
                ]}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal: Edit Activity */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Atividade</Text>
                            <Pressable onPress={() => setIsEditModalVisible(false)}>
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
                            <Pressable style={styles.footerCancelBtn} onPress={() => setIsEditModalVisible(false)}>
                                <Text style={styles.footerCancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={styles.footerSaveBtn}
                                onPress={handleSubmit(handleUpdateActivitySubmit)}
                                disabled={updateAtividadeMutation.isPending}
                            >
                                {updateAtividadeMutation.isPending ? (
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
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#374151",
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: "#52B28B",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    backButtonText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 15,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    headerSection: {
        paddingVertical: 16,
    },
    activityInfoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },
    cardHeader: {
        marginBottom: 10,
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
        fontSize: 20,
        fontWeight: "800",
        color: "#1f2937",
    },
    cardDates: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 12,
    },
    descWrapper: {
        backgroundColor: "#f9fafb",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        marginBottom: 16,
    },
    descText: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 20,
    },
    actionButtonsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1.5,
        gap: 6,
    },
    editBtn: {
        borderColor: "#52B28B",
        backgroundColor: "#ffffff",
    },
    editBtnText: {
        color: "#52B28B",
        fontWeight: "700",
        fontSize: 14,
    },
    deleteBtn: {
        borderColor: "#dc2626",
        backgroundColor: "#ffffff",
    },
    deleteBtnText: {
        color: "#dc2626",
        fontWeight: "700",
        fontSize: 14,
    },
    gradingHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    gradingTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: "#6b7280",
    },
    footerActions: {
        marginTop: 20,
    },
    saveGradesBtn: {
        backgroundColor: "#52B28B",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 10,
        gap: 8,
        shadowColor: "#52B28B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    saveGradesBtnText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 15,
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
