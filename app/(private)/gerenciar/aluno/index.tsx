import React, { useState } from "react";
import {
    StyleSheet,
    View,
    FlatList,
    Text,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import { SearchAddHeader } from "@/components/gerenciar/search-add-header";
import { AlunoCard } from "@/components/gerenciar/aluno/aluno-card";
import { PaginationControl } from "@/components/gerenciar/pagination-control";
import { Ionicons } from "@expo/vector-icons";

// Mock student list based on the desktop web screenshot
const MOCK_ALUNOS = [
    { id: "1", name: "Isabelly Velasques", email: "meireles.jeronimo@example.net", phone: "(84) 98966-1852" },
    { id: "2", name: "Taís Ramires Neto", email: "zrivera@example.com", phone: "(37) 92387-4105" },
    { id: "3", name: "Sra. Rafaela Pâmela Jimenes", email: "david.franco@example.com", phone: "(91) 96240-3997" },
    { id: "4", name: "Srta. Regiane Santiago Galindo", email: "emily.dasdores@example.com", phone: "(62) 99204-9188" },
    { id: "5", name: "Felipe D'ávila Romero", email: "abgail.duarte@example.org", phone: "(55) 90689-3408" },
    { id: "6", name: "Priscila Maraisa Lourenço Neto", email: "vila.miriam@example.org", phone: "(79) 3699-2674" },
    { id: "7", name: "Sra. Janaina Duarte", email: "kauan.colaco@example.com", phone: "(74) 3751-1943" },
    { id: "8", name: "Sr. Breno Molina Neto", email: "paes.isabella@example.net", phone: "(31) 97369-8755" },
    { id: "9", name: "Sr. Emílio Batista Salazar Filho", email: "davi70@example.net", phone: "(43) 90612-3829" },
    { id: "10", name: "Dr. Marcos Duarte Jr.", email: "willian32@example.net", phone: "(92) 3162-8887" },
];

const ITEMS_PER_PAGE = 5;

export default function Aluno() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter students by name, email, or phone
    const filteredAlunos = MOCK_ALUNOS.filter(
        (aluno) =>
            aluno.name.toLowerCase().includes(searchText.toLowerCase()) ||
            aluno.email.toLowerCase().includes(searchText.toLowerCase()) ||
            aluno.phone.includes(searchText)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredAlunos.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAlunos = filteredAlunos.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const handleSearchChange = (text: string) => {
        setSearchText(text);
        setCurrentPage(1); // Reset to page 1 on search
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
                        console.log(`Aluno ${id} excluído`);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header with Search and Add buttons */}
            <SearchAddHeader
                value={searchText}
                onChangeText={handleSearchChange}
                placeholder="Buscar aluno"
                onAddPress={handleAddPress}
            />

            {/* List of Student cards */}
            <FlatList
                data={paginatedAlunos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AlunoCard
                        name={item.name}
                        email={item.email}
                        phone={item.phone}
                        onView={() => handleViewPress(item.name)}
                        onEdit={() => handleEditPress(item.name)}
                        onDelete={() => handleDeletePress(item.id, item.name)}
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

            {/* Pagination Controls */}
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
        backgroundColor: "#f9fafb", // Light background matching dashboard design
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
});