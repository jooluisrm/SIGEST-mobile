import { api } from "../lib/axios";
import { LoginRequest, LoginResponseSuccess } from "../types/auth";

/**
 * Envia as credenciais para o endpoint de login (/login) do Laravel Sanctum.
 */
export async function loginRequest(credentials: LoginRequest) {
  const response = await api.post<LoginResponseSuccess>("/login", credentials);
  return response.data;
}
