import React from "react";
import {
    Text,
    StyleSheet,
    View,
    ScrollView,
    Image,
    ImageBackground,
    Dimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WelcomeCard } from "@/components/welcome-card";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
    return (
        <ImageBackground
            source={require("../../assets/backimage.png")}
            style={styles.backgroundImage}
            resizeMode="cover"
        >


            {/* Faint overlay to make content readable while maintaining the classroom background watermark */}
            <View style={styles.overlay}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Welcome Card */}
                    <WelcomeCard />

                    {/* Section 1: Todas as notícias */}
                    <View style={styles.sectionDivider}>
                        <Text style={styles.sectionDividerText}>Todas as notícias</Text>
                    </View>

                    <View style={styles.newsCard}>
                        <View style={styles.dateContainer}>
                            <Text style={styles.dateText}>12/09</Text>
                        </View>
                        <View style={styles.newsContent}>
                            <Text style={styles.newsText}>
                                Reunião de pais em breve aguarde para mais informações
                            </Text>
                        </View>
                    </View>

                    {/* Section 2: Alunos destaque */}
                    <View style={styles.sectionDivider}>
                        <Text style={styles.sectionDividerText}>Alunos destaque turma B</Text>
                    </View>

                    <View style={styles.destaqueCard}>
                        <Image
                            source={require("../../assets/backimage.png")}
                            style={styles.destaqueImage}
                        />
                        <Text style={styles.destaqueText}>
                            Os alunos da Turma B se destacaram com muito esforço, dedicação e ótimos resultados.
                            Esse desempenho mostra o comprometimento e a vontade de aprender de cada um, servindo
                            de inspiração para toda a escola. Estamos muito orgulhosos dessa conquista e desejamos
                            que continuem trilhando esse caminho de sucesso. Parabéns a todos os alunos da Turma B
                            pelo excelente trabalho!
                        </Text>
                    </View>

                    {/* Section 3: Informações Importantes & Texto Institucional */}
                    <View style={styles.infoSection}>
                        {/* Paragraph text shown first on mobile for better flow */}
                        <Text style={styles.infoParagraph}>
                            A escola é um espaço de aprendizagem, convivência e descobertas. Mais do que
                            transmitir conhecimento, buscamos formar cidadãos críticos, criativos e preparados para os
                            desafios do futuro. Aqui, cada aluno é incentivado a desenvolver suas habilidades
                            individuais e coletivas.
                        </Text>

                        {/* List of Important Info cards */}
                        <View style={styles.importantCardsContainer}>
                            <View style={styles.importantCard}>
                                <Text style={styles.importantCardText}>Informações importantes!</Text>
                            </View>
                            <View style={styles.importantCard}>
                                <Text style={styles.importantCardText}>Informações importantes!</Text>
                            </View>
                            <View style={styles.importantCard}>
                                <Text style={styles.importantCardText}>Informações importantes!</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(240, 244, 248, 0.94)", // Light faint background overlay for readability
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    sectionDivider: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignSelf: "center",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionDividerText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333333",
        textAlign: "center",
    },
    newsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    dateContainer: {
        width: 80,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: 1.5,
        borderRightColor: "#f0f0f0",
        paddingRight: 12,
    },
    dateText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#222222",
    },
    newsContent: {
        flex: 1,
        paddingLeft: 16,
    },
    newsText: {
        fontSize: 14,
        color: "#444444",
        lineHeight: 20,
        fontWeight: "600",
    },
    destaqueCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    destaqueImage: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 14,
        resizeMode: "cover",
    },
    destaqueText: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 22,
        textAlign: "justify",
    },
    infoSection: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    infoParagraph: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 22,
        textAlign: "justify",
        marginBottom: 16,
    },
    importantCardsContainer: {
        gap: 12,
    },
    importantCard: {
        backgroundColor: "#f9fafb",
        borderRadius: 10,
        padding: 14,
        borderLeftWidth: 5,
        borderLeftColor: "#52B28B", // Distinct teal indicator line
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    importantCardText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1e3a27",
    },
});