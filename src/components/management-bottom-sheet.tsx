import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    View,
    Pressable,
    Animated,
    Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

type Option = {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelectOption: (optionId: string) => void;
};

const OPTIONS: Option[] = [
    { id: "usuario", title: "Usuário", icon: "person-outline" },
    { id: "aluno", title: "Aluno", icon: "school-outline" },
    { id: "professor", title: "Professor", icon: "people-outline" },
    { id: "curso", title: "Curso", icon: "book-outline" },
    { id: "disciplina", title: "Disciplina", icon: "book-outline" },
    { id: "turma", title: "Turma", icon: "school-outline" },
    { id: "avaliacao", title: "Avaliação", icon: "book-outline" },

];

export const ManagementBottomSheet = ({ visible, onClose, onSelectOption }: Props) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Backdrop pressable area to close sheet */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Bottom Sheet Card */}
                <View style={styles.sheet}>
                    {/* Visual drag handle */}
                    <View style={styles.dragHandle} />

                    <Text style={styles.title}>O que deseja gerenciar?</Text>

                    {/* 2x2 Grid of Management Options */}
                    <View style={styles.grid}>
                        {OPTIONS.map((option) => (
                            <Pressable
                                key={option.id}
                                style={({ pressed }) => [
                                    styles.gridItem,
                                    pressed && styles.gridItemPressed
                                ]}
                                onPress={() => {
                                    onSelectOption(option.id);
                                    onClose();
                                }}
                            >
                                <View style={styles.iconCircle}>
                                    <Ionicons name={option.icon} size={28} color="#1D8C43" />
                                </View>
                                <Text style={styles.gridItemText}>{option.title}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Close Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && styles.closeButtonPressed
                        ]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cancelar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    sheet: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 34,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandle: {
        width: 44,
        height: 5,
        backgroundColor: "#e5e7eb",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        textAlign: "center",
        marginBottom: 22,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 24,
    },
    gridItem: {
        width: "48%",
        backgroundColor: "#f4faf6", // Light green tint matching the theme
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "rgba(29, 140, 67, 0.08)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    gridItemPressed: {
        backgroundColor: "#e8f5ed",
        borderColor: "rgba(29, 140, 67, 0.2)",
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    gridItemText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#16331F",
    },
    closeButton: {
        height: 48,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
        justifyContent: "center",
    },
    closeButtonPressed: {
        backgroundColor: "#e5e7eb",
    },
    closeButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#4b5563",
    },
});
