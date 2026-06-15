import React, { useState, useEffect } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    Pressable, 
    ScrollView, 
    Modal, 
    KeyboardTypeOptions, 
    Alert,
    ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

type Props = {
    tipo: "aluno" | "professor" | "usuario";
    onSubmit: (dados: any) => void;
    onCancel: () => void;
};

type FormField = {
    label: string;
    key: string;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
    options?: string[]; // If options are present, render as select picker
};

export const CadastroFormPerson = ({ tipo, onSubmit, onCancel }: Props) => {
    const [step, setStep] = useState(1);
    
    // Dropdown picker state
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activePickerField, setActivePickerField] = useState<string | null>(null);
    const [activePickerOptions, setActivePickerOptions] = useState<string[]>([]);
    
    // Form state
    const [formData, setFormData] = useState<Record<string, string>>({
        // Step 1: Pessoais
        nomeCompleto: "",
        nomePai: "",
        nomeMae: "",
        cpf: "",
        rg: "",
        genero: "",
        dataNascimento: "",
        telefone: "",
        celular: "",
        email: "",
        deficiencia: "Não",
        qualDeficiencia: "",
        // Step 2: Endereço
        logradouro: "",
        numero: "",
        bairro: "",
        complemento: "",
        estado: "",
        cidade: "",
        // Step 3: Perfil
        // Aluno
        matricula: "",
        periodo: "",
        turma: "",
        status: "Ativo",
        // Professor
        matriculaAdpm: "",
        codigoDisciplina: "",
        // Usuário
        cargo: "",
        setor: "",
        // Segurança
        senha: "",
        confirmarSenha: "",
    });

    // States for IBGE API
    const [statesList, setStatesList] = useState<{ sigla: string; nome: string }[]>([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [citiesList, setCitiesList] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);

    const fetchStates = async () => {
        setLoadingStates(true);
        try {
            const response = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
            const list = response.data.map((s: any) => ({
                sigla: s.sigla,
                nome: s.nome
            }));
            setStatesList(list);
        } catch (error) {
            console.error("Erro ao buscar estados do IBGE:", error);
        } finally {
            setLoadingStates(false);
        }
    };

    const fetchCities = async (uf: string) => {
        if (!uf) {
            setCitiesList([]);
            return;
        }
        setLoadingCities(true);
        try {
            const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            const names = response.data.map((c: any) => c.nome);
            setCitiesList(names);
        } catch (error) {
            console.error("Erro ao buscar cidades do IBGE:", error);
            Alert.alert("Erro", "Não foi possível carregar as cidades da API do IBGE.");
            setCitiesList([]);
        } finally {
            setLoadingCities(false);
        }
    };

    useEffect(() => {
        fetchStates();
    }, []);

    const getPickerOptions = (): string[] => {
        if (activePickerField === "estado") {
            return statesList.map(s => s.sigla);
        }
        if (activePickerField === "cidade") {
            return citiesList;
        }
        return activePickerOptions;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === "deficiencia" && value === "Não") {
                updated.qualDeficiencia = "";
            }
            if (field === "estado") {
                updated.cidade = "";
            }
            return updated;
        });
        if (field === "estado") {
            fetchCities(value);
        }
    };

    // Open Custom Dropdown Picker
    const openPicker = (field: string, options: string[]) => {
        setActivePickerField(field);
        setActivePickerOptions(options);
        setPickerVisible(true);
    };

    // Select custom dropdown value
    const selectPickerValue = (value: string) => {
        if (activePickerField) {
            handleInputChange(activePickerField, value);
        }
        setPickerVisible(false);
        setActivePickerField(null);
    };

    // Step Validation
    const validateStep = () => {
        if (step === 1) {
            if (!formData.nomeCompleto.trim()) return "Nome Completo é obrigatório.";
            if (!formData.cpf.trim()) return "CPF é obrigatório.";
            if (!formData.email.trim()) return "E-mail é obrigatório.";
            if (formData.deficiencia === "Sim" && !formData.qualDeficiencia.trim()) {
                return "O campo 'Qual a deficiência?' é obrigatório.";
            }
        }
        if (step === 2) {
            if (!formData.logradouro.trim()) return "Logradouro é obrigatório.";
            if (!formData.numero.trim()) return "Número é obrigatório.";
            if (!formData.bairro.trim()) return "Bairro é obrigatório.";
            if (!formData.estado.trim()) return "Estado é obrigatório.";
            if (!formData.cidade.trim()) return "Cidade é obrigatório.";
        }
        if (step === 3) {
            // Specific validation
            if (tipo === "aluno") {
                if (!formData.matricula.trim()) return "Matrícula é obrigatória.";
                if (!formData.turma.trim()) return "Turma é obrigatória.";
            } else if (tipo === "professor") {
                if (!formData.matriculaAdpm.trim()) return "Matrícula ADPM é obrigatória.";
                if (!formData.codigoDisciplina.trim()) return "Código da Disciplina é obrigatório.";
            } else if (tipo === "usuario") {
                if (!formData.cargo.trim()) return "Cargo é obrigatório.";
                if (!formData.setor.trim()) return "Setor é obrigatório.";
            }
            // Security validation
            if (!formData.senha) return "Senha é obrigatória.";
            if (formData.senha.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
            if (formData.senha !== formData.confirmarSenha) return "As senhas não coincidem.";
        }
        return null;
    };

    const handleNext = () => {
        const error = validateStep();
        if (error) {
            Alert.alert("Campos obrigatórios", error);
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleRegister = () => {
        const error = validateStep();
        if (error) {
            Alert.alert("Erro", error);
            return;
        }
        onSubmit(formData);
    };

    // Render generic input field
    const renderInput = (item: FormField) => {
        const value = formData[item.key] || "";
        
        if (item.options) {
            // Selection dropdown field representation
            return (
                <View key={item.key} style={styles.inputWrapper}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Pressable
                        style={styles.selectInput}
                        onPress={() => openPicker(item.key, item.options!)}
                    >
                        <Text style={[styles.selectInputText, !value && styles.placeholderText]}>
                            {value || item.placeholder}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color="#6b7280" />
                    </Pressable>
                </View>
            );
        }

        return (
            <View key={item.key} style={styles.inputWrapper}>
                <Text style={styles.label}>{item.label}</Text>
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={(text) => handleInputChange(item.key, text)}
                    placeholder={item.placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType={item.keyboardType || "default"}
                    secureTextEntry={item.secureTextEntry}
                    autoCapitalize={item.secureTextEntry ? "none" : "sentences"}
                    autoCorrect={false}
                />
            </View>
        );
    };

    // Step Fields Configurations
    const getStep1Fields = (): FormField[] => {
        const fields: FormField[] = [
            { label: "Nome Completo", key: "nomeCompleto", placeholder: "Digite seu nome completo" },
            { label: "Nome do Pai", key: "nomePai", placeholder: "Digite o nome do pai completo" },
            { label: "Nome da Mãe", key: "nomeMae", placeholder: "Digite o nome da mãe completo" },
            { label: "CPF", key: "cpf", placeholder: "Ex: 000.000.000-00", keyboardType: "numeric" },
            { label: "RG", key: "rg", placeholder: "Ex: 00.000.000-0", keyboardType: "numeric" },
            { label: "Gênero", key: "genero", placeholder: "Selecione um gênero", options: ["Masculino", "Feminino", "Outro", "Prefiro não dizer"] },
            { label: "Data de Nascimento", key: "dataNascimento", placeholder: "Ex: DD/MM/AAAA", keyboardType: "numeric" },
            { label: "Telefone", key: "telefone", placeholder: "Ex: (99) 9999-9999", keyboardType: "phone-pad" },
            { label: "Celular", key: "celular", placeholder: "Ex: (99) 99999-9999", keyboardType: "phone-pad" },
            { label: "E-mail", key: "email", placeholder: "Digite seu e-mail", keyboardType: "email-address" },
            { label: "Possui alguma deficiência?", key: "deficiencia", placeholder: "Não", options: ["Não", "Sim"] },
        ];

        if (formData.deficiencia === "Sim") {
            fields.push({
                label: "Qual a deficiência?",
                key: "qualDeficiencia",
                placeholder: "Descreva a deficiência"
            });
        }

        return fields;
    };

    const getStep2Fields = (): FormField[] => [
        { label: "Logradouro (Rua, Av.)", key: "logradouro", placeholder: "Ex: Rua, Avenida, Travessa..." },
        { label: "Número", key: "numero", placeholder: "Ex: 1234", keyboardType: "numeric" },
        { label: "Bairro", key: "bairro", placeholder: "Ex: Centro" },
        { label: "Complemento", key: "complemento", placeholder: "Ex: Casa, Apto, Bloco" },
        { 
            label: "Estado (UF)", 
            key: "estado", 
            placeholder: "Selecione o estado", 
            options: statesList.map(s => s.sigla) 
        },
        { 
            label: "Cidade", 
            key: "cidade", 
            placeholder: "Selecione a cidade", 
            options: citiesList 
        },
    ];

    const getStep3Fields = (): FormField[] => {
        const fields: FormField[] = [];
        
        // Add dynamic specific fields based on profile type
        if (tipo === "aluno") {
            fields.push(
                { label: "Matrícula", key: "matricula", placeholder: "Ex: 123456", keyboardType: "numeric" },
                { label: "Período", key: "periodo", placeholder: "Selecione o período", options: ["1º Ano", "2º Ano", "3º Ano", "4º Ano"] },
                { label: "Turma", key: "turma", placeholder: "Selecione a turma", options: ["Turma A", "Turma B", "Turma C"] },
                { label: "Status", key: "status", placeholder: "Ativo", options: ["Ativo", "Inativo"] }
            );
        } else if (tipo === "professor") {
            fields.push(
                { label: "Matrícula ADPM", key: "matriculaAdpm", placeholder: "Ex: 123456", keyboardType: "numeric" },
                { label: "Código da Disciplina", key: "codigoDisciplina", placeholder: "Ex: MAT101", keyboardType: "default" }
            );
        } else if (tipo === "usuario") {
            fields.push(
                { label: "Cargo", key: "cargo", placeholder: "Ex: Diretora, Secretária" },
                { label: "Setor", key: "setor", placeholder: "Ex: Secretaria, Financeiro", options: ["Secretaria", "Financeiro", "Administração", "TI"] }
            );
        }

        // Add security fields (always required at Step 3)
        fields.push(
            { label: "Senha", key: "senha", placeholder: "Digite sua senha", secureTextEntry: true },
            { label: "Confirmar Senha", key: "confirmarSenha", placeholder: "Repita sua senha", secureTextEntry: true }
        );

        return fields;
    };

    return (
        <View style={styles.container}>
            {/* Stepper visual indicator */}
            <View style={styles.stepperContainer}>
                <View style={styles.stepperRow}>
                    {/* Step 1 */}
                    <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                        {step > 1 ? (
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                        ) : (
                            <Text style={styles.stepCircleText}>1</Text>
                        )}
                    </View>
                    <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

                    {/* Step 2 */}
                    <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                        {step > 2 ? (
                            <Ionicons name="checkmark" size={16} color="#ffffff" />
                        ) : (
                            <Text style={[styles.stepCircleText, step < 2 && styles.stepCircleTextInactive]}>2</Text>
                        )}
                    </View>
                    <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />

                    {/* Step 3 */}
                    <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
                        <Text style={[styles.stepCircleText, step < 3 && styles.stepCircleTextInactive]}>3</Text>
                    </View>
                </View>
                <View style={styles.stepLabelsRow}>
                    <Text style={[styles.stepLabel, step >= 1 && styles.stepLabelActive]}>Pessoal</Text>
                    <Text style={[styles.stepLabel, step >= 2 && styles.stepLabelActive]}>Endereço</Text>
                    <Text style={[styles.stepLabel, step >= 3 && styles.stepLabelActive]}>Segurança</Text>
                </View>
            </View>

            {/* Scrollable form content */}
            <ScrollView 
                style={styles.formScroll} 
                contentContainerStyle={styles.formScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {step === 1 && (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
                        {getStep1Fields().map(renderInput)}
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Informações de Endereço</Text>
                        {getStep2Fields().map(renderInput)}
                    </View>
                )}

                {step === 3 && (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>
                            {tipo === "aluno" && "Dados Escolares & Senha"}
                            {tipo === "professor" && "Dados Profissionais & Senha"}
                            {tipo === "usuario" && "Dados Profissionais & Senha"}
                        </Text>
                        {getStep3Fields().map(renderInput)}
                    </View>
                )}
            </ScrollView>

            {/* Navigation buttons at bottom */}
            <View style={styles.footer}>
                {step > 1 ? (
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </Pressable>
                )}

                {step < 3 ? (
                    <Pressable style={styles.nextButton} onPress={handleNext}>
                        <Text style={styles.nextButtonText}>Avançar</Text>
                    </Pressable>
                ) : (
                    <Pressable style={styles.submitButton} onPress={handleRegister}>
                        <Text style={styles.submitButtonText}>Cadastrar</Text>
                    </Pressable>
                )}
            </View>

            {/* Custom dropdown picker options list modal */}
            <Modal
                visible={pickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerVisible(false)}
            >
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerModal}>
                        <Text style={styles.pickerTitle}>Selecione uma opção</Text>
                        {activePickerField === "estado" && loadingStates ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#1D8C43" />
                                <Text style={styles.pickerLoadingText}>Carregando estados...</Text>
                            </View>
                        ) : activePickerField === "cidade" && loadingCities ? (
                            <View style={styles.pickerLoading}>
                                <ActivityIndicator size="large" color="#1D8C43" />
                                <Text style={styles.pickerLoadingText}>Carregando cidades...</Text>
                            </View>
                        ) : (
                            <ScrollView style={styles.pickerScroll}>
                                {getPickerOptions().map((opt) => (
                                    <Pressable
                                        key={opt}
                                        style={styles.pickerOption}
                                        onPress={() => selectPickerValue(opt)}
                                    >
                                        <Text style={styles.pickerOptionText}>{opt}</Text>
                                    </Pressable>
                                ))}
                                {getPickerOptions().length === 0 && (
                                    <View style={{ alignItems: "center", paddingVertical: 20 }}>
                                        <Text style={styles.pickerEmptyText}>
                                            {activePickerField === "cidade" && !formData.estado 
                                                ? "Selecione um estado primeiro." 
                                                : "Nenhuma opção encontrada."}
                                        </Text>
                                        {activePickerField === "estado" && !loadingStates && (
                                            <Pressable 
                                                style={styles.retryButton} 
                                                onPress={fetchStates}
                                            >
                                                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                                            </Pressable>
                                        )}
                                        {activePickerField === "cidade" && formData.estado && !loadingCities && (
                                            <Pressable 
                                                style={styles.retryButton} 
                                                onPress={() => fetchCities(formData.estado)}
                                            >
                                                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                                            </Pressable>
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        )}
                        <Pressable 
                            style={styles.pickerCloseButton} 
                            onPress={() => setPickerVisible(false)}
                        >
                            <Text style={styles.pickerCloseButtonText}>Fechar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    stepperContainer: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    stepperRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    stepCircleActive: {
        backgroundColor: "#1D8C43", // Dark Green active theme
    },
    stepCircleText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#ffffff",
    },
    stepCircleTextInactive: {
        color: "#6b7280",
    },
    stepLine: {
        flex: 0.3,
        height: 3,
        backgroundColor: "#e5e7eb",
        marginHorizontal: -2,
        zIndex: 1,
    },
    stepLineActive: {
        backgroundColor: "#1D8C43",
    },
    stepLabelsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#9ca3af",
    },
    stepLabelActive: {
        color: "#1D8C43",
        fontWeight: "bold",
    },
    formScroll: {
        flex: 1,
    },
    formScrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    formSection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#374151",
        marginBottom: 8,
    },
    inputWrapper: {
        width: "100%",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
        marginBottom: 6,
    },
    textInput: {
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#1f2937",
    },
    selectInput: {
        height: 48,
        backgroundColor: "#ffffff",
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectInputText: {
        fontSize: 15,
        color: "#1f2937",
    },
    placeholderText: {
        color: "#9ca3af",
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        justifyContent: "space-between",
        gap: 12,
    },
    nextButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#1D8C43",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    nextButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#ffffff",
    },
    submitButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#1D8C43",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#ffffff",
    },
    backButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#4b5563",
    },
    cancelButton: {
        flex: 1,
        height: 48,
        backgroundColor: "#fef2f2",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#fee2e2",
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#dc2626",
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    pickerModal: {
        width: "100%",
        maxHeight: "60%",
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 16,
        textAlign: "center",
    },
    pickerScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    pickerOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        alignItems: "center",
    },
    pickerOptionText: {
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
    },
    pickerCloseButton: {
        height: 44,
        backgroundColor: "#f3f4f6",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    pickerCloseButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },
    pickerLoading: {
        paddingVertical: 30,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    pickerLoadingText: {
        fontSize: 14,
        color: "#6b7280",
        fontWeight: "500",
    },
    pickerEmptyText: {
        textAlign: "center",
        fontSize: 14,
        color: "#9ca3af",
        paddingVertical: 10,
    },
    retryButton: {
        marginTop: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#1D8C43",
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "bold",
    },
});
