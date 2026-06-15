import React, { useState } from "react";
import {
    Text,
    StyleSheet,
    ImageBackground,
    View,
    TextInput,
    Image,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const router = useRouter();

    const handleLogin = () => {
        // Implement login action
        console.log("Acessando com:", email, password);
        router.push("/home");
    };

    const handleForgotPassword = () => {
        console.log("Recuperar senha");
    };

    const handleRegister = () => {
        console.log("Ir para registro");
    };

    return (
        <SafeAreaProvider>
            <ImageBackground
                source={require("../../assets/backimage.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >

                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.card}>
                                {/* Logo */}
                                <Image
                                    source={require("../../assets/sigest-logo.png")}
                                    style={styles.logo}
                                />

                                {/* E-mail Input */}
                                <TextInput
                                    style={[
                                        styles.input,
                                        isEmailFocused && styles.inputFocused
                                    ]}
                                    placeholder="E-mail"
                                    placeholderTextColor="rgba(30, 58, 39, 0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />

                                {/* Password Input */}
                                <TextInput
                                    style={[
                                        styles.input,
                                        isPasswordFocused && styles.inputFocused
                                    ]}
                                    placeholder="Senha"
                                    placeholderTextColor="rgba(30, 58, 39, 0.6)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                />

                                {/* Submit Button */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        pressed && styles.buttonPressed
                                    ]}
                                    onPress={handleLogin}
                                >
                                    <Text style={styles.buttonText}>Acessar</Text>
                                </Pressable>

                                {/* Forgot Password Link */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.linkPressable,
                                        pressed && styles.linkPressed
                                    ]}
                                    onPress={handleForgotPassword}
                                >
                                    <Text style={styles.forgotPasswordText}>Recuperar Senha</Text>
                                </Pressable>

                                {/* Register Link */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.linkPressable,
                                        pressed && styles.linkPressed
                                    ]}
                                    onPress={handleRegister}
                                >
                                    <Text style={styles.registerText}>
                                        <Text style={styles.registerTextGreen}>Sem cadastro? </Text>
                                        <Text style={styles.registerTextWhite}>Registre-se</Text>
                                    </Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </ImageBackground>
        </SafeAreaProvider>
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
        backgroundColor: "rgba(0, 0, 0, 0.45)", // Smooth dark overlay to make the card stand out
        justifyContent: "center",
        alignItems: "center",
    },
    keyboardView: {
        flex: 1,
        width: "100%",
        justifyContent: "center",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    card: {
        width: width * 0.88,
        maxWidth: 360,
        backgroundColor: "rgba(127, 183, 148, 0.85)", // Sleek matching green with transparency (Glassmorphism style)
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
        alignItems: "stretch",
    },
    logo: {
        width: "85%",
        height: 75,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 28,
    },
    input: {
        height: 52,
        backgroundColor: "rgba(255, 255, 255, 0.4)", // Translucent background inside inputs
        borderWidth: 1.5,
        borderColor: "rgba(74, 137, 98, 0.3)",
        borderRadius: 26,
        paddingHorizontal: 20,
        marginBottom: 16,
        fontSize: 16,
        color: "#16331F", // Dark green readable text
        fontWeight: "500",
        textAlign: "center",
    },
    inputFocused: {
        borderColor: "#0E6F37", // Highlights when focused
        backgroundColor: "rgba(255, 255, 255, 0.6)",
    },
    button: {
        height: 48,
        backgroundColor: "#008037", // Solid emerald green from Acessar button
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonPressed: {
        backgroundColor: "#006C2D",
        opacity: 0.9,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    linkPressable: {
        paddingVertical: 8,
        alignSelf: "center",
    },
    linkPressed: {
        opacity: 0.7,
    },
    forgotPasswordText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
        textDecorationLine: "underline",
        textAlign: "center",
    },
    registerText: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 4,
    },
    registerTextGreen: {
        color: "#0E562A", // Bold dark green for "Sem cadastro?"
        fontWeight: "bold",
    },
    registerTextWhite: {
        color: "#ffffff",
        fontWeight: "bold",
    },
});