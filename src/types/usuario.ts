/**
 * Modelo de dados do Servidor (Usuário) retornado pela API.
 * Mapeado a partir de ServidorResource.
 */
export interface UsuarioServidor {
  id_user: number;
  id_servidor: number;
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string; // Formato "YYYY-MM-DD"
  nome_pai: string | null;
  nome_mae: string | null;
  genero: string;
  deficiencia: string | null;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  telefone: string | null;
  celular: string;
  email: string;
  cargo: string;
  setor: string;
}

/**
 * Links de paginação retornados pela API Laravel.
 */
export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/**
 * Item individual de link dentro do metadado de paginação.
 */
export interface PaginationLinkMeta {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Metadados de paginação retornados pela API Laravel.
 */
export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLinkMeta[];
  path: string;
  per_page: number; // Sempre 10 no backend
  to: number | null;
  total: number;
}

/**
 * Resposta de sucesso contendo a lista paginada de servidores/usuários.
 */
export interface UsuariosPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: UsuarioServidor[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta quando nenhum servidor/usuário é encontrado.
 * Retorna status 200 com "Resultado não encontrado" e data = null.
 */
export interface UsuariosEmptyResponse {
  status: boolean;
  code: 200;
  message: string; // "Resultado não encontrado"
  data: null;
}

/**
 * Resposta de erro de validação (ex: busca com menos de 3 caracteres).
 */
export interface ValidationResponseError {
  message: string;
  errors: {
    value?: string[];
    [key: string]: string[] | undefined;
  };
}

// Payload enviado ao cadastrar o servidor (usuário)
export interface CreateServidorRequest {
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string; // Formato YYYY-MM-DD
  nome_pai: string; // Exigido no BD!
  nome_mae: string;
  genero?: string | null; // Opcional
  deficiencia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string | null; // Opcional
  cidade: string;
  estado: string; // Ex: "SP"
  telefone: string; // Exigido no BD!
  celular: string;
  email: string;
  password?: string; // Obrigatório no cadastro
  cargo: string; // Campo específico de Servidor
  setor: string; // Campo específico de Servidor
}

// Dados do servidor retornados no 'data'
export interface ServidorData {
  id_user: number;
  id_servidor: number;
  name: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  nome_pai: string;
  nome_mae: string;
  genero: string | null;
  deficiencia: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string | null;
  cidade: string;
  estado: string;
  telefone: string;
  celular: string;
  email: string;
  cargo: string;
  setor: string;
}

// Resposta de sucesso (201 Created)
export interface CreateServidorSuccessResponse {
  status: boolean; // true
  code: number; // 201
  message: string;
  data: ServidorData;
}

// Resposta de erro de validação (422 Unprocessable Content)
export interface ServidorValidationErrorResponse {
  status: boolean; // false
  code: number; // 422
  mensagem: {
    [key in keyof CreateServidorRequest]?: string[];
  };
}

// Resposta de erro genérico do servidor
export interface ServidorGenericErrorResponse {
  status: boolean; // false
  code: number;
  message: string;
  data: null;
}

export interface GetServidorResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: ServidorData;
}

export interface UpdateServidorRequest extends Partial<Omit<CreateServidorRequest, 'password'>> {}

export interface UpdateServidorSuccessResponse {
  status: boolean;
  code: number; // 200
  message: string;
  data: ServidorData;
}

export type DeleteServidorResponse = null;

