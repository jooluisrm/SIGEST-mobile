import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../lib/axios";
import { UserData } from "../types/auth";
import { loginRequest } from "../api/auth";

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await SecureStore.getItemAsync("user_token");
        const storedUser = await SecureStore.getItemAsync("user_data");

        if (storedToken && storedUser) {
          // Configura o token por padrão no axios para chamadas futuras
          api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar dados de autenticação do SecureStore:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const successData = await loginRequest({ email, password });
      
      if (successData.status && successData.data) {
        const userData = successData.data;
        
        // Salva no SecureStore para persistência
        await SecureStore.setItemAsync("user_token", userData.access_token);
        await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
        
        // Define o token por padrão no cabeçalho do axios
        api.defaults.headers.common["Authorization"] = `Bearer ${userData.access_token}`;
        
        setUser(userData);
      } else {
        throw new Error("Resposta inválida do servidor.");
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("user_token");
      await SecureStore.deleteItemAsync("user_data");
      
      // Remove o cabeçalho Authorization do axios
      delete api.defaults.headers.common["Authorization"];
      
      setUser(null);
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
