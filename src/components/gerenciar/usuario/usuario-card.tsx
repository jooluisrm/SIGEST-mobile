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
    email: string;
    phone: string;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export const UsuarioCard = ({ name, email, phone, onView, onEdit, onDelete }: Props) => {
    return (
        <View style={styles.card}>
            {/* Info Section (Left Side) */}
            <View style={styles.infoSection}>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {name}
                </Text>

                {/* Email Row */}
                <View style={styles.metaRow}>
                    <Ionicons name="mail-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                    <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                        {email}
                    </Text>
                </View>

                {/* Phone Row */}
                <View style={styles.metaRow}>
                    <Ionicons name="call-outline" size={14} color="#6b7280" style={styles.metaIcon} />
                    <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                        {phone}
                    </Text>
                </View>
            </View>

            {/* Actions Section (Right Side) */}
            <View style={styles.actionsSection}>
                {/* View Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.viewButton,
                        pressed && styles.viewButtonPressed
                    ]}
                    onPress={onView}
                >
                    <Ionicons name="eye-outline" size={18} color="#2563eb" />
                </Pressable>

                {/* Edit Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.editButton,
                        pressed && styles.editButtonPressed
                    ]}
                    onPress={onEdit}
                >
                    <Ionicons name="pencil-outline" size={16} color="#ea580c" />
                </Pressable>

                {/* Delete Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.deleteButton,
                        pressed && styles.deleteButtonPressed
                    ]}
                    onPress={onDelete}
                >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                </Pressable>
            </View>
        </View>
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
    infoSection: {
        flex: 1,
        paddingRight: 10,
    },
    nameText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    metaIcon: {
        marginRight: 6,
        width: 16,
    },
    metaText: {
        fontSize: 13,
        color: "#6b7280",
        flex: 1,
    },
    actionsSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    viewButton: {
        backgroundColor: "#eff6ff", // Very light blue
    },
    viewButtonPressed: {
        backgroundColor: "#dbeafe",
    },
    editButton: {
        backgroundColor: "#fff7ed", // Very light orange
    },
    editButtonPressed: {
        backgroundColor: "#ffedd5",
    },
    deleteButton: {
        backgroundColor: "#fef2f2", // Very light red
    },
    deleteButtonPressed: {
        backgroundColor: "#fee2e2",
    },
});
