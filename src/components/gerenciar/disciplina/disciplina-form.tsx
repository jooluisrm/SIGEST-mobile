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
import { Disciplina } from "@/types/disciplina";
import { useClassroomsInfiniteQuery } from "@/api/turma";
import { useProfessorsInfiniteQuery } from "@/api/professor";
import { cadastroDisciplinaSchema, CadastroDisciplinaFormData } from "@/schema/cadastro-disciplina";

type Props = {
    onSubmit: (dados: CadastroDisciplinaFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    errorMessages?: Record<string, string[]>;
    onClearError?: (field: string) => void;
    initialData?: Disciplina;
};

export const DisciplinaForm = ({ 
    onSubmit, 
    onCancel, 
    isLoading = false, 
    errorMessages, 
    onClearError,
    initialData
}: Props) => {
    // Modal states
    const [classroomModalVisible, setClassroomModalVisible] = useState(false);
    const [professorModalVisible, setProfessorModalVisible] = useState(false);
    
    // Search terms inside modals
    const [classroomSearch, setClassroomSearch] = useState("");
    const [debouncedClassroomSearch, setDebouncedClassroomSearch] = useState("");
    const [professorSearch, setProfessorSearch] = useState("");
    const [debouncedProfessorSearch, setDebouncedProfessorSearch] = useState("");

    // Display names
    const [selectedClassroomName, setSelectedClassroomName] = useState("");
    const [selectedProfessorName, setSelectedProfessorName] = useState("");

    const hasInitialized = useRef(false);

    // React Hook Form initialization
    const { 
        control, 
        handleSubmit, 
        setValue, 
        watch,
        formState: { errors } 
    } = useForm<CadastroDisciplinaFormData>({
        resolver: zodResolver(cadastroDisciplinaSchema),
        defaultValues: {
            name: initialData?.name || "",
            area_conhecimento: initialData?.area_conhecimento || "",
            carga_horaria: initialData?.carga_horaria || "",
            ementa: initialData?.ementa || "",
            classroom_id: initialData?.classroom_id || 0,
            professor_id: initialData?.professor_id || 0,
            status: initialData ? (initialData.status === true || initialData.status === 1) : true,
        }
    });

    const watchClassroomId = watch("classroom_id");
    const watchProfessorId = watch("professor_id");
    const watchStatus = watch("status");

    // Debounce classroom search text
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedClassroomSearch(classroomSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [classroomSearch]);

    // Debounce professor search text
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedProfessorSearch(professorSearch);
        }, 500);
        return () => clearTimeout(handler);
    }, [professorSearch]);

    // Fetch Classrooms and Professors
    const { 
        data: classroomsResponse, 
        isLoading: isLoadingClassrooms,
        fetchNextPage: fetchNextClassroomsPage,
        hasNextPage: hasNextClassroomsPage,
        isFetchingNextPage: isFetchingNextClassroomsPage
    } = useClassroomsInfiniteQuery(debouncedClassroomSearch);

    const { 
        data: professorsResponse, 
        isLoading: isLoadingProfessors,
        fetchNextPage: fetchNextProfessorsPage,
        hasNextPage: hasNextProfessorsPage,
        isFetchingNextPage: isFetchingNextProfessorsPage
    } = useProfessorsInfiniteQuery(debouncedProfessorSearch);

    // Flatten lists
    const classrooms = useMemo(() => {
        if (!classroomsResponse?.pages) return [];
        return classroomsResponse.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            if (Array.isArray(page.data)) return page.data;
            if (typeof page.data === "object" && "data" in page.data && Array.isArray(page.data.data)) {
                return page.data.data;
            }
            return [];
        });
    }, [classroomsResponse]);

    const professors = useMemo(() => {
        if (!professorsResponse?.pages) return [];
        return professorsResponse.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            if (Array.isArray(page.data)) return page.data;
            return [];
        });
    }, [professorsResponse]);

    // Initialize edit fields once
    useEffect(() => {
        if (initialData && !hasInitialized.current) {
            setValue("name", initialData.name);
            setValue("area_conhecimento", initialData.area_conhecimento);
            setValue("carga_horaria", initialData.carga_horaria);
            setValue("ementa", initialData.ementa);
            setValue("classroom_id", initialData.classroom_id);
            setValue("professor_id", initialData.professor_id);
            setValue("status", initialData.status === true || initialData.status === 1);
            hasInitialized.current = true;
        }
    }, [initialData, setValue]);

    // Resolve Classroom display name
    useEffect(() => {
        if (watchClassroomId && classrooms.length > 0) {
            const match = classrooms.find((c) => c.id === watchClassroomId);
            if (match) {
                setSelectedClassroomName(match.name);
            }
        } else if (initialData && watchClassroomId === initialData.classroom_id && !selectedClassroomName) {
            // Safe fallback if the matched items haven't loaded yet
            setSelectedClassroomName(`Turma #${watchClassroomId}`);
        }
    }, [watchClassroomId, classrooms, initialData]);

    // Resolve Professor display name
    useEffect(() => {
        if (watchProfessorId && professors.length > 0) {
            const match = professors.find((p) => p.id_professor === watchProfessorId);
            if (match) {
                setSelectedProfessorName(match.name);
            }
        } else if (initialData && watchProfessorId === initialData.professor_id && !selectedProfessorName) {
            setSelectedProfessorName(`Professor #${watchProfessorId}`);
        }
    }, [watchProfessorId, professors, initialData]);

    const getFieldError = (key: string): string | undefined => {
        if (errors[key as keyof CadastroDisciplinaFormData]) {
            return errors[key as keyof CadastroDisciplinaFormData]?.message;
        }
        if (errorMessages) {
            if (errorMessages[key]) return errorMessages[key][0];
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (errorMessages[snakeKey]) return errorMessages[snakeKey][0];
        }
        return undefined;
    };

    const handleInputChange = (field: keyof CadastroDisciplinaFormData, value: any) => {
        setValue(field, value);
        if (onClearError) {
            onClearError(String(field));
            const snakeKey = String(field).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (snakeKey !== String(field)) {
                onClearError(snakeKey);
            }
        }
    };

    const handleSelectClassroom = (id: number, name: string) => {
        handleInputChange("classroom_id", id);
        setSelectedClassroomName(name);
        setClassroomModalVisible(false);
    };

    const handleSelectProfessor = (id: number, name: string) => {
        handleInputChange("professor_id", id);
        setSelectedProfessorName(name);
        setProfessorModalVisible(false);
    };

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
                        {isEdit ? "Informações da Disciplina" : "Nova Disciplina"}
                    </Text>
                    
                    {/* Campo: Nome */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Nome da Disciplina *</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("name") && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("name", text);
                                    }}
                                    placeholder="Ex: Matemática"
                                    placeholderTextColor="#9ca3af"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("name") && (
                            <Text style={styles.errorText}>{getFieldError("name")}</Text>
                        )}
                    </View>

                    {/* Campo: Área de Conhecimento */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Área de Conhecimento *</Text>
                        <Controller
                            control={control}
                            name="area_conhecimento"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("area_conhecimento") && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("area_conhecimento", text);
                                    }}
                                    placeholder="Ex: Ciências da Natureza"
                                    placeholderTextColor="#9ca3af"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("area_conhecimento") && (
                            <Text style={styles.errorText}>{getFieldError("area_conhecimento")}</Text>
                        )}
                    </View>

                    {/* Campo: Carga Horária */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Carga Horária *</Text>
                        <Controller
                            control={control}
                            name="carga_horaria"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textInput, 
                                        !!getFieldError("carga_horaria") && styles.textInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("carga_horaria", text);
                                    }}
                                    placeholder="Ex: 80h ou 120 horas"
                                    placeholderTextColor="#9ca3af"
                                    autoCorrect={false}
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("carga_horaria") && (
                            <Text style={styles.errorText}>{getFieldError("carga_horaria")}</Text>
                        )}
                    </View>

                    {/* Campo: Ementa */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Ementa *</Text>
                        <Controller
                            control={control}
                            name="ementa"
                            render={({ field }) => (
                                <TextInput
                                    style={[
                                        styles.textAreaInput, 
                                        !!getFieldError("ementa") && styles.textAreaInputError,
                                    ]}
                                    value={field.value}
                                    onChangeText={(text) => {
                                        field.onChange(text);
                                        handleInputChange("ementa", text);
                                    }}
                                    placeholder="Conteúdo programático e ementa..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!isLoading}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        {!!getFieldError("ementa") && (
                            <Text style={styles.errorText}>{getFieldError("ementa")}</Text>
                        )}
                    </View>

                    {/* Campo: Turma */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Turma *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("classroom_id") && styles.selectInputError,
                            ]}
                            onPress={() => setClassroomModalVisible(true)}
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

                    {/* Campo: Professor */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Professor *</Text>
                        <Pressable
                            style={[
                                styles.selectInput, 
                                !!getFieldError("professor_id") && styles.selectInputError,
                            ]}
                            onPress={() => setProfessorModalVisible(true)}
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

                    {/* Campo: Status */}
                    <View style={styles.switchWrapper}>
                        <View style={styles.switchLabelContainer}>
                            <Text style={styles.label}>Disciplina Ativa</Text>
                            <Text style={styles.switchSublabel}>
                                Disciplinas inativas não aparecem nos boletins ou horários letivos.
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
                    onPress={handleSubmit(onSubmit)} 
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

            {/* Classroom Picker Modal */}
            <Modal
                visible={classroomModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setClassroomModalVisible(false)}
            >
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Selecione a Turma</Text>
                        
                        <View style={styles.pickerSearchContainer}>
                            <Ionicons name="search" size={16} color="#9ca3af" />
                            <TextInput
                                style={styles.pickerSearchInput}
                                value={classroomSearch}
                                onChangeText={setClassroomSearch}
                                placeholder="Buscar turma..."
                                placeholderTextColor="#9ca3af"
                                autoCorrect={false}
                            />
                        </View>

                        {isLoadingClassrooms && classrooms.length === 0 ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.pickerLoadingText}>Carregando turmas...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={classrooms}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.pickerOption}
                                        onPress={() => handleSelectClassroom(item.id, item.name)}
                                    >
                                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                                    </Pressable>
                                )}
                                onEndReached={() => {
                                    if (hasNextClassroomsPage && !isFetchingNextClassroomsPage) {
                                        fetchNextClassroomsPage();
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={() => 
                                    isFetchingNextClassroomsPage ? (
                                        <ActivityIndicator size="small" color="#52B28B" style={{ padding: 10 }} />
                                    ) : null
                                }
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <Text style={styles.pickerEmptyText}>Nenhuma turma encontrada.</Text>
                                    </View>
                                )}
                            />
                        )}
                        
                        <Pressable 
                            style={styles.pickerCloseButton} 
                            onPress={() => setClassroomModalVisible(false)}
                        >
                            <Text style={styles.pickerCloseButtonText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Professor Picker Modal */}
            <Modal
                visible={professorModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setProfessorModalVisible(false)}
            >
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Selecione o Professor</Text>
                        
                        <View style={styles.pickerSearchContainer}>
                            <Ionicons name="search" size={16} color="#9ca3af" />
                            <TextInput
                                style={styles.pickerSearchInput}
                                value={professorSearch}
                                onChangeText={setProfessorSearch}
                                placeholder="Buscar professor por nome..."
                                placeholderTextColor="#9ca3af"
                                autoCorrect={false}
                            />
                        </View>

                        {isLoadingProfessors && professors.length === 0 ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.pickerLoadingText}>Carregando professores...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={professors}
                                keyExtractor={(item) => String(item.id_professor)}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.pickerOption}
                                        onPress={() => handleSelectProfessor(item.id_professor, item.name)}
                                    >
                                        <Text style={styles.pickerOptionText}>{item.name}</Text>
                                    </Pressable>
                                )}
                                onEndReached={() => {
                                    if (hasNextProfessorsPage && !isFetchingNextProfessorsPage) {
                                        fetchNextProfessorsPage();
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListFooterComponent={() => 
                                    isFetchingNextProfessorsPage ? (
                                        <ActivityIndicator size="small" color="#52B28B" style={{ padding: 10 }} />
                                    ) : null
                                }
                                ListEmptyComponent={() => (
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <Text style={styles.pickerEmptyText}>Nenhum professor encontrado.</Text>
                                    </View>
                                )}
                            />
                        )}
                        
                        <Pressable 
                            style={styles.pickerCloseButton} 
                            onPress={() => setProfessorModalVisible(false)}
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
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    inputWrapper: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    textInput: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
        fontSize: 15,
        color: "#1f2937",
    },
    textInputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2",
    },
    textAreaInput: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#1f2937",
        minHeight: 100,
    },
    textAreaInputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2",
    },
    selectInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
    },
    selectInputError: {
        borderColor: "#ef4444",
        backgroundColor: "#fef2f2",
    },
    selectInputText: {
        fontSize: 15,
        color: "#1f2937",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    switchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.03)",
        marginTop: 10,
    },
    switchLabelContainer: {
        flex: 1,
        paddingRight: 10,
        gap: 4,
    },
    switchSublabel: {
        fontSize: 12,
        color: "#6b7280",
    },
    errorText: {
        fontSize: 12,
        color: "#ef4444",
        fontWeight: "500",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        padding: 20,
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4b5563",
    },
    submitButton: {
        flex: 2,
        backgroundColor: "#52B28B",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#ffffff",
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    pickerModal: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        maxHeight: "75%",
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 14,
    },
    pickerSearchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 10 : 8,
        marginBottom: 16,
        gap: 8,
    },
    pickerSearchInput: {
        flex: 1,
        fontSize: 15,
        color: "#1f2937",
        padding: 0,
    },
    pickerLoading: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        gap: 12,
    },
    pickerLoadingText: {
        fontSize: 14,
        color: "#6b7280",
    },
    pickerOption: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    pickerOptionText: {
        fontSize: 16,
        color: "#374151",
    },
    pickerEmptyText: {
        fontSize: 14,
        color: "#6b7280",
    },
    pickerCloseButton: {
        backgroundColor: "#f3f4f6",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
    },
    pickerCloseButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4b5563",
    },
});
