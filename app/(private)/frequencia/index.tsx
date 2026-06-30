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
    Dimensions,
    Platform
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useQueryClient, useQueries } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useOfertaDisciplinasInfiniteQuery } from "@/api/ofertadisciplina";
import { useMatriculaDisciplinasByOfertaQuery } from "@/api/matriculadisciplina";
import { createFrequencia, updateFrequencia, getFrequenciasByMatriculaDisciplina } from "@/api/frequencia";
import { RestrictedAccess } from "@/components/restricted-access";
import { StudentAttendanceRow } from "@/components/gerenciar/frequencia-student-row";
import { OfertaDisciplina } from "@/types/ofertadisciplina";
import { Frequencia } from "@/types/frequencia";

const { height } = Dimensions.get("window");

const AttendanceSkeleton = () => {
    return (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} style={styles.skeletonRow}>
                    <View style={styles.skeletonLeft}>
                        <View style={styles.skeletonName} />
                        <View style={styles.skeletonMatricula} />
                    </View>
                    <View style={styles.skeletonRight} />
                </View>
            ))}
        </View>
    );
};

export default function FrequenciaScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Check RBAC
    const hasAccess = useMemo(() => {
        if (!user || !user.role) return false;
        return user.role.includes("admin") || user.role.includes("professor");
    }, [user]);

    // Local states
    const [selectedOferta, setSelectedOferta] = useState<OfertaDisciplina | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    });

    const [isOfertaModalVisible, setIsOfertaModalVisible] = useState(false);
    const [offeringSearch, setOfferingSearch] = useState("");
    const [debouncedOfferingSearch, setDebouncedOfferingSearch] = useState("");

    // Attendance mapping states (keyed by offering ID, then date, then student matricula-disciplina ID)
    const [attendanceState, setAttendanceState] = useState<
        Record<number, Record<string, Record<number, { situacao: boolean | null; justificativa: string; existingFrequencia?: Frequencia }>>>
    >({});

    // Justification Modal states
    const [justificationModalVisible, setJustificationModalVisible] = useState(false);
    const [currentJustificationStudentId, setCurrentJustificationStudentId] = useState<number | null>(null);
    const [tempJustification, setTempJustification] = useState("");

    // Saving progress states
    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Debounce search in offering picker
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedOfferingSearch(offeringSearch);
        }, 300);
        return () => clearTimeout(handler);
    }, [offeringSearch]);

    // Fetch offerings for selection modal
    const {
        data: offeringsData,
        fetchNextPage: fetchNextOfferings,
        hasNextPage: hasNextOfferings,
        isFetchingNextPage: isFetchingNextOfferings,
        isLoading: isLoadingOfferings
    } = useOfertaDisciplinasInfiniteQuery();

    const offerings = useMemo(() => {
        if (!offeringsData?.pages) return [];
        return offeringsData.pages.flatMap((page) => page.data || []);
    }, [offeringsData]);

    const filteredOfferings = useMemo(() => {
        const query = debouncedOfferingSearch.trim().toLowerCase();
        if (!query) return offerings;
        return offerings.filter(o => 
            (o.disciplina?.name || "").toLowerCase().includes(query) ||
            (o.classroom?.name || "").toLowerCase().includes(query) ||
            (o.professor?.name || "").toLowerCase().includes(query)
        );
    }, [offerings, debouncedOfferingSearch]);

    // Fetch enrolled students for selected offering
    const {
        data: matriculaDisciplinasData,
        isLoading: isLoadingStudents,
        refetch: refetchStudents
    } = useMatriculaDisciplinasByOfertaQuery(selectedOferta?.id);

    const matriculaDisciplinas = useMemo(() => {
        if (!matriculaDisciplinasData?.data) return [];
        if (Array.isArray(matriculaDisciplinasData.data)) return matriculaDisciplinasData.data;
        return [];
    }, [matriculaDisciplinasData]);

    // Fetch frequencies for all students in parallel
    const studentQueries = useQueries({
        queries: matriculaDisciplinas.map((md) => ({
            queryKey: ["frequencias", "matricula-disciplina", md.id],
            queryFn: () => getFrequenciasByMatriculaDisciplina(md.id),
            enabled: !!md.id && !isLoadingStudents,
            staleTime: 1000 * 10,
        })),
    });

    const isLoadingFrequencies = useMemo(() => {
        if (matriculaDisciplinas.length === 0) return false;
        return studentQueries.some((q) => q.isLoading);
    }, [studentQueries, matriculaDisciplinas]);

    // Reset student states when offering or date changes

    // Callback when row loads existing frequency data
    const handleRowLoad = useCallback((mdId: number, existingFreq: Frequencia | null) => {
        if (!selectedOferta) return;
        const ofertaId = selectedOferta.id;
        setAttendanceState(prev => {
            const ofertaState = prev[ofertaId] || {};
            const dateState = ofertaState[selectedDate] || {};
            const current = dateState[mdId];
            
            // 1. If database record is identical to what we already have, skip update
            if (
                current && 
                current.existingFrequencia?.id === existingFreq?.id &&
                current.existingFrequencia?.situacao === existingFreq?.situacao &&
                current.existingFrequencia?.justificativa === existingFreq?.justificativa
            ) {
                return prev;
            }

            // 2. Determine if the user has unsaved edits
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
                [ofertaId]: {
                    ...ofertaState,
                    [selectedDate]: {
                        ...dateState,
                        [mdId]: nextState
                    }
                }
            };
        });
    }, [selectedOferta, selectedDate]);

    // Callback when row updates state
    const handleRowChange = useCallback((mdId: number, newState: { situacao: boolean | null; justificativa: string; existingFrequencia?: Frequencia }) => {
        if (!selectedOferta) return;
        const ofertaId = selectedOferta.id;

        setAttendanceState(prev => {
            const ofertaState = prev[ofertaId] || {};
            const dateState = ofertaState[selectedDate] || {};
            return {
                ...prev,
                [ofertaId]: {
                    ...ofertaState,
                    [selectedDate]: {
                        ...dateState,
                        [mdId]: newState
                    }
                }
            };
        });
    }, [selectedOferta, selectedDate]);



    // Date operations
    const handleAddDays = (days: number) => {
        try {
            const parts = selectedDate.split("-");
            const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            date.setDate(date.getDate() + days);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            
            // Keep the loaded state stored inside attendanceState[selectedDate] and avoid clearing it completely on date change
            setSelectedDate(`${year}-${month}-${day}`);
        } catch (e) {
            console.error(e);
        }
    };

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        try {
            const parts = dateStr.split("-");
            if (parts.length === 3) {
                return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
        } catch {}
        return new Date();
    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (date && event.type === "set") {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            setSelectedDate(`${year}-${month}-${day}`);
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

    // Justification Modal operations
    const openJustificationModal = (mdId: number) => {
        if (!selectedOferta) return;
        setCurrentJustificationStudentId(mdId);
        const dateState = attendanceState[selectedOferta.id]?.[selectedDate] || {};
        setTempJustification(dateState[mdId]?.justificativa || "");
        setJustificationModalVisible(true);
    };

    const saveJustification = () => {
        if (currentJustificationStudentId !== null && selectedOferta) {
            const dateState = attendanceState[selectedOferta.id]?.[selectedDate] || {};
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
        if (!selectedOferta) return;

        const dateState = selectedOferta ? (attendanceState[selectedOferta.id]?.[selectedDate] || {}) : {};

        // Check if all students have been graded/called
        const uncalledStudents = matriculaDisciplinas.filter(md => {
            const state = dateState[md.id];
            return !state || state.situacao === null;
        });

        if (uncalledStudents.length > 0) {
            Alert.alert(
                "Chamada Incompleta",
                `Falta realizar a chamada de ${uncalledStudents.length} aluno(s). Por favor, marque P (Presente) ou F (Faltoso) para todos antes de salvar.`
            );
            return;
        }

        setIsSaving(true);
        setSaveProgress(0);

        // Filter only what is different from DB (or needs to be newly created)
        const studentsToSave = matriculaDisciplinas.filter(md => {
            const state = dateState[md.id];
            if (!state) return true; // Save defaults

            // Create new record
            if (!state.existingFrequencia) return true;

            // Update if changed
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
                console.error(`Erro ao salvar frequencia para md_id ${md.id}:`, err);
                failCount++;
            }
            
            setSaveProgress(Math.round(((i + 1) / studentsToSave.length) * 100));
        }

        // Refetch/invalidate queries
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

    const handleLoadMoreOfferings = () => {
        if (hasNextOfferings && !isFetchingNextOfferings) {
            fetchNextOfferings();
        }
    };

    // Render restricted access if no permissions
    if (!hasAccess) {
        return <RestrictedAccess />;
    }

    return (
        <View style={styles.container}>
            {/* Class Selection header */}
            <View style={styles.headerCard}>
                <Pressable onPress={() => setIsOfertaModalVisible(true)} style={styles.selectClassBtn}>
                    <View style={styles.classIconBg}>
                        <Ionicons name="school" size={24} color="#1D8C43" />
                    </View>
                    <View style={styles.selectClassBtnTextContainer}>
                        <Text style={styles.selectClassBtnTitle}>
                            {selectedOferta ? `${selectedOferta.disciplina?.name || "Sem Nome"}` : "Selecionar Turma & Disciplina"}
                        </Text>
                        <Text style={styles.selectClassBtnSub}>
                            {selectedOferta 
                                ? `Turma: ${selectedOferta.classroom?.name || "Sem Turma"}` 
                                : "Toque aqui para escolher a disciplina"
                            }
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                </Pressable>
            </View>

            {/* Date navigation bar */}
            <View style={styles.dateSelectorContainer}>
                <Pressable onPress={() => handleAddDays(-1)} style={styles.dateNavButton} disabled={isSaving}>
                    <Ionicons name="chevron-back" size={22} color="#1D8C43" />
                </Pressable>
                <Pressable 
                    onPress={() => setShowDatePicker(true)} 
                    style={({ pressed }) => [
                        styles.dateDisplayButton,
                        pressed && { opacity: 0.7 }
                    ]}
                    disabled={isSaving}
                >
                    <Ionicons name="calendar-outline" size={18} color="#1D8C43" style={{ marginRight: 8 }} />
                    <Text style={styles.dateDisplayText}>{formatDisplayDate(selectedDate)}</Text>
                </Pressable>
                <Pressable onPress={() => handleAddDays(1)} style={styles.dateNavButton} disabled={isSaving}>
                    <Ionicons name="chevron-forward" size={22} color="#1D8C43" />
                </Pressable>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={parseDate(selectedDate)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {/* Students rolls list */}
            {selectedOferta ? (
                isLoadingStudents || isLoadingFrequencies ? (
                    <AttendanceSkeleton />
                ) : (
                    <FlatList
                        data={matriculaDisciplinas}
                        extraData={attendanceState}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <StudentAttendanceRow
                                matriculaDisciplina={item}
                                selectedDate={selectedDate}
                                value={selectedOferta ? attendanceState[selectedOferta.id]?.[selectedDate]?.[item.id] : undefined}
                                onLoad={(freq) => handleRowLoad(item.id, freq)}
                                onChange={(newState) => handleRowChange(item.id, newState)}
                                onEditJustification={() => openJustificationModal(item.id)}
                                disabled={isSaving}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="people-outline" size={54} color="#d1d5db" />
                                <Text style={styles.emptyText}>Nenhum aluno enturmado nesta oferta.</Text>
                            </View>
                        }
                    />
                )
            ) : (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="book-outline" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyStateTitle}>Diário de Classe</Text>
                    <Text style={styles.emptyStateDesc}>
                        Selecione uma disciplina no topo para carregar a listagem e realizar a chamada diária.
                    </Text>
                    <Pressable 
                        style={styles.emptyStateBtn} 
                        onPress={() => setIsOfertaModalVisible(true)}
                    >
                        <Text style={styles.emptyStateBtnText}>Selecionar Disciplina</Text>
                    </Pressable>
                </View>
            )}

            {/* Bottom Actions Bar */}
            {selectedOferta && matriculaDisciplinas.length > 0 && (
                <View style={styles.bottomBar}>
                    {isSaving && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>Gravando chamada: {saveProgress}%</Text>
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
                                <Text style={styles.saveButtonText}>Gravar Diário de Frequência</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            )}

            {/* Modal: Select Oferta (Class Offering) */}
            <Modal
                visible={isOfertaModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsOfertaModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Disciplina</Text>
                            <Pressable 
                                onPress={() => setIsOfertaModalVisible(false)}
                                style={styles.closeModalBtn}
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </Pressable>
                        </View>

                        {/* Search Input */}
                        <View style={styles.modalSearchContainer}>
                            <Ionicons name="search-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Filtrar por disciplina, turma..."
                                value={offeringSearch}
                                onChangeText={setOfferingSearch}
                                placeholderTextColor="#9ca3af"
                                autoCapitalize="none"
                            />
                            {offeringSearch.length > 0 && (
                                <Pressable onPress={() => setOfferingSearch("")}>
                                    <Ionicons name="close-circle" size={18} color="#9ca3af" />
                                </Pressable>
                            )}
                        </View>

                        {/* Offerings list */}
                        {isLoadingOfferings && offerings.length === 0 ? (
                            <View style={styles.modalCenterContainer}>
                                <ActivityIndicator size="large" color="#52B28B" />
                                <Text style={styles.modalLoadingText}>Buscando disciplinas...</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredOfferings}
                                keyExtractor={(item) => String(item.id)}
                                onEndReached={handleLoadMoreOfferings}
                                onEndReachedThreshold={0.2}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={styles.offeringItem}
                                        onPress={() => {
                                            // Keep other offerings' states stored in the memory cache to prevent loss of unsaved changes
                                            setSelectedOferta(item);
                                            setIsOfertaModalVisible(false);
                                        }}
                                    >

                                        <View style={styles.offeringDetails}>
                                            <Text style={styles.offeringTitle}>
                                                {item.disciplina?.name || `Disciplina ID: ${item.id}`}
                                            </Text>
                                            <View style={styles.offeringMetaRow}>
                                                <Ionicons name="school-outline" size={13} color="#6b7280" />
                                                <Text style={styles.offeringMetaText}>Turma: {item.classroom?.name || "Sem Turma"}</Text>
                                            </View>
                                            <View style={styles.offeringMetaRow}>
                                                <Ionicons name="person-outline" size={13} color="#6b7280" />
                                                <Text style={styles.offeringMetaText} numberOfLines={1}>
                                                    Prof: {item.professor?.name || "Sem Professor"}
                                                </Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                                    </Pressable>
                                )}
                                ListFooterComponent={
                                    isFetchingNextOfferings ? (
                                        <ActivityIndicator size="small" color="#52B28B" style={{ marginVertical: 10 }} />
                                    ) : null
                                }
                                ListEmptyComponent={
                                    <View style={styles.modalCenterContainer}>
                                        <Text style={styles.modalEmptyText}>Nenhuma disciplina encontrada.</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal: Add/Edit Justification */}
            <Modal
                visible={justificationModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setJustificationModalVisible(false)}
            >
                <View style={styles.justificationOverlay}>
                    <View style={styles.justificationCard}>
                        <Text style={styles.justificationTitle}>Justificativa de Falta</Text>
                        <Text style={styles.justificationDesc}>
                            Insira os motivos da ausência do aluno. Esta justificativa será gravada no diário.
                        </Text>
                        <TextInput
                            style={styles.justificationInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Ex: Apresentou atestado médico..."
                            value={tempJustification}
                            onChangeText={setTempJustification}
                            maxLength={500}
                            placeholderTextColor="#9ca3af"
                        />
                        <Text style={styles.justificationCharCount}>
                            {tempJustification.length}/500 caracteres
                        </Text>
                        <View style={styles.justificationActions}>
                            <Pressable 
                                style={[styles.justificationBtn, styles.justificationCancelBtn]}
                                onPress={() => setJustificationModalVisible(false)}
                            >
                                <Text style={styles.justificationCancelText}>Cancelar</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.justificationBtn, styles.justificationConfirmBtn]}
                                onPress={saveJustification}
                            >
                                <Text style={styles.justificationConfirmText}>Confirmar</Text>
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
        backgroundColor: "#f9fafb",
    },
    headerCard: {
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    selectClassBtn: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    classIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#e8f5ed",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    selectClassBtnTextContainer: {
        flex: 1,
    },
    selectClassBtnTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 2,
    },
    selectClassBtnSub: {
        fontSize: 13,
        color: "#6b7280",
    },
    dateSelectorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 6,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    dateNavButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    dateDisplayButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    dateDisplayText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#16331F",
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
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 80,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyStateBtn: {
        backgroundColor: "#52B28B",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    emptyStateBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
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
    // Picker modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: height * 0.75,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
    },
    closeModalBtn: {
        padding: 4,
    },
    modalSearchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    modalSearchInput: {
        flex: 1,
        height: "100%",
        fontSize: 14,
        color: "#1f2937",
    },
    modalCenterContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    modalLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },
    modalEmptyText: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    offeringItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    offeringDetails: {
        flex: 1,
    },
    offeringTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4,
    },
    offeringMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
        gap: 6,
    },
    offeringMetaText: {
        fontSize: 12,
        color: "#6b7280",
    },
    // Justification Modal Styles
    justificationOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    justificationCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 360,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    justificationTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    justificationDesc: {
        fontSize: 13,
        color: "#6b7280",
        lineHeight: 18,
        marginBottom: 16,
    },
    justificationInput: {
        backgroundColor: "#f9fafb",
        borderColor: "#d1d5db",
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 12,
        textAlignVertical: "top",
        fontSize: 14,
        color: "#1f2937",
        height: 100,
    },
    justificationCharCount: {
        fontSize: 11,
        color: "#9ca3af",
        textAlign: "right",
        marginTop: 6,
    },
    justificationActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    justificationBtn: {
        flex: 1,
        height: 46,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    justificationCancelBtn: {
        backgroundColor: "#f3f4f6",
    },
    justificationCancelText: {
        color: "#4b5563",
        fontSize: 14,
        fontWeight: "600",
    },
    justificationConfirmBtn: {
        backgroundColor: "#52B28B",
    },
    justificationConfirmText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    skeletonContainer: {
        paddingVertical: 4,
    },
    skeletonRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    skeletonLeft: {
        flex: 1,
        gap: 6,
    },
    skeletonName: {
        width: "60%",
        height: 16,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
    },
    skeletonMatricula: {
        width: "40%",
        height: 12,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
    },
    skeletonRight: {
        width: 78,
        height: 36,
        backgroundColor: "#e5e7eb",
        borderRadius: 8,
    },
});
