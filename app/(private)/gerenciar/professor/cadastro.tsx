import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";
import { useCreateProfessorMutation, useProfessorQuery, useUpdateProfessorMutation } from "@/api/professor";
import { CreateProfessorRequest, UpdateProfessorRequest } from "@/types/professor";
import axios from "axios";

function parseDateBRToISO(dateStr: string): string {
    const parts = dateStr.trim().split("/");
    if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

function formatDateISOToBR(dateStr: string): string {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

function mapProfessorToForm(professor: any): any {
    return {
        nomeCompleto: professor.name || "",
        nomePai: professor.nome_pai || "",
        nomeMae: professor.nome_mae || "",
        cpf: professor.cpf || "",
        rg: professor.rg || "",
        genero: professor.genero || "",
        dataNascimento: professor.data_nascimento ? formatDateISOToBR(professor.data_nascimento) : "",
        telefone: professor.telefone || "",
        celular: professor.celular || "",
        email: professor.email || "",
        deficiencia: professor.deficiencia && professor.deficiencia !== "Nenhuma" ? "Sim" : "Não",
        qualDeficiencia: professor.deficiencia && professor.deficiencia !== "Nenhuma" ? professor.deficiencia : "",
        logradouro: professor.logradouro || "",
        numero: professor.numero || "",
        bairro: professor.bairro || "",
        complemento: professor.complemento || "",
        estado: professor.estado || "",
        cidade: professor.cidade || "",
        matriculaAdpm: professor.matricula_adpm || "",
        codigoDisciplina: professor.codigo_disciplina || "",
    };
}

export default function CadastroProfessor() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createProfessor, isPending: isCreating } = useCreateProfessorMutation();
    const { mutateAsync: updateProfessor, isPending: isUpdating } = useUpdateProfessorMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useProfessorQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Professor" : "Cadastrar Professor"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: any) => {
        setErrorMessages({});
        
        // Clean CPF, RG, Telefone, and Celular formatting before sending
        const cleanCpf = dados.cpf.replace(/\D/g, "");
        const cleanRg = dados.rg.replace(/[^0-9Xx]/g, "");
        const cleanTelefone = dados.telefone.replace(/\D/g, "");
        const cleanCelular = dados.celular.replace(/\D/g, "");
        
        // Build the payload
        const payload: any = {
            name: dados.nomeCompleto,
            cpf: cleanCpf,
            rg: cleanRg,
            data_nascimento: parseDateBRToISO(dados.dataNascimento),
            nome_pai: dados.nomePai,
            nome_mae: dados.nomeMae,
            genero: dados.genero || null,
            deficiencia: dados.deficiencia === "Sim" ? dados.qualDeficiencia : "Nenhuma",
            logradouro: dados.logradouro,
            numero: dados.numero || "",
            bairro: dados.bairro,
            complemento: dados.complemento || null,
            cidade: dados.cidade,
            estado: dados.estado,
            telefone: cleanTelefone,
            celular: cleanCelular,
            email: dados.email,
            matricula_adpm: dados.matriculaAdpm,
            codigo_disciplina: dados.codigoDisciplina,
        };

        // password field is ignored by the backend in update, so we only send it on create
        if (!id) {
            payload.password = dados.senha;
        }

        try {
            if (id) {
                await updateProfessor({ id, payload: payload as UpdateProfessorRequest });
                Alert.alert("Sucesso", "Professor atualizado com sucesso!");
            } else {
                await createProfessor(payload as CreateProfessorRequest);
                Alert.alert("Sucesso", "Professor cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar professor:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar o professor.";
                    Alert.alert("Erro", msg);
                }
            } else {
                Alert.alert("Erro", "Ocorreu uma falha na comunicação com o servidor.");
            }
        }
    };

    if (id && isLoadingQuery) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#52B28B" />
                <Text style={styles.loadingText}>Buscando dados do professor...</Text>
            </View>
        );
    }

    const initialData = queryData?.data ? mapProfessorToForm(queryData.data) : undefined;

    return (
        <CadastroFormPerson 
            tipo="professor" 
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isCreating || isUpdating}
            errorMessages={errorMessages}
            onClearError={handleClearError}
            initialData={initialData}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: "#6b7280",
        fontWeight: "500",
    },
});
