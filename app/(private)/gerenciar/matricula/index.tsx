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
import { MatriculaCard } from "@/components/gerenciar/matricula/matricula-card";
import { useAlunoQuery } from "@/api/aluno";
import { usePeriodQuery } from "@/api/periodo";
import { Ionicons } from "@expo/vector-icons";
import { useMatriculasInfiniteQuery } from "@/api/matricula";

// Self-resolving row to avoid modifying the backend.
// Leverage TanStack Query's cache so repeated IDs resolve instantly.
const MatriculaRow = ({ item, onPress }: { item: any; onPress: (id: number) => void }) => {
    const { data: alunoResponse } = useAlunoQuery(item.aluno_id);
    const { data: periodResponse } = usePeriodQuery(item.serie_id);

    const studentName = alunoResponse?.data?.name || `Aluno ID: ${item.aluno_id}`;
    const serieName = periodResponse?.data?.name || `Série ID: ${item.serie_id}`;

    return (
        <MatriculaCard
            studentName={studentName}
            codigoMatricula={item.codigo_matricula}
            serieName={serieName}
            dataMatricula={item.data_matricula}
            status={item.status}
            onPress={() => onPress(item.id)}
        />
    );
};

export default function GerenciarMatriculas() {
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

    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        refetch
    } = useMatriculasInfiniteQuery(debouncedSearchText);

    const matriculas = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            if (Array.isArray(page.data)) return page.data;
            if (typeof page.data === "object" && "data" in page.data && Array.isArray(page.data.data)) {
                return page.data.data;
            }
            return [];
        });
    }, [data]);

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar matrículas:", error);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível buscar a lista de matrículas. Verifique a conexão com o servidor."
            );
        }
    }, [error]);

    useEffect(() => {
        refetch();
    }, []);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleAddPress = () => {
        router.push("/gerenciar/matricula/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/matricula/${id}` as any);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <View style={styles.container}>
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar por código de matrícula"
                onAddPress={handleAddPress}
            />

            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
                <Text style={styles.searchHelperText}>
                    Digite pelo menos 3 caracteres para buscar.
                </Text>
            )}

            {isLoading && matriculas.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando matrículas...</Text>
                </View>
            ) : (
                <FlatList
                    data={matriculas}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <MatriculaRow
                            item={item}
                            onPress={handleCardPress}
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
                            <Text style={styles.emptyText}>Nenhuma matrícula encontrada</Text>
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
        paddingBottom: 40,
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
