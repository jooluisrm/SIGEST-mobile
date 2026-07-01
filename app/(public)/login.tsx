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
    Dimensions,
    ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

const { width } = Dimensions.get("window");

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [secureText, setSecureText] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string[]; password?: string[] }>({});
    
    const router = useRouter();
    const { signIn } = useAuth();

    const handleLogin = async () => {
        // Validação local prévia
        if (!email.trim() || !password.trim()) {
            setGeneralError("Por favor, preencha todos os campos.");
            return;
        }

        setIsLoading(true);
        setGeneralError("");
        setFieldErrors({});

        try {
            await signIn(email, password);
            // No sucesso, o AuthProvider atualiza o estado e o redirecionamento é automático no _layout.tsx
        } catch (error: any) {
            console.error("Erro ao fazer login:", error);

            if (error.response) {
                const status = error.response.status;
                const responseData = error.response.data;

                if (status === 401) {
                    setGeneralError(responseData.message || "E-mail ou senha incorretos.");
                } else if (status === 422) {
                    if (responseData.errors) {
                        setFieldErrors(responseData.errors);
                    }
                    setGeneralError(responseData.message || "Erro de validação nos dados enviados.");
                } else {
                    setGeneralError("Erro no servidor. Tente novamente mais tarde.");
                }
            } else {
                setGeneralError("Não foi possível conectar ao servidor. Verifique a conexão com a API.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        router.push("/recuperar-senha");
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

                                {/* Alerta Geral de Erro */}
                                {generalError ? (
                                    <View style={styles.errorBanner}>
                                        <Text style={styles.errorBannerText}>{generalError}</Text>
                                    </View>
                                ) : null}

                                {/* E-mail Input */}
                                <TextInput
                                    style={[
                                        styles.input,
                                        isEmailFocused && styles.inputFocused,
                                        fieldErrors.email && styles.inputError
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
                                    editable={!isLoading}
                                />
                                {fieldErrors.email ? (
                                    <Text style={styles.fieldErrorText}>{fieldErrors.email[0]}</Text>
                                ) : null}

                                {/* Password Input */}
                                <View style={[
                                    styles.passwordContainer,
                                    isPasswordFocused && styles.passwordContainerFocused,
                                    fieldErrors.password && styles.passwordContainerError
                                ]}>
                                    <TextInput
                                        style={styles.inputPassword}
                                        placeholder="Senha"
                                        placeholderTextColor="rgba(30, 58, 39, 0.6)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={secureText}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setIsPasswordFocused(true)}
                                        onBlur={() => setIsPasswordFocused(false)}
                                        editable={!isLoading}
                                    />
                                    <Pressable 
                                        onPress={() => setSecureText(!secureText)}
                                        style={styles.eyeIcon}
                                        disabled={isLoading}
                                    >
                                        <Ionicons 
                                            name={secureText ? "eye-off-outline" : "eye-outline"} 
                                            size={20} 
                                            color="rgba(30, 58, 39, 0.7)" 
                                        />
                                    </Pressable>
                                </View>
                                {fieldErrors.password ? (
                                    <Text style={styles.fieldErrorText}>{fieldErrors.password[0]}</Text>
                                ) : null}

                                {/* Submit Button */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.button,
                                        pressed && styles.buttonPressed,
                                        isLoading && styles.buttonDisabled
                                    ]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#ffffff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Acessar</Text>
                                    )}
                                </Pressable>

                                {/* Forgot Password Link */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.linkPressable,
                                        pressed && styles.linkPressed
                                    ]}
                                    onPress={handleForgotPassword}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.forgotPasswordText}>Recuperar Senha</Text>
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
    passwordContainer: {
        position: 'relative',
        marginBottom: 16,
        height: 52,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderWidth: 1.5,
        borderColor: "rgba(74, 137, 98, 0.3)",
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    passwordContainerFocused: {
        borderColor: "#0E6F37",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
    },
    passwordContainerError: {
        borderColor: "#ff5252",
        backgroundColor: "rgba(211, 47, 47, 0.15)",
    },
    inputPassword: {
        flex: 1,
        height: "100%",
        fontSize: 16,
        color: "#16331F",
        fontWeight: "500",
        textAlign: "center",
        paddingLeft: 24,
    },
    eyeIcon: {
        width: 24,
        height: "100%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBanner: {
        backgroundColor: "rgba(211, 47, 47, 0.25)",
        borderColor: "#ff5252",
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    errorBannerText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    inputError: {
        borderColor: "#ff5252",
        backgroundColor: "rgba(211, 47, 47, 0.15)",
    },
    fieldErrorText: {
        color: "#ff5252",
        fontSize: 12,
        fontWeight: "700",
        marginTop: -12,
        marginBottom: 12,
        marginLeft: 16,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    buttonDisabled: {
        backgroundColor: "#558B6E",
        opacity: 0.8,
    },
});