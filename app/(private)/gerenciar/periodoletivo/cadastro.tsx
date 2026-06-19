import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { PeriodoLetivoForm } from "@/components/gerenciar/periodoletivo/periodoletivo-form";
import { useCreatePeriodoLetivoMutation, usePeriodoLetivoQuery, useUpdatePeriodoLetivoMutation } from "@/api/periodoletivo";
import { CreatePeriodoLetivoRequest, UpdatePeriodoLetivoRequest } from "@/types/periodoletivo";
import axios from "axios";

export default function CadastroPeriodoLetivo() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createPeriodoLetivo, isPending: isCreating } = useCreatePeriodoLetivoMutation();
    const { mutateAsync: updatePeriodoLetivo, isPending: isUpdating } = useUpdatePeriodoLetivoMutation();
    const { data: queryData, isLoading: isLoadingQuery } = usePeriodoLetivoQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Período Letivo" : "Cadastrar Período Letivo"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: {
        course_id: number;
        name: string;
        data_inicio: string;
        data_encerramento: string;
        status: boolean;
    }) => {
        setErrorMessages({});

        // Build the payload
        const payload: any = {
            name: dados.name,
            data_inicio: dados.data_inicio,
            data_encerramento: dados.data_encerramento,
            status: dados.status,
        };

        // course_id can be sent in creation and updating
        if (!id) {
            payload.course_id = dados.course_id;
        }

        try {
            if (id) {
                await updatePeriodoLetivo({ id, payload: payload as UpdatePeriodoLetivoRequest });
                Alert.alert("Sucesso", "Período letivo atualizado com sucesso!");
            } else {
                await createPeriodoLetivo(payload as CreatePeriodoLetivoRequest);
                Alert.alert("Sucesso", "Período letivo cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar período letivo:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                // Laravel standard validation error uses HTTP 422 and a "errors" object
                if (error.response.status === 422 && responseData?.errors) {
                    setErrorMessages(responseData.errors);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar o período letivo.";
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
                <Text style={styles.loadingText}>Buscando dados do período letivo...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <PeriodoLetivoForm
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
