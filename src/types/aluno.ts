/**
 * Modelo de dados do Aluno retornado pela API.
 * Mapeado a partir de AlunoResource.
 */
export interface Aluno {
  period_id: number | null;
  classroom_id: number | null;
  id: number;
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
  matricula: string;
  turma: any | null; // Tipo genérico para turma
  status: string | number;
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
 * Resposta típica para listagem paginada (sucesso com resultados).
 */
export interface AlunosPaginatedResponse {
  status: boolean;
  code: number;
  message: string;
  data: Aluno[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

/**
 * Caso especial de retorno da rota de listagem geral (/alunos)
 * quando nenhum registro existe no banco.
 */
export interface AlunosEmptyGeneralResponse {
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
