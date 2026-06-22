import React, { useState, useEffect, useMemo } from "react";
import { 
    StyleSheet, 
    View, 
    FlatList, 
    Text, 
    Alert,
    ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { SearchAddHeader } from "@/components/gerenciar/search-add-header";
import { PeriodoLetivoCard } from "@/components/gerenciar/periodoletivo/periodoletivo-card";
import { Ionicons } from "@expo/vector-icons";
import { usePeriodosLetivosInfiniteQuery } from "../../../../src/api/periodoletivo";
import { useCoursesQuery } from "../../../../src/api/curso";

export default function PeriodosLetivosIndex() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // Debounce de 500ms na busca para evitar requisições a cada letra digitada
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchText]);

    // Consulta real de Períodos Letivos usando o TanStack Query com rolagem infinita
    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = usePeriodosLetivosInfiniteQuery(debouncedSearchText);

    // Consulta de Cursos ativos em segundo plano para mapeamento dos nomes de cursos nos cards
    const { data: coursesResponse } = useCoursesQuery("", 1);
    
    const courses = coursesResponse && "data" in coursesResponse && Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : [];

    // Mapeamento ID -> Nome do Curso
    const courseMap = useMemo(() => {
        const map = new Map<number, string>();
        courses.forEach(c => map.set(c.id, c.name));
        return map;
    }, [courses]);

    // Mapeamento dos resultados recebidos da API (data contém páginas no useInfiniteQuery)
    const periodosLetivos = data?.pages.flatMap((page) => page.data || []) || [];

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar períodos letivos:", error);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível buscar a lista de períodos letivos. Verifique a conexão com a API."
            );
        }
    }, [error]);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleAddPress = () => {
        router.push("/gerenciar/periodoletivo/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/periodoletivo/${id}` as any);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <View style={styles.container}>
            {/* Header com busca e botão de adicionar */}
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar período por nome"
                onAddPress={handleAddPress}
            />

            {/* Aviso visual caso o termo de busca seja muito curto */}
            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
                <Text style={styles.searchHelperText}>
                    Digite pelo menos 3 caracteres para buscar.
                </Text>
            )}

            {isLoading && periodosLetivos.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando períodos letivos...</Text>
                </View>
            ) : (
                /* Lista de Períodos Letivos com Rolagem Infinita */
                <FlatList
                    data={periodosLetivos}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <PeriodoLetivoCard
                            name={item.name}
                            courseName={courseMap.get(item.course_id) || `Curso ID: ${item.course_id}`}
                            startDate={item.data_inicio}
                            endDate={item.data_encerramento}
                            status={item.status}
                            onPress={() => handleCardPress(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View style={styles.footerLoading}>
                                <ActivityIndicator size="small" color="#52B28B" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color="#9ca3af" />
                            <Text style={styles.emptyText}>Nenhum período letivo encontrado</Text>
                        </View>
                    }
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
    listContent: {
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
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
        fontWeight: "500",
    },
    searchHelperText: {
        fontSize: 12,
        color: "#6b7280",
        fontStyle: "italic",
        marginBottom: 8,
        marginLeft: 4,
    },
    footerLoading: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
});
