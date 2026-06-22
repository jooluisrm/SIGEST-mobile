import React, { useMemo, useEffect, useState } from "react";
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
import { OfertaDisciplinaCard } from "@/components/gerenciar/ofertadisciplina/ofertadisciplina-card";
import { Ionicons } from "@expo/vector-icons";
import { useOfertaDisciplinasInfiniteQuery } from "@/api/ofertadisciplina";

export default function GerenciarOfertas() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

    // Debounce search text
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 300);
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
    } = useOfertaDisciplinasInfiniteQuery();

    const offerings = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            if (!page || !page.data) return [];
            return page.data;
        });
    }, [data]);

    const filteredOfferings = useMemo(() => {
        const query = debouncedSearchText.trim().toLowerCase();
        if (!query) return offerings;
        return offerings.filter(o => 
            (o.disciplina?.name || "").toLowerCase().includes(query) ||
            (o.classroom?.name || "").toLowerCase().includes(query) ||
            (o.professor?.name || "").toLowerCase().includes(query)
        );
    }, [offerings, debouncedSearchText]);

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar ofertas:", error);
            Alert.alert(
                "Erro de Conexão", 
                "Não foi possível buscar a lista de ofertas de disciplina. Verifique a conexão com o servidor."
            );
        }
    }, [error]);

    useEffect(() => {
        // Automatically refetch when screen gets focus to ensure we have fresh data
        refetch();
    }, []);

    const handleAddPress = () => {
        router.push("/gerenciar/ofertadisciplina/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/ofertadisciplina/${id}` as any);
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
                onChangeText={setSearchText}
                placeholder="Buscar por disciplina ou turma..."
                onAddPress={handleAddPress}
            />

            {isLoading && offerings.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando ofertas...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOfferings}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <OfertaDisciplinaCard
                            disciplineName={item.disciplina?.name || `Disciplina ID: ${item.id}`}
                            classroomName={item.classroom?.name || "Sem Turma"}
                            professorName={item.professor?.name || "Sem Professor"}
                            periodoLetivoName={item.periodo_letivo?.name || "Sem Período Letivo"}
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
                            <Text style={styles.emptyText}>Nenhuma oferta cadastrada</Text>
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
    footerLoading: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
});
