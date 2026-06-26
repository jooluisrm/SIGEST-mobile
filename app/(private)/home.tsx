import React, { useState } from "react";
import { StyleSheet, View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ButtonMenu } from "@/components/button-menu";
import { WelcomeCard } from "@/components/welcome-card";
import { ManagementBottomSheet } from "@/components/management-bottom-sheet";
import { useAuth } from "@/context/AuthContext";
import { useProfessorOfertasQuery } from "@/api/ofertadisciplina";

export default function Home() {
    const { user } = useAuth();
    const router = useRouter();
    const [isManageSheetVisible, setIsManageSheetVisible] = useState(false);

    const isProfessor = user?.role?.includes("professor");
    const isAdminOrServidor = user?.role?.includes("admin") || user?.role?.includes("servidor");
    const showProfessorDashboard = isProfessor && !isAdminOrServidor;

    const { data: ofertasResponse, isLoading, isError, refetch } = useProfessorOfertasQuery(
        showProfessorDashboard ? user?.id : undefined
    );

    const ofertas = ofertasResponse?.data || [];

    function handleManagePress() {
        setIsManageSheetVisible(true);
    }

    function handleSelectOption(optionId: string) {
        router.push({ pathname: `/(private)/gerenciar/${optionId}` as any });
    }

    if (showProfessorDashboard) {
        return (
            <View style={styles.container}>
                <WelcomeCard />
                
                <View style={styles.sectionHeader}>
                    <Ionicons name="school-outline" size={22} color="#1D8C43" />
                    <Text style={styles.sectionTitle}>Minhas Turmas e Disciplinas</Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#52B28B" />
                        <Text style={styles.loadingText}>Carregando suas turmas...</Text>
                    </View>
                ) : isError ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
                        <Text style={styles.errorText}>Erro ao carregar turmas</Text>
                        <Pressable style={styles.retryButton} onPress={() => refetch()}>
                            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                        </Pressable>
                    </View>
                ) : ofertas.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="folder-open-outline" size={60} color="#9ca3af" />
                        <Text style={styles.emptyText}>Nenhuma turma ou disciplina vinculada ao seu perfil.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={ofertas}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.card,
                                    pressed && styles.cardPressed
                                ]}
                                onPress={() => router.push({ pathname: `/(private)/turma/${item.id}` as any })}
                            >
                                <View style={styles.cardContent}>
                                    <Text style={styles.disciplineName}>
                                        {item.disciplina?.name || "Disciplina Sem Nome"}
                                    </Text>
                                    
                                    <View style={styles.cardMetaRow}>
                                        <Ionicons name="people-outline" size={16} color="#6b7280" />
                                        <Text style={styles.cardMetaText}>
                                            Turma: {item.classroom?.name || "N/A"}
                                        </Text>
                                    </View>
                                    
                                    <View style={styles.cardMetaRow}>
                                        <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                        <Text style={styles.cardMetaText}>
                                            Período: {item.periodo_letivo?.name || "N/A"}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#52B28B" />
                            </Pressable>
                        )}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WelcomeCard />

            <View style={styles.gridOptions}>
                <ButtonMenu
                    title="Gerenciar"
                    iconSource={require("../../assets/cadastro-icon.png")}
                    onPress={handleManagePress}
                />
                <ButtonMenu
                    title="Frequência"
                    iconSource={require("../../assets/notas-frequencia-icon.png")}
                    onPress={() => router.push("/frequencia" as any)}
                />
                <ButtonMenu
                    title="Relatórios"
                    iconSource={require("../../assets/relatorios-icon.png")}
                />
            </View>

            {/* Bottom Sheet Modal */}
            <ManagementBottomSheet
                visible={isManageSheetVisible}
                onClose={() => setIsManageSheetVisible(false)}
                onSelectOption={handleSelectOption}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: "#f9fafb", // Light subtle background
    },
    gridOptions: {
        flexDirection: "column",
        flex: 1,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
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
        paddingVertical: 40,
    },
    errorText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#dc2626",
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: "#52B28B",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#ffffff",
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 32,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f3f4f6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.8,
        backgroundColor: "#f9fafb",
    },
    cardContent: {
        flex: 1,
        gap: 6,
    },
    disciplineName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    cardMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    cardMetaText: {
        fontSize: 13,
        color: "#4b5563",
    },
});