import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { MatriculaForm } from "@/components/gerenciar/matricula/matricula-form";
import { 
    useCreateMatriculaMutation, 
    useMatriculaQuery, 
    useUpdateMatriculaMutation 
} from "@/api/matricula";
import { CreateMatriculaRequest, UpdateMatriculaRequest } from "@/types/matricula";
import { CadastroMatriculaFormData } from "@/schema/cadastro-matricula";
import axios from "axios";

function parseDateBRToISO(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const parts = dateStr.trim().split("/");
    if (parts.length === 3) {
        const day = parts[0].padStart(2, "0");
        const month = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

export default function CadastroMatricula() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createMatricula, isPending: isCreating } = useCreateMatriculaMutation();
    const { mutateAsync: updateMatricula, isPending: isUpdating } = useUpdateMatriculaMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useMatriculaQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Matrícula" : "Cadastrar Matrícula"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: CadastroMatriculaFormData) => {
        setErrorMessages({});

        const payload: CreateMatriculaRequest = {
            aluno_id: dados.aluno_id,
            serie_id: dados.serie_id,
            codigo_matricula: dados.codigo_matricula,
            data_matricula: parseDateBRToISO(dados.data_matricula)!,
            data_cancelamento: dados.data_cancelamento ? parseDateBRToISO(dados.data_cancelamento) : null,
            status: dados.status,
        };

        try {
            if (id) {
                await updateMatricula({ id, payload: payload as UpdateMatriculaRequest });
                Alert.alert("Sucesso", "Matrícula atualizada com sucesso!");
            } else {
                await createMatricula(payload);
                Alert.alert("Sucesso", "Matrícula criada com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar matrícula:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else if (error.response.status === 422 && responseData?.errors) {
                    setErrorMessages(responseData.errors);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar a matrícula.";
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
                <Text style={styles.loadingText}>Buscando dados da matrícula...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <MatriculaForm
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
