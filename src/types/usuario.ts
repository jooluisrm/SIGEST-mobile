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
