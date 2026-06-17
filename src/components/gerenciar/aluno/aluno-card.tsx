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
    onPress: () => void;
};

export const AlunoCard = ({ name, email, phone, onPress }: Props) => {
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
    chevronSection: {
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 8,
    },
});

