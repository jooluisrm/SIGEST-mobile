import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { TurmaForm } from "@/components/gerenciar/turma/turma-form";
import { useCreateClassroomMutation, useClassroomQuery, useUpdateClassroomMutation } from "@/api/turma";
import { CreateClassroomRequest, UpdateClassroomRequest } from "@/types/turma";
import { CadastroTurmaFormData } from "@/schema/cadastro-turma";
import axios from "axios";

export default function CadastroTurma() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createClassroom, isPending: isCreating } = useCreateClassroomMutation();
    const { mutateAsync: updateClassroom, isPending: isUpdating } = useUpdateClassroomMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useClassroomQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Turma" : "Cadastrar Turma"
        });
    }, [id, navigation]);

    const handleClearError = (field: string) => {
        setErrorMessages((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (dados: CadastroTurmaFormData) => {
        setErrorMessages({});

        const payload: any = {
            name: dados.name,
            max_students: dados.max_students,
            shift: dados.shift,
            status: dados.status,
        };

        // period_id is only sent during creation or if required.
        // The API rules say it's required in StoreClassroomRequest.
        // We'll send it always.
        payload.period_id = dados.period_id;

        try {
            if (id) {
                await updateClassroom({ id, payload: payload as UpdateClassroomRequest });
                Alert.alert("Sucesso", "Turma atualizada com sucesso!");
            } else {
                await createClassroom(payload as CreateClassroomRequest);
                Alert.alert("Sucesso", "Turma cadastrada com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar turma:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                
                // ClassroomController returns validation errors under "mensagem" key
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
                    const msg = responseData?.message || "Ocorreu um erro ao salvar a turma.";
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
                <Text style={styles.loadingText}>Buscando dados da turma...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <TurmaForm
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
