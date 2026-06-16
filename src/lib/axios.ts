import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Interceptor para injetar o Token em cada requisição
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync("user_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Erro ao carregar token no interceptor do Axios:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar respostas do servidor (como 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                // Se receber 401 (não autorizado), limpa as credenciais locais
                await SecureStore.deleteItemAsync("user_token");
                await SecureStore.deleteItemAsync("user_data");
                delete api.defaults.headers.common["Authorization"];
            } catch (err) {
                console.error("Erro ao limpar dados locais após 401:", err);
            }
        }
        return Promise.reject(error);
    }
);
