import React from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export const PaginationControl = ({ currentPage, totalPages, onPageChange }: Props) => {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages || totalPages === 0;
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container,
            { paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 14 }
        ]}>
            {/* Previous Page Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    isFirstPage && styles.buttonDisabled,
                    !isFirstPage && pressed && styles.buttonPressed
                ]}
                disabled={isFirstPage}
                onPress={() => onPageChange(currentPage - 1)}
            >
                <Ionicons
                    name="chevron-back"
                    size={18}
                    color={isFirstPage ? "#9ca3af" : "#4b5563"}
                />
                <Text style={[styles.buttonText, isFirstPage && styles.buttonTextDisabled]}>
                    Anterior
                </Text>
            </Pressable>

            {/* Page Status Indicator */}
            <View style={styles.indicatorContainer}>
                <Text style={styles.indicatorText}>
                    Pág. <Text style={styles.indicatorHighlight}>{currentPage}</Text> de {totalPages || 1}
                </Text>
            </View>

            {/* Next Page Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    isLastPage && styles.buttonDisabled,
                    !isLastPage && pressed && styles.buttonPressed
                ]}
                disabled={isLastPage}
                onPress={() => onPageChange(currentPage + 1)}
            >
                <Text style={[styles.buttonText, isLastPage && styles.buttonTextDisabled]}>
                    Próximo
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isLastPage ? "#9ca3af" : "#4b5563"}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 14,
        paddingHorizontal: 16, // Spacing from screen edges
        marginHorizontal: -16, // Offsets parent container padding (16) to stretch edge-to-edge
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 5,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 4,
        minWidth: 100,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonPressed: {
        backgroundColor: "#e5e7eb",
    },
    buttonDisabled: {
        backgroundColor: "#f9fafb",
        opacity: 0.6,
        elevation: 0,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    buttonTextDisabled: {
        color: "#9ca3af",
    },
    indicatorContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    indicatorText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6b7280",
    },
    indicatorHighlight: {
        fontWeight: "bold",
        color: "#1D8C43", // Highlighting current page in theme color
    },
});
