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
    areaConhecimento: string;
    cargaHoraria: string;
    classroomName: string;
    professorName: string;
    status: boolean | number;
    onPress: () => void;
};

export const DisciplinaCard = ({ 
    name, 
    areaConhecimento, 
    cargaHoraria, 
    classroomName, 
    professorName, 
    status, 
    onPress 
}: Props) => {
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
                            {isAtivo ? "Ativa" : "Inativa"}
                        </Text>
                    </View>
                </View>

                {/* Area de Conhecimento */}
                <View style={styles.detailRow}>
                    <Ionicons name="bookmark-outline" size={14} color="#52B28B" style={styles.icon} />
                    <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                        Área: {areaConhecimento}
                    </Text>
                </View>

                {/* Classroom and Professor Info Row */}
                <View style={styles.detailRow}>
                    <Ionicons name="school-outline" size={14} color="#6b7280" style={styles.icon} />
                    <Text style={styles.subDetailText} numberOfLines={1} ellipsizeMode="tail">
                        Turma: {classroomName}
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={14} color="#6b7280" style={styles.icon} />
                    <Text style={styles.subDetailText} numberOfLines={1} ellipsizeMode="tail">
                        Prof: {professorName}
                    </Text>
                </View>

                {/* Carga Horária Row */}
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#6b7280" style={styles.icon} />
                        <Text style={styles.metaText}>Carga Horária: {cargaHoraria}</Text>
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
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    icon: {
        marginRight: 6,
        width: 14,
        textAlign: "center",
    },
    detailText: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: "500",
        flex: 1,
    },
    subDetailText: {
        fontSize: 13,
        color: "#4b5563",
        flex: 1,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
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
