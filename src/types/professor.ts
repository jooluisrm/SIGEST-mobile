/**
 * Modelo de dados do Professor retornado nas listagens.
 * Mapeado a partir de ProfessorResource.
 */
export interface Professor {
  id_user: number;
  id_professor: number;
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
  matricula_adpm: string;
  codigo_disciplina: string | null;
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
 * Resposta de sucesso contendo a lista paginada de professores.
 */
export interface ProfessorsPaginatedResponse {
  status: boolean;
  code: number; // Ex: 200
  message: string;
  data: Professor[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Resposta retornada quando nenhum professor é encontrado.
 * O Laravel retorna status 200 com "Resultado não encontrado" e data = null.
 */
export interface ProfessorsEmptyResponse {
  status: boolean;
  code: 200;
  message: string; // Ex: "Resultado não encontrado"
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
