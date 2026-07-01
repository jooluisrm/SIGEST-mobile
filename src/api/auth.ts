import { api } from "../lib/axios";
import { 
  LoginRequest, 
  LoginResponseSuccess,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordValidateCodeRequest,
  ResetPasswordValidateCodeResponse,
  ResetPasswordCodeRequest,
  ResetPasswordCodeResponse
} from "../types/auth";

/**
 * Envia as credenciais para o endpoint de login (/login) do Laravel Sanctum.
 */
export async function loginRequest(credentials: LoginRequest) {
  const response = await api.post<LoginResponseSuccess>("/login", credentials);
  return response.data;
}

/**
 * Solicita codigo de redefinicao de senha por e-mail.
 */
export async function forgotPasswordCodeRequest(payload: ForgotPasswordRequest) {
  const response = await api.post<ForgotPasswordResponse>("/forgot-password-code", payload);
  return response.data;
}

/**
 * Valida o codigo de recuperacao enviado por e-mail.
 */
export async function resetPasswordValidateCodeRequest(payload: ResetPasswordValidateCodeRequest) {
  const response = await api.post<ResetPasswordValidateCodeResponse>("/reset-password-validate-code", payload);
  return response.data;
}

/**
 * Redefine a senha do usuario utilizando o codigo validado.
 */
export async function resetPasswordCodeRequest(payload: ResetPasswordCodeRequest) {
  const response = await api.post<ResetPasswordCodeResponse>("/reset-password-code", payload);
  return response.data;
}
