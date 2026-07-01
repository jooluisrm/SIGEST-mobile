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
    ActivityIndicator,
    Alert
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { 
    forgotPasswordCodeRequest, 
    resetPasswordValidateCodeRequest, 
    resetPasswordCodeRequest 
} from "../../src/api/auth";
import { 
    forgotPasswordSchema, 
    validateCodeSchema, 
    resetPasswordSchema 
} from "../../src/schema/recuperar-senha";

const { width } = Dimensions.get("window");

export default function RecuperarSenha() {
    const router = useRouter();
    
    // Recovery wizard steps: 1 = Email, 2 = Code, 3 = New Password
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Form field states
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    
    // Focus states
    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isConfirmFocused, setIsConfirmFocused] = useState(false);
    
    // Password visibility toggle states
    const [secureText, setSecureText] = useState(true);
    const [secureConfirmText, setSecureConfirmText] = useState(true);
    
    // Status states
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string[]; code?: string[]; password?: string[]; passwordConfirmation?: string[] }>({});

    // Step 1: Send recovery email
    const handleSendCode = async () => {
        setGeneralError("");
        setFieldErrors({});

        // Validate local input with Zod
        const result = forgotPasswordSchema.safeParse({ email });
        if (!result.success) {
            const formatted = result.error.format();
            setFieldErrors({ email: formatted.email?._errors });
            return;
        }

        setIsLoading(true);
        try {
            await forgotPasswordCodeRequest({ email });
            setStep(2);
        } catch (error: any) {
            console.error("Erro ao solicitar código:", error);
            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError("Não foi possível enviar o código. Verifique sua conexão ou se o e-mail está correto.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Validate the code sent to email
    const handleValidateCode = async () => {
        setGeneralError("");
        setFieldErrors({});

        const result = validateCodeSchema.safeParse({ code });
        if (!result.success) {
            const formatted = result.error.format();
            setFieldErrors({ code: formatted.code?._errors });
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordValidateCodeRequest({ email, code });
            setStep(3);
        } catch (error: any) {
            console.error("Erro ao validar código:", error);
            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError("Código inválido ou expirado. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Set new password
    const handleResetPassword = async () => {
        setGeneralError("");
        setFieldErrors({});

        const result = resetPasswordSchema.safeParse({ password, passwordConfirmation });
        if (!result.success) {
            const formatted = result.error.format();
            setFieldErrors({ 
                password: formatted.password?._errors,
                passwordConfirmation: formatted.passwordConfirmation?._errors 
            });
            return;
        }

        setIsLoading(true);
        try {
            await resetPasswordCodeRequest({ email, code, password });
            Alert.alert("Sucesso", "Senha redefinida com sucesso!", [
                { text: "Entrar", onPress: () => router.replace("/login") }
            ]);
        } catch (error: any) {
            console.error("Erro ao redefinir senha:", error);
            if (error.response?.data?.message) {
                setGeneralError(error.response.data.message);
            } else {
                setGeneralError("Não foi possível redefinir a senha. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
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
                                {/* Header / Logo */}
                                <Image
                                    source={require("../../assets/sigest-logo.png")}
                                    style={styles.logo}
                                />
                                
                                <Text style={styles.cardTitle}>Recuperar Senha</Text>

                                {/* General Error Banner */}
                                {generalError ? (
                                    <View style={styles.errorBanner}>
                                        <Text style={styles.errorBannerText}>{generalError}</Text>
                                    </View>
                                ) : null}

                                {/* Step 1: Input Email */}
                                {step === 1 && (
                                    <View style={styles.stepContainer}>
                                        <Text style={styles.instructionText}>
                                            Digite seu e-mail cadastrado no sistema para receber o código de recuperação.
                                        </Text>

                                        <TextInput
                                            style={[
                                                styles.input,
                                                isEmailFocused && styles.inputFocused,
                                                fieldErrors.email && styles.inputError
                                            ]}
                                            placeholder="E-mail cadastrado"
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

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.button,
                                                pressed && styles.buttonPressed,
                                                isLoading && styles.buttonDisabled
                                            ]}
                                            onPress={handleSendCode}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#ffffff" />
                                            ) : (
                                                <Text style={styles.buttonText}>Enviar Código</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                )}

                                {/* Step 2: Input Code */}
                                {step === 2 && (
                                    <View style={styles.stepContainer}>
                                        <Text style={styles.instructionText}>
                                            Enviamos um código de verificação para <Text style={styles.boldText}>{email}</Text>. Digite o código de 6 dígitos abaixo:
                                        </Text>

                                        <TextInput
                                            style={[
                                                styles.input,
                                                isCodeFocused && styles.inputFocused,
                                                fieldErrors.code && styles.inputError
                                            ]}
                                            placeholder="Código de 6 dígitos"
                                            placeholderTextColor="rgba(30, 58, 39, 0.6)"
                                            value={code}
                                            onChangeText={(val) => setCode(val.replace(/[^0-9]/g, ""))}
                                            keyboardType="numeric"
                                            maxLength={6}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            onFocus={() => setIsCodeFocused(true)}
                                            onBlur={() => setIsCodeFocused(false)}
                                            editable={!isLoading}
                                        />
                                        {fieldErrors.code ? (
                                            <Text style={styles.fieldErrorText}>{fieldErrors.code[0]}</Text>
                                        ) : null}

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.button,
                                                pressed && styles.buttonPressed,
                                                isLoading && styles.buttonDisabled
                                            ]}
                                            onPress={handleValidateCode}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#ffffff" />
                                            ) : (
                                                <Text style={styles.buttonText}>Validar Código</Text>
                                            )}
                                        </Pressable>

                                        <Pressable 
                                            onPress={() => {
                                                setStep(1);
                                                setCode("");
                                            }}
                                            style={styles.backLink}
                                            disabled={isLoading}
                                        >
                                            <Text style={styles.backLinkText}>Voltar / Alterar E-mail</Text>
                                        </Pressable>
                                    </View>
                                )}

                                {/* Step 3: Input New Password */}
                                {step === 3 && (
                                    <View style={styles.stepContainer}>
                                        <Text style={styles.instructionText}>
                                            Defina sua nova senha de acesso abaixo. Ela deve conter pelo menos 8 dígitos.
                                        </Text>

                                        {/* Password input */}
                                        <View style={[
                                            styles.passwordContainer,
                                            isPasswordFocused && styles.passwordContainerFocused,
                                            fieldErrors.password && styles.passwordContainerError
                                        ]}>
                                            <TextInput
                                                style={styles.inputPassword}
                                                placeholder="Nova Senha"
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

                                        {/* Confirmation input */}
                                        <View style={[
                                            styles.passwordContainer,
                                            isConfirmFocused && styles.passwordContainerFocused,
                                            fieldErrors.passwordConfirmation && styles.passwordContainerError
                                        ]}>
                                            <TextInput
                                                style={styles.inputPassword}
                                                placeholder="Confirmar Nova Senha"
                                                placeholderTextColor="rgba(30, 58, 39, 0.6)"
                                                value={passwordConfirmation}
                                                onChangeText={setPasswordConfirmation}
                                                secureTextEntry={secureConfirmText}
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                onFocus={() => setIsConfirmFocused(true)}
                                                onBlur={() => setIsConfirmFocused(false)}
                                                editable={!isLoading}
                                            />
                                            <Pressable 
                                                onPress={() => setSecureConfirmText(!secureConfirmText)}
                                                style={styles.eyeIcon}
                                                disabled={isLoading}
                                            >
                                                <Ionicons 
                                                    name={secureConfirmText ? "eye-off-outline" : "eye-outline"} 
                                                    size={20} 
                                                    color="rgba(30, 58, 39, 0.7)" 
                                                />
                                            </Pressable>
                                        </View>
                                        {fieldErrors.passwordConfirmation ? (
                                            <Text style={styles.fieldErrorText}>{fieldErrors.passwordConfirmation[0]}</Text>
                                        ) : null}

                                        <Pressable
                                            style={({ pressed }) => [
                                                styles.button,
                                                pressed && styles.buttonPressed,
                                                isLoading && styles.buttonDisabled
                                            ]}
                                            onPress={handleResetPassword}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="#ffffff" />
                                            ) : (
                                                <Text style={styles.buttonText}>Redefinir Senha</Text>
                                            )}
                                        </Pressable>
                                    </View>
                                )}

                                {/* Back to Login Link */}
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.linkPressable,
                                        pressed && styles.linkPressed
                                    ]}
                                    onPress={() => router.replace("/login")}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.loginLinkText}>Voltar para o Login</Text>
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
        backgroundColor: "rgba(0, 0, 0, 0.45)",
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
        backgroundColor: "rgba(127, 183, 148, 0.85)",
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
        height: 60,
        resizeMode: "contain",
        alignSelf: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 24,
        textShadowColor: "rgba(0, 0, 0, 0.15)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    stepContainer: {
        alignItems: "stretch",
    },
    instructionText: {
        fontSize: 14,
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
        fontWeight: "500",
    },
    boldText: {
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    input: {
        height: 52,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        borderWidth: 1.5,
        borderColor: "rgba(74, 137, 98, 0.3)",
        borderRadius: 26,
        paddingHorizontal: 20,
        marginBottom: 16,
        fontSize: 16,
        color: "#16331F",
        fontWeight: "500",
        textAlign: "center",
    },
    inputFocused: {
        borderColor: "#0E6F37",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
    },
    button: {
        height: 48,
        backgroundColor: "#008037",
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
    loginLinkText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
        textAlign: "center",
        marginTop: 8,
    },
    backLink: {
        alignSelf: "center",
        paddingVertical: 4,
        marginBottom: 12,
    },
    backLinkText: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "600",
        textDecorationLine: "underline",
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
