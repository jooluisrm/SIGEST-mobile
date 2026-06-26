import React, { useMemo } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOfertaDisciplinaQuery } from "@/api/ofertadisciplina";
import { useMatriculaDisciplinasByOfertaQuery } from "@/api/matriculadisciplina";

export default function TurmaInfoScreen() {
    const { id } = useGlobalSearchParams<{ id: string }>();

    const { data: offeringResponse, isLoading: isLoadingOffering } = useOfertaDisciplinaQuery(id);
    const offering = useMemo(() => {
        if (!offeringResponse?.data) return null;
        if (Number(offeringResponse.data.id) !== Number(id)) return null;
        return offeringResponse.data;
    }, [offeringResponse, id]);

    const { data: studentsResponse, isLoading: isLoadingStudents } = useMatriculaDisciplinasByOfertaQuery(id);
    const enrolledStudents = useMemo(() => {
        if (!studentsResponse?.data) return [];
        const rawData = studentsResponse.data;
        const data = Array.isArray(rawData)
            ? rawData
            : (typeof rawData === "object" && "data" in rawData && Array.isArray(rawData.data) ? rawData.data : []);
        return data;
    }, [studentsResponse]);

    const isDataMismatched = useMemo(() => {
        const offeringMismatch = offeringResponse?.data && Number(offeringResponse.data.id) !== Number(id);
        return !!offeringMismatch;
    }, [offeringResponse, id]);

    const isLoading = isLoadingOffering || isLoadingStudents || isDataMismatched;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando informações da turma...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                    <Ionicons name="school" size={24} color="#ffffff" />
                    <Text style={styles.cardHeaderTitle}>Detalhes da Disciplina</Text>
                </View>
                
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Disciplina:</Text>
                        <Text style={styles.infoValue}>{offering?.disciplina?.name || "N/A"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Turma:</Text>
                        <Text style={styles.infoValue}>{offering?.classroom?.name || "N/A"}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Carga Horária:</Text>
                        <Text style={styles.infoValue}>{offering?.disciplina?.carga_horaria ? `${offering.disciplina.carga_horaria}h` : "N/A"}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Período Letivo:</Text>
                        <Text style={styles.infoValue}>{offering?.periodo_letivo?.name || "N/A"}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.studentsHeader}>
                <Ionicons name="people-outline" size={20} color="#1D8C43" />
                <Text style={styles.studentsTitle}>Alunos Matriculados ({enrolledStudents.length})</Text>
            </View>

            <FlatList
                data={enrolledStudents}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                    <View style={styles.studentCard}>
                        <View style={styles.studentNumberBg}>
                            <Text style={styles.studentNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.studentInfo}>
                            <Text style={styles.studentName}>
                                {item.matricula?.aluno?.name || "Aluno Desconhecido"}
                            </Text>
                            <Text style={styles.studentMatricula}>
                                Matrícula: {item.matricula?.codigo_matricula || "Sem Matrícula"}
                            </Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-circle-outline" size={56} color="#9ca3af" />
                        <Text style={styles.emptyText}>Nenhum aluno matriculado nesta disciplina.</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
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
    infoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#52B28B",
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 10,
    },
    cardHeaderTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "700",
    },
    cardBody: {
        padding: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        paddingBottom: 8,
    },
    infoLabel: {
        fontWeight: "600",
        color: "#4b5563",
        fontSize: 14,
    },
    infoValue: {
        color: "#111827",
        fontSize: 14,
        fontWeight: "500",
    },
    studentsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    studentsTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1f2937",
    },
    studentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.01,
        shadowRadius: 2,
        elevation: 1,
    },
    studentNumberBg: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#def7ec",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    studentNumberText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1D8C43",
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 2,
    },
    studentMatricula: {
        fontSize: 12,
        color: "#9ca3af",
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
});
