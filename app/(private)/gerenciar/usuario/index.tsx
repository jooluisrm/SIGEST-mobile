import React, { useState } from "react";
import { 
    StyleSheet, 
    View, 
    FlatList, 
    Text, 
    Alert 
} from "react-native";
import { SearchAddHeader } from "@/components/gerenciar/search-add-header";
import { UsuarioCard } from "@/components/gerenciar/usuario/usuario-card";
import { PaginationControl } from "@/components/gerenciar/pagination-control";
import { Ionicons } from "@expo/vector-icons";

// Mock user list
const MOCK_USUARIOS = [
    { id: "1", name: "João Silva", email: "joao.silva@example.com", phone: "(81) 98888-7777" },
    { id: "2", name: "Maria Santos", email: "maria.santos@example.com", phone: "(81) 97777-6666" },
    { id: "3", name: "Pedro Oliveira", email: "pedro.oliveira@example.com", phone: "(81) 96666-5555" },
    { id: "4", name: "Ana Souza", email: "ana.souza@example.com", phone: "(81) 95555-4444" },
    { id: "5", name: "Lucas Costa", email: "lucas.costa@example.com", phone: "(81) 94444-3333" },
    { id: "6", name: "Clara Rocha", email: "clara.rocha@example.com", phone: "(81) 93333-2222" },
];

const ITEMS_PER_PAGE = 5;

export default function Usuario() {
    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter users by name, email, or phone
    const filteredUsuarios = MOCK_USUARIOS.filter(
        (usuario) =>
            usuario.name.toLowerCase().includes(searchText.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchText.toLowerCase()) ||
            usuario.phone.includes(searchText)
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsuarios.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsuarios = filteredUsuarios.slice(
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
        Alert.alert("Cadastrar", "Abrir fluxo para cadastrar novo usuário.");
    };

    const handleViewPress = (name: string) => {
        Alert.alert("Visualizar", `Visualizando detalhes do usuário: ${name}`);
    };

    const handleEditPress = (name: string) => {
        Alert.alert("Editar", `Abrir formulário de edição para: ${name}`);
    };

    const handleDeletePress = (id: string, name: string) => {
        Alert.alert(
            "Excluir",
            `Deseja realmente excluir o usuário ${name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Excluir", 
                    style: "destructive", 
                    onPress: () => {
                        console.log(`Usuário ${id} excluído`);
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
                placeholder="Buscar usuário"
                onAddPress={handleAddPress}
            />

            {/* List of User cards */}
            <FlatList
                data={paginatedUsuarios}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <UsuarioCard
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
                        <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
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
