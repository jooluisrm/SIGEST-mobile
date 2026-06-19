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
    numberPeriods: number;
    totalHours: number;
    status: boolean;
    onPress: () => void;
};

export const CursoCard = ({ name, numberPeriods, totalHours, status, onPress }: Props) => {
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
                    <View style={[styles.badge, status ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={[styles.badgeText, status ? styles.badgeTextActive : styles.badgeTextInactive]}>
                            {status ? "Ativo" : "Inativo"}
                        </Text>
                    </View>
                </View>

                {/* Periods and Hours Row */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>
                            {numberPeriods} {numberPeriods === 1 ? "período" : "períodos"}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                        <Text style={styles.metaText}>
                            {totalHours.toLocaleString("pt-BR")} horas
                        </Text>
                    </View>
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
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaIcon: {
        marginRight: 6,
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
