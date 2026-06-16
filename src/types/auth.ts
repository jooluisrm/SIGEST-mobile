/**
 * Papéis de usuário disponíveis no sistema.
 */
export type UserRole = "admin" | "servidor" | "professor";

/**
 * Estrutura do usuário retornada após login bem-sucedido.
 */
export interface UserData {
  id: number;
  nome: string;
  email: string;
  access_token: string;
  token_type: string;
  role: UserRole[];
}

/**
 * Dados necessários para efetuar a tentativa de login (corpo da requisição).
 */
export interface LoginRequest {
  email: string;
  password?: string;
}

/**
 * Resposta retornada pelo backend quando as credenciais estão corretas.
 */
export interface LoginResponseSuccess {
  status: true;
  message: string;
  data: UserData;
}

/**
 * Resposta retornada quando o email ou senha são inválidos (Erro 401).
 */
export interface LoginResponseError {
  status: false;
  code: number;
  message: string;
  data: [null];
}

/**
 * Erros específicos de campo retornados pelo validador do Laravel.
 */
export interface ValidationErrors {
  email?: string[];
  password?: string[];
  [key: string]: string[] | undefined;
}

/**
 * Resposta retornada quando campos obrigatórios estão ausentes ou inválidos (Erro 422).
 */
export interface LoginResponseValidationError {
  message: string;
  errors: ValidationErrors;
}

/**
 * União de todas as respostas possíveis da rota de login.
 */
export type LoginApiResponse =
  | LoginResponseSuccess
  | LoginResponseError
  | LoginResponseValidationError;
