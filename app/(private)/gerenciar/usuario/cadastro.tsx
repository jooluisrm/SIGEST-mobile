import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";
import { useCreateServidorMutation, useUsuarioQuery, useUpdateUsuarioMutation } from "@/api/usuario";
import { CreateServidorRequest, UpdateServidorRequest } from "@/types/usuario";
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

function mapServidorToForm(servidor: any): any {
    return {
        nomeCompleto: servidor.name || "",
        nomePai: servidor.nome_pai || "",
        nomeMae: servidor.nome_mae || "",
        cpf: servidor.cpf || "",
        rg: servidor.rg || "",
        genero: servidor.genero || "",
        dataNascimento: servidor.data_nascimento ? formatDateISOToBR(servidor.data_nascimento) : "",
        telefone: servidor.telefone || "",
        celular: servidor.celular || "",
        email: servidor.email || "",
        deficiencia: servidor.deficiencia && servidor.deficiencia !== "Nenhuma" ? "Sim" : "Não",
        qualDeficiencia: servidor.deficiencia && servidor.deficiencia !== "Nenhuma" ? servidor.deficiencia : "",
        logradouro: servidor.logradouro || "",
        numero: servidor.numero || "",
        bairro: servidor.bairro || "",
        complemento: servidor.complemento || "",
        estado: servidor.estado || "",
        cidade: servidor.cidade || "",
        cargo: servidor.cargo || "",
        setor: servidor.setor || "",
    };
}

export default function CadastroUsuario() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createServidor, isPending: isCreating } = useCreateServidorMutation();
    const { mutateAsync: updateServidor, isPending: isUpdating } = useUpdateUsuarioMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useUsuarioQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Usuário" : "Cadastrar Usuário"
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
            cargo: dados.cargo,
            setor: dados.setor,
        };

        // password field is ignored by the backend in update, so we only send it on create
        if (!id) {
            payload.password = dados.senha;
        }

        try {
            if (id) {
                await updateServidor({ id, payload: payload as UpdateServidorRequest });
                Alert.alert("Sucesso", "Usuário atualizado com sucesso!");
            } else {
                await createServidor(payload as CreateServidorRequest);
                Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar usuário:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar o usuário.";
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
                <Text style={styles.loadingText}>Buscando dados do usuário...</Text>
            </View>
        );
    }

    const initialData = queryData?.data ? mapServidorToForm(queryData.data) : undefined;

    return (
        <CadastroFormPerson 
            tipo="usuario" 
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
