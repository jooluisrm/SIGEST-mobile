import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { OfertaDisciplinaForm } from "@/components/gerenciar/ofertadisciplina/ofertadisciplina-form";
import { 
    useCreateOfertaDisciplinaMutation, 
    useOfertaDisciplinaQuery, 
    useUpdateOfertaDisciplinaMutation 
} from "@/api/ofertadisciplina";
import { CreateOfertaDisciplinaRequest, UpdateOfertaDisciplinaRequest } from "@/types/ofertadisciplina";
import { CadastroOfertaDisciplinaFormData } from "@/schema/cadastro-ofertadisciplina";
import axios from "axios";

export default function CadastroOfertaDisciplina() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createOferta, isPending: isCreating } = useCreateOfertaDisciplinaMutation();
    const { mutateAsync: updateOferta, isPending: isUpdating } = useUpdateOfertaDisciplinaMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useOfertaDisciplinaQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Oferta" : "Cadastrar Oferta"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: CadastroOfertaDisciplinaFormData) => {
        setErrorMessages({});

        const payload: CreateOfertaDisciplinaRequest = {
            disciplina_id: dados.disciplina_id,
            classroom_id: dados.classroom_id,
            professor_id: dados.professor_id,
            periodo_letivo_id: dados.periodo_letivo_id,
            status: dados.status,
        };

        try {
            if (id) {
                await updateOferta({ id, payload: payload as UpdateOfertaDisciplinaRequest });
                Alert.alert("Sucesso", "Oferta de disciplina atualizada com sucesso!");
            } else {
                await createOferta(payload);
                Alert.alert("Sucesso", "Oferta de disciplina criada com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar oferta:", error);
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
                    const msg = responseData?.message || "Ocorreu um erro ao salvar a oferta.";
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
                <Text style={styles.loadingText}>Buscando dados da oferta...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <OfertaDisciplinaForm
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
