import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";
import { useCreateAlunoMutation, useAlunoQuery, useUpdateAlunoMutation } from "@/api/aluno";
import { CreateAlunoRequest, UpdateAlunoRequest } from "@/types/aluno";
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

function mapPeriodToId(period: string): number | null {
    switch (period) {
        case "1º Ano": return 1;
        case "2º Ano": return 2;
        case "3º Ano": return 3;
        case "4º Ano": return 4;
        default: return null;
    }
}

function mapPeriodIdToName(periodId: number | null): string {
    switch (periodId) {
        case 1: return "1º Ano";
        case 2: return "2º Ano";
        case 3: return "3º Ano";
        case 4: return "4º Ano";
        default: return "";
    }
}

function mapTurmaToId(turma: string): number | null {
    switch (turma) {
        case "Turma A": return 1;
        case "Turma B": return 2;
        case "Turma C": return 3;
        default: return null;
    }
}

function mapTurmaIdToName(classroomId: number | null): string {
    switch (classroomId) {
        case 1: return "Turma A";
        case 2: return "Turma B";
        case 3: return "Turma C";
        default: return "";
    }
}

function mapAlunoToForm(aluno: any): any {
    return {
        nomeCompleto: aluno.name || "",
        nomePai: aluno.nome_pai || "",
        nomeMae: aluno.nome_mae || "",
        cpf: aluno.cpf || "",
        rg: aluno.rg || "",
        genero: aluno.genero || "",
        dataNascimento: aluno.data_nascimento ? formatDateISOToBR(aluno.data_nascimento) : "",
        telefone: aluno.telefone || "",
        celular: aluno.celular || "",
        email: aluno.email || "",
        deficiencia: aluno.deficiencia && aluno.deficiencia !== "Nenhuma" ? "Sim" : "Não",
        qualDeficiencia: aluno.deficiencia && aluno.deficiencia !== "Nenhuma" ? aluno.deficiencia : "",
        logradouro: aluno.logradouro || "",
        numero: aluno.numero || "",
        bairro: aluno.bairro || "",
        complemento: aluno.complemento || "",
        estado: aluno.estado || "",
        cidade: aluno.cidade || "",
        matricula: aluno.matricula || "",
        periodo: mapPeriodIdToName(aluno.period_id),
        turma: mapTurmaIdToName(aluno.classroom_id),
        status: aluno.status ? "Ativo" : "Inativo",
    };
}

export default function CadastroAluno() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();
    
    // Mutations & Queries
    const { mutateAsync: createAluno, isPending: isCreating } = useCreateAlunoMutation();
    const { mutateAsync: updateAluno, isPending: isUpdating } = useUpdateAlunoMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useAlunoQuery(id || "");
    
    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Aluno" : "Cadastrar Aluno"
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
        
        // Clean formatting from CPF, RG, Telefone, and Celular before sending
        const cleanCpf = dados.cpf.replace(/\D/g, "");
        const cleanRg = dados.rg.replace(/[^0-9Xx]/g, "");
        const cleanTelefone = dados.telefone.replace(/\D/g, "");
        const cleanCelular = dados.celular.replace(/\D/g, "");
        
        // Build the payload (name is always required/sent for both create & update)
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
            matricula: dados.matricula,
            status: dados.status === "Ativo", // Map Active/Inactive string to Boolean
            period_id: mapPeriodToId(dados.periodo),
            classroom_id: mapTurmaToId(dados.turma),
        };

        try {
            if (id) {
                await updateAluno({ id, payload: payload as UpdateAlunoRequest });
                Alert.alert("Sucesso", "Aluno atualizado com sucesso!");
            } else {
                await createAluno(payload as CreateAlunoRequest);
                Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar aluno:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar o aluno.";
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
                <Text style={styles.loadingText}>Buscando dados do aluno...</Text>
            </View>
        );
    }

    const initialData = queryData?.data ? mapAlunoToForm(queryData.data) : undefined;

    return (
        <CadastroFormPerson 
            tipo="aluno" 
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
