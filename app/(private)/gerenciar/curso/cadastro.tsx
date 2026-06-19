import React, { useState, useEffect } from "react";
import { Alert, View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { CursoForm } from "@/components/gerenciar/curso/curso-form";
import { useCreateCourseMutation, useCourseQuery, useUpdateCourseMutation } from "@/api/curso";
import { CreateCourseRequest, UpdateCourseRequest } from "@/types/curso";
import axios from "axios";

export default function CadastroCurso() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id } = useLocalSearchParams<{ id?: string }>();

    // Mutations & Queries
    const { mutateAsync: createCourse, isPending: isCreating } = useCreateCourseMutation();
    const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourseMutation();
    const { data: queryData, isLoading: isLoadingQuery } = useCourseQuery(id || "");

    const [errorMessages, setErrorMessages] = useState<Record<string, string[]>>({});

    useEffect(() => {
        navigation.setOptions({
            title: id ? "Editar Curso" : "Cadastrar Curso"
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
        name: string;
        number_periods: number;
        total_hours: number;
        details: string;
        status: boolean;
    }) => {
        setErrorMessages({});

        // Build the payload
        const payload: any = {
            name: dados.name,
            total_hours: dados.total_hours,
            details: dados.details || null,
            status: dados.status,
        };

        // the backend ignores changes to number_periods in update, but we can send it or omit it
        if (!id) {
            payload.number_periods = dados.number_periods;
        }

        try {
            if (id) {
                await updateCourse({ id, payload: payload as UpdateCourseRequest });
                Alert.alert("Sucesso", "Curso atualizado com sucesso!");
            } else {
                await createCourse(payload as CreateCourseRequest);
                Alert.alert("Sucesso", "Curso cadastrado com sucesso!");
            }
            router.back();
        } catch (error: any) {
            console.error("Erro ao salvar curso:", error);
            if (axios.isAxiosError(error) && error.response) {
                const responseData = error.response.data;
                if (error.response.status === 422 && responseData?.mensagem) {
                    setErrorMessages(responseData.mensagem);
                    Alert.alert(
                        "Erro de Validação", 
                        "Alguns campos possuem erros. Verifique as mensagens marcadas em vermelho no formulário."
                    );
                } else {
                    const msg = responseData?.message || "Ocorreu um erro ao salvar o curso.";
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
                <Text style={styles.loadingText}>Buscando dados do curso...</Text>
            </View>
        );
    }

    const initialData = queryData?.data;

    return (
        <CursoForm
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
