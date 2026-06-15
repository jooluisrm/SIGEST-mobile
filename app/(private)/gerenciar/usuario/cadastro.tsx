import React from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { CadastroFormPerson } from "@/components/gerenciar/cadastro-form-person";

export default function CadastroUsuario() {
    const router = useRouter();
    return (
        <CadastroFormPerson 
            tipo="usuario" 
            onSubmit={(dados) => {
                Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
                console.log(dados);
                router.back();
            }}
            onCancel={() => router.back()}
        />
    );
}
