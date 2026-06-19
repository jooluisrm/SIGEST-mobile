import React from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    name: string;
    courseName: string;
    startDate: string;
    endDate: string;
    status: boolean | number;
    onPress: () => void;
};

function formatDateISOToBR(dateStr: string): string {
    if (!dateStr) return "Não informada";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

export const PeriodoLetivoCard = ({ name, courseName, startDate, endDate, status, onPress }: Props) => {
    const isAtivo = status === true || status === 1;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={onPress}
        >
            {/* Info Section (Left Side) */}
            <View style={styles.infoSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>
                    {/* Status Badge */}
                    <View style={[styles.badge, isAtivo ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={[styles.badgeText, isAtivo ? styles.badgeTextActive : styles.badgeTextInactive]}>
                            {isAtivo ? "Ativo" : "Inativo"}
                        </Text>
                    </View>
                </View>

                {/* Course Name Subtitle */}
                <View style={styles.courseRow}>
                    <Ionicons name="book-outline" size={14} color="#52B28B" style={styles.courseIcon} />
                    <Text style={styles.courseText} numberOfLines={1} ellipsizeMode="tail">
                        {courseName}
                    </Text>
                </View>

                {/* Date range bottom row */}
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" style={styles.dateIcon} />
                    <Text style={styles.dateText}>
                        {formatDateISOToBR(startDate)} a {formatDateISOToBR(endDate)}
                    </Text>
                </View>
            </View>

            {/* Chevron Right (Right Side) */}
            <View style={styles.chevronSection}>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.03)",
    },
    cardPressed: {
        backgroundColor: "#f9fafb",
        opacity: 0.9,
    },
    infoSection: {
        flex: 1,
        paddingRight: 10,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
        gap: 8,
    },
    nameText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeActive: {
        backgroundColor: "#e8f7f0",
    },
    badgeInactive: {
        backgroundColor: "#f3f4f6",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    badgeTextActive: {
        color: "#52B28B",
    },
    badgeTextInactive: {
        color: "#6b7280",
    },
    courseRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    courseIcon: {
        marginRight: 6,
    },
    courseText: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: "500",
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateIcon: {
        marginRight: 6,
    },
    dateText: {
        fontSize: 13,
        color: "#6b7280",
    },
    chevronSection: {
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 8,
    },
});
