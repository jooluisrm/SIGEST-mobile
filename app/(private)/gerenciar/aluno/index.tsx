import React, { useState, useEffect } from "react";
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
import { AlunoCard } from "@/components/gerenciar/aluno/aluno-card";
import { Ionicons } from "@expo/vector-icons";
import { useAlunosInfiniteQuery } from "../../../../src/api/aluno";

export default function Aluno() {
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

    // Consulta usando rolagem infinita (useInfiniteQuery)
    const { 
        data, 
        isLoading, 
        error, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useAlunosInfiniteQuery(debouncedSearchText);

    // Mapeia todas as páginas de resultados vindas do backend em um array plano
    const alumnos = data?.pages.flatMap((page) => page.data || []) || [];

    useEffect(() => {
        if (error) {
            console.error("Erro ao carregar alunos:", error);
            Alert.alert(
                "Erro de Conexão",
                "Não foi possível buscar a lista de alunos. Verifique a conexão com a API."
            );
        }
    }, [error]);

    const handleSearchChange = (text: string) => {
        setSearchText(text);
    };

    const handleAddPress = () => {
        router.push("/gerenciar/aluno/cadastro");
    };

    const handleCardPress = (id: number) => {
        router.push(`/gerenciar/aluno/${id}` as any);
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
                placeholder="Buscar por nome de aluno"
                onAddPress={handleAddPress}
                iconType="person"
            />

            {/* Aviso visual caso o termo de busca seja muito curto */}
            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
                <Text style={styles.searchHelperText}>
                    Digite pelo menos 3 caracteres para buscar.
                </Text>
            )}

            {isLoading && alumnos.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#52B28B" />
                    <Text style={styles.loadingText}>Carregando alunos...</Text>
                </View>
            ) : (
                /* Lista de alunos vindos da API com Rolagem Infinita */
            <FlatList
                data={alumnos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <AlunoCard
                        name={item.name}
                        email={item.email}
                        phone={item.celular || item.telefone || "Não cadastrado"}
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
                        <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
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