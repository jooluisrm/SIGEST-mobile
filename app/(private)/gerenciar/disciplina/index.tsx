import React, { useState, useEffect, useMemo } from "react";
import { 
    StyleSheet, 
    View, 
    FlatList, 
    Text, 
    Alert,
    ActivityIndicator,
    Pressable
} from "react-native";
import { useRouter } from "expo-router";
import { SearchAddHeader } from "@/components/gerenciar/search-add-header";
import { DisciplinaCard } from "@/components/gerenciar/disciplina/disciplina-card";
import { Ionicons } from "@expo/vector-icons";
import { useDisciplinasInfiniteQuery } from "@/api/disciplina";
import { useClassroomsInfiniteQuery } from "@/api/turma";
import { useProfessorsInfiniteQuery } from "@/api/professor";

export default function GerenciarDisciplinas() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // Debounce search text
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchText]);

    // Queries
    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        refetch,
        isRefetching
    } = useDisciplinasInfiniteQuery(debouncedSearchText);

    // Queries to resolve IDs to names
    const { data: classroomsResponse } = useClassroomsInfiniteQuery("");
    const { data: professorsResponse } = useProfessorsInfiniteQuery("");

    // Flatten lookup lists
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

    // Create maps for name resolution
    const classroomMap = useMemo(() => {
        const map = new Map<number, string>();
        classrooms.forEach((c) => map.set(c.id, c.name));
        return map;
    }, [classrooms]);

    const professorMap = useMemo(() => {
        const map = new Map<number, string>();
        professors.forEach((p) => map.set(p.id_professor, p.name));
        return map;
    }, [professors]);

    // Flatten disciplines list safely handling different potential envelope structures
    const disciplinas = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            if (Array.isArray(page.data)) {
                return page.data;
            }
            return [];
        });
    }, [data]);

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar disciplinas:", error);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível buscar a lista de disciplinas. Verifique a conexão com o servidor."
            );
        }
    }, [error]);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleAddPress = () => {
        router.push("/gerenciar/disciplina/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/disciplina/${id}` as any);
    };

    return (
        <View style={styles.container}>
            {/* Header Component with Search Input and Add Action */}
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar disciplina..."
                onAddPress={handleAddPress}
            />

            {/* List Section */}
            {isLoading && disciplinas.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando disciplinas...</Text>
                </View>
            ) : (
                <FlatList
                    data={disciplinas}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <DisciplinaCard
                            name={item.name}
                            areaConhecimento={item.area_conhecimento}
                            cargaHoraria={item.carga_horaria}
                            classroomName={classroomMap.get(item.classroom_id) || `Turma #${item.classroom_id}`}
                            professorName={professorMap.get(item.professor_id) || `Professor #${item.professor_id}`}
                            status={item.status}
                            onPress={() => handleCardPress(item.id)}
                        />
                    )}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => 
                        isFetchingNextPage ? (
                            <ActivityIndicator size="small" color="#52B28B" style={styles.footerLoader} />
                        ) : null
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={64} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>Nenhuma disciplina encontrada</Text>
                            <Text style={styles.emptySubtitle}>
                                {searchText.trim().length >= 3 
                                    ? "Experimente buscar por outro termo ou limpe o filtro."
                                    : "Toque no botão '+' no topo direito para criar uma nova disciplina."}
                            </Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 15,
        color: "#6b7280",
    },
    listContent: {
        paddingBottom: 40,
    },
    footerLoader: {
        paddingVertical: 16,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 20,
    },
});
