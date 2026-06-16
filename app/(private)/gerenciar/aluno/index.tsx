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
import { PaginationControl } from "@/components/gerenciar/pagination-control";
import { Ionicons } from "@expo/vector-icons";
import { useAlunosQuery } from "../../../../src/api/aluno";

export default function Aluno() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Consulta real usando o TanStack Query
    const { data, isLoading, error } = useAlunosQuery(searchText, currentPage);

    // Mapeamento dos resultados recebidos da API (data pode ser null na resposta de sucesso geral vazia)
    const alumnos = data?.data || [];
    const totalPages = (data && "meta" in data) ? data.meta.last_page : 1;

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
        setCurrentPage(1); // Reinicia para a página 1 ao realizar busca
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleAddPress = () => {
        router.push("/gerenciar/aluno/cadastro");
    };

    const handleViewPress = (name: string) => {
        Alert.alert("Visualizar", `Visualizando detalhes do aluno: ${name}`);
    };

    const handleEditPress = (name: string) => {
        Alert.alert("Editar", `Abrir formulário de edição para: ${name}`);
    };

    const handleDeletePress = (id: string, name: string) => {
        Alert.alert(
            "Excluir",
            `Deseja realmente excluir o aluno ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        console.log(`Excluir aluno ID: ${id}`);
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Carregando alunos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header com busca e botão de adicionar */}
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar por nome de aluno"
                onAddPress={handleAddPress}
            />

            {/* Aviso visual caso o termo de busca seja muito curto */}
            {searchText.trim().length > 0 && searchText.trim().length < 3 && (
                <Text style={styles.searchHelperText}>
                    Digite pelo menos 3 caracteres para buscar.
                </Text>
            )}

            {/* Lista de alunos vindos da API */}
            <FlatList
                data={alumnos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <AlunoCard
                        name={item.name}
                        email={item.email}
                        phone={item.celular || item.telefone || "Não cadastrado"}
                        onView={() => handleViewPress(item.name)}
                        onEdit={() => handleEditPress(item.name)}
                        onDelete={() => handleDeletePress(String(item.id), item.name)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#9ca3af" />
                        <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
                    </View>
                }
            />

            {/* Controle de Paginação do Laravel */}
            <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
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
});