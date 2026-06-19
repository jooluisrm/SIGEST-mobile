import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { DisciplinaForm } from "@/components/gerenciar/disciplina/disciplina-form";
import { useCreateDisciplinaMutation, useDisciplinaQuery, useUpdateDisciplinaMutation } from "@/api/disciplina";
import { CreateDisciplinaRequest, UpdateDisciplinaRequest } from "@/types/disciplina";
import { CadastroDisciplinaFormData } from "@/schema/cadastro-disciplina";
import axios from "axios";

export default function CadastroDisciplina() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createDisciplina, isPending: isCreating } = useCreateDisciplinaMutation();
    const { mutateAsync: updateDisciplina, isPending: isUpdating } = useUpdateDisciplinaMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useDisciplinaQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Disciplina" : "Cadastrar Disciplina"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: CadastroDisciplinaFormData) => {
        setErrorMessages({});

        const payload: CreateDisciplinaRequest = {
            name: dados.name,
            area_conhecimento: dados.area_conhecimento,
            carga_horaria: dados.carga_horaria,
            ementa: dados.ementa,
            classroom_id: dados.classroom_id,
            professor_id: dados.professor_id,
            status: dados.status,
        };

        try {
            if (id) {
                await updateDisciplina({ id, payload: payload as UpdateDisciplinaRequest });
                Alert.alert("Sucesso", "Disciplina atualizada com sucesso!");
            } else {
                await createDisciplina(payload);
                Alert.alert("Sucesso", "Disciplina cadastrada com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar disciplina:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                
                // Laravel backend validation errors are under "mensagem" or "errors" key
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
                    const msg = responseData?.message || responseData?.mensagem || "Ocorreu um erro ao salvar a disciplina.";
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
                <Text style={styles.loadingText}>Buscando dados da disciplina...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <DisciplinaForm
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
