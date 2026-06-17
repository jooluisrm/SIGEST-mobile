import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";
import { useCreateProfessorMutation } from "@/api/professor";
import { CreateProfessorRequest } from "@/types/professor";
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

export default function CadastroProfessor() {
    const router = useRouter();
    const { mutateAsync, isPending } = useCreateProfessorMutation();
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
        
        // Clean CPF, RG, Telefone, and Celular formatting before sending
        const cleanCpf = dados.cpf.replace(/\D/g, "");
        const cleanRg = dados.rg.replace(/[^0-9Xx]/g, "");
        const cleanTelefone = dados.telefone.replace(/\D/g, "");
        const cleanCelular = dados.celular.replace(/\D/g, "");
        
        // Build the payload
        const payload: CreateProfessorRequest = {
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
            password: dados.senha,
            matricula_adpm: dados.matriculaAdpm,
            codigo_disciplina: dados.codigoDisciplina,
        };

        try {
            await mutateAsync(payload);
            Alert.alert("Sucesso", "Professor cadastrado com sucesso!");
            router.back();
        } catch (error: any) {
            console.error("Erro ao cadastrar professor:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao cadastrar o professor.";
                    Alert.alert("Erro", msg);
                }
            } else {
                Alert.alert("Erro", "Ocorreu uma falha na comunicação com o servidor.");
            }
        }
    };

    return (
        <CadastroFormPerson 
            tipo="professor" 
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isPending}
            errorMessages={errorMessages}
            onClearError={handleClearError}
        />
    );
}
