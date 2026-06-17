import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";
import { useCreateAlunoMutation } from "@/api/aluno";
import { CreateAlunoRequest } from "@/types/aluno";
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

function mapPeriodToId(period: string): number | null {
    switch (period) {
        case "1º Ano": return 1;
        case "2º Ano": return 2;
        case "3º Ano": return 3;
        case "4º Ano": return 4;
        default: return null;
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

export default function CadastroAluno() {
    const router = useRouter();
    const { mutateAsync, isPending } = useCreateAlunoMutation();
    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

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
        
        // Build the payload
        const payload: CreateAlunoRequest = {
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
            await mutateAsync(payload);
            Alert.alert("Sucesso", "Aluno cadastrado com sucesso!");
            router.back();
        } catch (error: any) {
            console.error("Erro ao cadastrar aluno:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao cadastrar o aluno.";
                    Alert.alert("Erro", msg);
                }
            } else {
                Alert.alert("Erro", "Ocorreu uma falha na comunicação com o servidor.");
            }
        }
    };

    return (
        <CadastroFormPerson 
            tipo="aluno" 
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isPending}
            errorMessages={errorMessages}
            onClearError={handleClearError}
        />
    );
}
