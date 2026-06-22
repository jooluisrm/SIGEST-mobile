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
import { OfertaDisciplina } from "@/types/ofertadisciplina";
import { useDisciplinasInfiniteQuery } from "@/api/disciplina";
import { useClassroomsInfiniteQuery } from "@/api/turma";
import { useProfessorsInfiniteQuery } from "@/api/professor";
import { usePeriodosLetivosInfiniteQuery } from "@/api/periodoletivo";
import { cadastroOfertaDisciplinaSchema, CadastroOfertaDisciplinaFormData } from "@/schema/cadastro-ofertadisciplina";

type Props = {
    onSubmit: (dados: CadastroOfertaDisciplinaFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: OfertaDisciplina;
};

type ModalType = "disciplina" | "classroom" | "professor" | "periodo_letivo" | null;

export const OfertaDisciplinaForm = ({ 
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

    // Names for display
    const [selectedDisciplineName, setSelectedDisciplineName] = useState("");
    const [selectedClassroomName, setSelectedClassroomName] = useState("");
    const [selectedProfessorName, setSelectedProfessorName] = useState("");
    const [selectedPeriodoLetivoName, setSelectedPeriodoLetivoName] = useState("");

    const { 
        control, 
        handleSubmit, 
        setValue, 
        watch,
        formState: { errors } 
    } = useForm<CadastroOfertaDisciplinaFormData>({
        resolver: zodResolver(cadastroOfertaDisciplinaSchema),
        defaultValues: {
            disciplina_id: initialData?.disciplina?.id || 0,
            classroom_id: initialData?.classroom?.id || 0,
            professor_id: initialData?.professor?.id_professor || 0,
            periodo_letivo_id: initialData?.periodo_letivo?.id || 0,
            status: initialData ? (initialData.status === true || initialData.status === 1) : true,
        }
    });

    const watchStatus = watch("status");
    const watchDisciplinaId = watch("disciplina_id");
    const watchClassroomId = watch("classroom_id");
    const watchProfessorId = watch("professor_id");
    const watchPeriodoLetivoId = watch("periodo_letivo_id");

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

    // Hydrate names on edit
    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setValue("disciplina_id", initialData.disciplina?.id || 0);
            setValue("classroom_id", initialData.classroom?.id || 0);
            setValue("professor_id", initialData.professor?.id_professor || 0);
            setValue("periodo_letivo_id", initialData.periodo_letivo?.id || 0);
            setValue("status", initialData.status === true || initialData.status === 1);
            
            if (initialData.disciplina) setSelectedDisciplineName(initialData.disciplina.name);
            if (initialData.classroom) setSelectedClassroomName(initialData.classroom.name);
            if (initialData.professor) setSelectedProfessorName(initialData.professor.name);
            if (initialData.periodo_letivo) setSelectedPeriodoLetivoName(initialData.periodo_letivo.name);
            
            hasInitialized.current = true;
        }
    }, [initialData, setValue]);

    // Queries for pickers
    const { 
        data: disciplinesData, 
        fetchNextPage: fetchNextDisciplines, 
        hasNextPage: hasNextDisciplines, 
        isFetchingNextPage: isFetchingNextDisciplines,
        isLoading: isLoadingDisciplines 
    } = useDisciplinasInfiniteQuery(activeModal === "disciplina" ? debouncedSearch : "");

    const { 
        data: classroomsData, 
        fetchNextPage: fetchNextClassrooms, 
        hasNextPage: hasNextClassrooms, 
        isFetchingNextPage: isFetchingNextClassrooms,
        isLoading: isLoadingClassrooms 
    } = useClassroomsInfiniteQuery(activeModal === "classroom" ? debouncedSearch : "");

    const { 
        data: professorsData, 
        fetchNextPage: fetchNextProfessors, 
        hasNextPage: hasNextProfessors, 
        isFetchingNextPage: isFetchingNextProfessors,
        isLoading: isLoadingProfessors 
    } = useProfessorsInfiniteQuery(activeModal === "professor" ? debouncedSearch : "");

    const { 
        data: periodosLetivosData, 
        fetchNextPage: fetchNextPeriodosLetivos, 
        hasNextPage: hasNextPeriodosLetivos, 
        isFetchingNextPage: isFetchingNextPeriodosLetivos,
        isLoading: isLoadingPeriodosLetivos 
    } = usePeriodosLetivosInfiniteQuery(activeModal === "periodo_letivo" ? debouncedSearch : "");

    // Flatten data helpers
    const disciplines = useMemo(() => {
        if (!disciplinesData?.pages) return [];
        return disciplinesData.pages.flatMap((page) => page.data || []);
    }, [disciplinesData]);

    const classrooms = useMemo(() => {
        if (!classroomsData?.pages) return [];
        return classroomsData.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            if (Array.isArray(page.data)) return page.data;
            if (typeof page.data === "object" && "data" in page.data && Array.isArray(page.data.data)) {
                return page.data.data;
            }
            return [];
        });
    }, [classroomsData]);

    const professors = useMemo(() => {
        if (!professorsData?.pages) return [];
        return professorsData.pages.flatMap((page) => page.data || []);
    }, [professorsData]);

    const periodosLetivos = useMemo(() => {
        if (!periodosLetivosData?.pages) return [];
        return periodosLetivosData.pages.flatMap((page) => page.data || []);
    }, [periodosLetivosData]);

    const getFieldError = (key: string): string | undefined => {
        if (errors[key as keyof CadastroOfertaDisciplinaFormData]) {
            return errors[key as keyof CadastroOfertaDisciplinaFormData]?.message;
        }
        if (errorMessages) {
            if (errorMessages[key]) return errorMessages[key][0];
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (errorMessages[snakeKey]) return errorMessages[snakeKey][0];
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CadastroOfertaDisciplinaFormData, value: any) => {
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
        if (type === "disciplina") {
            handleInputChange("disciplina_id", id);
            setSelectedDisciplineName(name);
        } else if (type === "classroom") {
            handleInputChange("classroom_id", id);
            setSelectedClassroomName(name);
        } else if (type === "professor") {
            handleInputChange("professor_id", id);
            setSelectedProfessorName(name);
        } else if (type === "periodo_letivo") {
            handleInputChange("periodo_letivo_id", id);
            setSelectedPeriodoLetivoName(name);
        }
        setActiveModal(null);
    };

    const onFormSubmit = (data: CadastroOfertaDisciplinaFormData) => {
        onSubmit(data);
    };

    // Modal render helper
    const getModalItems = () => {
        if (activeModal === "disciplina") {
            return {
                data: disciplines,
                isLoading: isLoadingDisciplines,
                isFetchingNext: isFetchingNextDisciplines,
                hasNext: hasNextDisciplines,
                fetchNext: fetchNextDisciplines,
                placeholder: "Buscar disciplina...",
                title: "Selecionar Disciplina",
                keyExtractor: (item: any) => String(item.id),
                renderItem: ({ item }: { item: any }) => (
                    <Pressable 
                        style={styles.pickerOption}
                        onPress={() => handleSelectOption("disciplina", item.id, item.name)}
                    >
                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                        <Text style={styles.pickerOptionSubtitle}>{item.carga_horaria} horas</Text>
                    </Pressable>
                )
            };
        }
        if (activeModal === "classroom") {
            return {
                data: classrooms,
                isLoading: isLoadingClassrooms,
                isFetchingNext: isFetchingNextClassrooms,
                hasNext: hasNextClassrooms,
                fetchNext: fetchNextClassrooms,
                placeholder: "Buscar turma...",
                title: "Selecionar Turma",
                keyExtractor: (item: any) => String(item.id),
                renderItem: ({ item }: { item: any }) => (
                    <Pressable 
                        style={styles.pickerOption}
                        onPress={() => handleSelectOption("classroom", item.id, item.name)}
                    >
                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                        <Text style={styles.pickerOptionSubtitle}>{item.shift}</Text>
                    </Pressable>
                )
            };
        }
        if (activeModal === "professor") {
            return {
                data: professors,
                isLoading: isLoadingProfessors,
                isFetchingNext: isFetchingNextProfessors,
                hasNext: hasNextProfessors,
                fetchNext: fetchNextProfessors,
                placeholder: "Buscar professor...",
                title: "Selecionar Professor",
                keyExtractor: (item: any) => String(item.id_professor),
                renderItem: ({ item }: { item: any }) => (
                    <Pressable 
                        style={styles.pickerOption}
                        onPress={() => handleSelectOption("professor", item.id_professor, item.name)}
                    >
                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                        <Text style={styles.pickerOptionSubtitle}>Matrícula: {item.matricula_adpm}</Text>
                    </Pressable>
                )
            };
        }
        if (activeModal === "periodo_letivo") {
            return {
                data: periodosLetivos,
                isLoading: isLoadingPeriodosLetivos,
                isFetchingNext: isFetchingNextPeriodosLetivos,
                hasNext: hasNextPeriodosLetivos,
                fetchNext: fetchNextPeriodosLetivos,
                placeholder: "Buscar período letivo...",
                title: "Selecionar Período Letivo",
                keyExtractor: (item: any) => String(item.id),
                renderItem: ({ item }: { item: any }) => (
                    <Pressable 
                        style={styles.pickerOption}
                        onPress={() => handleSelectOption("periodo_letivo", item.id, item.name)}
                    >
                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                        <Text style={styles.pickerOptionSubtitle}>
                            {item.status ? "Ativo" : "Inativo"}
                        </Text>
                    </Pressable>
                )
            };
        }
        return null;
    };

    const modalConfig = getModalItems();
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
                        {isEdit ? "Editar Oferta" : "Nova Oferta de Disciplina"}
                    </Text>

                    {/* Selector: Disciplina */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Disciplina *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("disciplina_id") && styles.selectInputError,
                                activeModal === "disciplina" && styles.selectInputFocused
                            ]}
                            onPress={() => setActiveModal("disciplina")}
                            disabled={isLoading}
                        >
                            <Text style={[styles.selectInputText, !selectedDisciplineName && styles.placeholderText]}>
                                {selectedDisciplineName || "Selecione a disciplina"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {!!getFieldError("disciplina_id") && (
                            <Text style={styles.errorText}>{getFieldError("disciplina_id")}</Text>
                        )}
                    </View>

                    {/* Selector: Turma */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Turma *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("classroom_id") && styles.selectInputError,
                                activeModal === "classroom" && styles.selectInputFocused
                            ]}
                            onPress={() => setActiveModal("classroom")}
                            disabled={isLoading}
                        >
                            <Text style={[styles.selectInputText, !selectedClassroomName && styles.placeholderText]}>
                                {selectedClassroomName || "Selecione a turma"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {!!getFieldError("classroom_id") && (
                            <Text style={styles.errorText}>{getFieldError("classroom_id")}</Text>
                        )}
                    </View>

                    {/* Selector: Professor */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Professor *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("professor_id") && styles.selectInputError,
                                activeModal === "professor" && styles.selectInputFocused
                            ]}
                            onPress={() => setActiveModal("professor")}
                            disabled={isLoading}
                        >
                            <Text style={[styles.selectInputText, !selectedProfessorName && styles.placeholderText]}>
                                {selectedProfessorName || "Selecione o professor"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {!!getFieldError("professor_id") && (
                            <Text style={styles.errorText}>{getFieldError("professor_id")}</Text>
                        )}
                    </View>

                    {/* Selector: Periodo Letivo */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Período Letivo *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("periodo_letivo_id") && styles.selectInputError,
                                activeModal === "periodo_letivo" && styles.selectInputFocused
                            ]}
                            onPress={() => setActiveModal("periodo_letivo")}
                            disabled={isLoading}
                        >
                            <Text style={[styles.selectInputText, !selectedPeriodoLetivoName && styles.placeholderText]}>
                                {selectedPeriodoLetivoName || "Selecione o período letivo"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6b7280" />
                        </Pressable>
                        {!!getFieldError("periodo_letivo_id") && (
                            <Text style={styles.errorText}>{getFieldError("periodo_letivo_id")}</Text>
                        )}
                    </View>

                    {/* Field: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Oferta Ativa</Text>
                            <Text style={styles.switchSublabel}>
                                Ofertas inativas bloqueiam a enturmação de alunos ou diários de classe.
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
                            {isEdit ? "Salvar" : "Ofertar"}
                        </Text>
                    )}
                </Pressable>
            </View>

            {/* Reusable Selector Modal */}
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
                            
                            {/* Search bar inside picker */}
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

                            {modalConfig.isLoading ? (
                                <View style={styles.pickerLoading}>
                                    <ActivityIndicator size="large" color="#52B28B" />
                                    <Text style={styles.pickerLoadingText}>Buscando registros...</Text>
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
