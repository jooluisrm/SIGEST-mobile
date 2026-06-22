import React from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    Pressable 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
    studentName: string;
    codigoMatricula: string;
    serieName: string;
    dataMatricula: string;
    status: boolean | number;
    onPress: () => void;
};

export const MatriculaCard = ({ 
    studentName, 
    codigoMatricula, 
    serieName, 
    dataMatricula, 
    status, 
    onPress 
}: Props) => {
    const isAtivo = status === true || status === 1;

    // Format date string to display dd/mm/yyyy
    const formattedDate = React.useMemo(() => {
        if (!dataMatricula) return "";
        try {
            const parts = dataMatricula.split("-");
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dataMatricula;
        } catch {
            return dataMatricula;
        }
    }, [dataMatricula]);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={onPress}
        >
            <View style={styles.infoSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                        {studentName}
                    </Text>
                    <View style={[styles.badge, isAtivo ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={[styles.badgeText, isAtivo ? styles.badgeTextActive : styles.badgeTextInactive]}>
                            {isAtivo ? "Ativa" : "Cancelada"}
                        </Text>
                    </View>
                </View>

                {/* Code / Matricula Row */}
                <View style={styles.detailRow}>
                    <Ionicons name="key-outline" size={14} color="#6b7280" style={styles.icon} />
                    <Text style={styles.detailText}>
                        Código: {codigoMatricula}
                    </Text>
                </View>

                {/* Serie Row */}
                <View style={styles.detailRow}>
                    <Ionicons name="school-outline" size={14} color="#52B28B" style={styles.icon} />
                    <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                        Série: {serieName}
                    </Text>
                </View>

                {/* Date Row */}
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6b7280" style={styles.icon} />
                    <Text style={styles.metaText}>
                        Matriculado em: {formattedDate}
                    </Text>
                </View>
            </View>

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
        marginBottom: 8,
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
        backgroundColor: "#fee2e2",
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    badgeTextActive: {
        color: "#52B28B",
    },
    badgeTextInactive: {
        color: "#dc2626",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    icon: {
        marginRight: 6,
        width: 16,
        textAlign: "center",
    },
    detailText: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: "500",
    },
    metaText: {
        fontSize: 13,
        color: "#6b7280",
    },
    chevronSection: {
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 8,
    },
});
