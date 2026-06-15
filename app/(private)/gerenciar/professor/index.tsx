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
import { ProfessorCard } from "@/components/gerenciar/professor/professor-card";
import { PaginationControl } from "@/components/gerenciar/pagination-control";
import { Ionicons } from "@expo/vector-icons";

// Mock professor list
const MOCK_PROFESSORES = [
    { id: "1", name: "Prof. Carlos Silva", email: "carlos.silva@example.com", phone: "(81) 98888-7777" },
    { id: "2", name: "Profa. Amanda Lima", email: "amanda.lima@example.com", phone: "(81) 97777-6666" },
    { id: "3", name: "Prof. Roberto Santos", email: "roberto.santos@example.com", phone: "(81) 96666-5555" },
    { id: "4", name: "Profa. Patrícia Oliveira", email: "patricia.oliveira@example.com", phone: "(81) 95555-4444" },
    { id: "5", name: "Prof. Eduardo Costa", email: "eduardo.costa@example.com", phone: "(81) 94444-3333" },
    { id: "6", name: "Profa. Juliana Fernandes", email: "juliana.fernandes@example.com", phone: "(81) 93333-2222" },
    { id: "7", name: "Prof. Marcos Rocha", email: "marcos.rocha@example.com", phone: "(81) 92222-1111" },
];

const ITEMS_PER_PAGE = 5;

export default function Professor() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter professors by name, email, or phone
    const filteredProfessores = MOCK_PROFESSORES.filter(
        (professor) =>
            professor.name.toLowerCase().includes(searchText.toLowerCase()) ||
            professor.email.toLowerCase().includes(searchText.toLowerCase()) ||
            professor.phone.includes(searchText)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredProfessores.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProfessores = filteredProfessores.slice(
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
        router.push("/gerenciar/professor/cadastro");
    };

    const handleViewPress = (name: string) => {
        Alert.alert("Visualizar", `Visualizando detalhes do professor: ${name}`);
    };

    const handleEditPress = (name: string) => {
        Alert.alert("Editar", `Abrir formulário de edição para: ${name}`);
    };

    const handleDeletePress = (id: string, name: string) => {
        Alert.alert(
            "Excluir",
            `Deseja realmente excluir o professor ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive", 
                    onPress: () => {
                        console.log(`Professor ${id} excluído`);
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
                placeholder="Buscar professor"
                onAddPress={handleAddPress}
            />

            {/* List of Professor cards */}
            <FlatList
                data={paginatedProfessores}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProfessorCard
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
                        <Text style={styles.emptyText}>Nenhum professor encontrado</Text>
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
