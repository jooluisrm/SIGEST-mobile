import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
    message?: string;
};

export const RestrictedAccess = ({ message }: Props) => {
    const router = useRouter();

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/home");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-closed-outline" size={44} color="#d97706" />
                </View>
                <Text style={styles.title}>Acesso Restrito</Text>
                <Text style={styles.description}>
                    {message || "Este módulo é restrito para professores e administradores. Caso precise de acesso, entre em contato com a equipe de TI da instituição."}
                </Text>
                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={handleBack}
                >
                    <Ionicons name="arrow-back-outline" size={20} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Voltar ao Início</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        width: "100%",
        maxWidth: 360,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fef3c7", // Light yellow tint
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#52B28B", // Theme green
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 24,
        width: "100%",
    },
    buttonPressed: {
        backgroundColor: "#419572",
        opacity: 0.9,
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
});
