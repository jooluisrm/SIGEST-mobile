import { Text, View, StyleSheet } from "react-native"

export const WelcomeCard = () => {
    return (
        <View style={styles.welcomeCard}>
            {/* Pencils Design */}
            <View style={styles.pencilsContainer}>
                <View style={[styles.pencil, { backgroundColor: "#E2F13C" }]} />
                <View style={[styles.pencil, { backgroundColor: "#F38430" }]} />
                <View style={[styles.pencil, { backgroundColor: "#2B5CB2" }]} />
                <View style={[styles.pencil, { backgroundColor: "#EC3F3F" }]} />
                <View style={[styles.pencil, { backgroundColor: "#1D8C43" }]} />
            </View>
            <Text style={styles.welcomeTitle}>Bem Vindo</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    welcomeCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        paddingVertical: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
    },
    pencilsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        marginBottom: 16,
        gap: 8,
    },
    pencil: {
        width: 14,
        height: 40,
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1D8C43", // Distinct emerald green welcome title
        textAlign: "center",
    },
});